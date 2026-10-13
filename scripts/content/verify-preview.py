#!/usr/bin/env python3
"""Snapshot a public site, then compare a migration preview without credentials.

python3 scripts/content/verify-preview.py baseline --base-url https://example.com
python3 scripts/content/verify-preview.py verify --base-url http://localhost:3000 \
  --canonical-origin https://example.com

Output lives in the ignored .content-local directory. For an authenticated preview,
set CONTENT_VERIFY_HEADERS_FILE to a mode-600 JSON object of HTTP request headers.
Headers are never included in reports and are only sent to the preview origin.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
BLOCKS = frozenset('address article aside blockquote br div dl dt dd figcaption figure footer h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section table td th tr ul'.split())
VOID = frozenset('area base br col embed hr img input link meta param source track wbr'.split())
CONTENTFUL = re.compile(r'(?:images|assets|downloads|videos)\.ctfassets\.net|(?:images|assets)\.contentful\.com', re.I)


def normalized(value):
    return re.sub(r'\s+', ' ', value).strip()


def comparable_prose(value):
    # The old renderer placed inline code in a block-level pre tag, introducing
    # whitespace next to punctuation. Do not discard spaces between words.
    return re.sub(r'\s*([.,;:!?()\[\]{}])\s*', r'\1', normalized(value))


def same_timestamp(left, right):
    try:
        a = datetime.fromisoformat(left.replace('Z', '+00:00'))
        b = datetime.fromisoformat(right.replace('Z', '+00:00'))
        return a.tzinfo is not None and b.tzinfo is not None and a == b and a.utcoffset() == b.utcoffset()
    except (ValueError, AttributeError):
        return False


def varies_accept(headers):
    return 'accept' in {part.strip().lower() for part in headers.get('vary', '').split(',')}


def cache_directives(headers):
    result = {}
    for part in headers.get('cache-control', '').lower().split(','):
        key, separator, value = part.strip().partition('=')
        result[key] = value.strip('"') if separator else None
    return result


def safe_html_negotiation(headers):
    if varies_accept(headers):
        return True
    directives = cache_directives(headers)
    if 'no-store' in directives:
        return True
    private = 'private' in directives and directives['private'] is None
    revalidates = ('no-cache' in directives and directives['no-cache'] is None) or (
        'must-revalidate' in directives and directives.get('max-age') == '0')
    return private and revalidates


def schema_nodes(value):
    if isinstance(value, list):
        for item in value:
            yield from schema_nodes(item)
    elif isinstance(value, dict):
        yield value
        if '@graph' in value:
            yield from schema_nodes(value['@graph'])


def url_path(value):
    url = urlsplit(value)
    return url.path or '/'


def origin(value):
    parsed = urlsplit(value)
    return f'{parsed.scheme}://{parsed.netloc}'


def validate_origin(value, label):
    parsed = urlsplit(value)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ('', '/'):
        raise ValueError(f'{label} must be an HTTP(S) origin without credentials, path, query or fragment.')
    return origin(value)


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')


class PageParser(HTMLParser):
    """Extract server-rendered content without depending on Next's RSC payload."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.title = []
        self.h1 = []
        self.body = []
        self.links = []
        self.images = []
        self.meta = {}
        self.canonical = None
        self.robots = []
        self.jsonld = []
        self.script_buffer = None

    def active(self, key):
        return any(item[1].get(key) for item in self.stack)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        flags = {'body': 'prose' in attrs.get('class', '').split(), 'article': tag == 'article', 'script': tag in ('script', 'style'), 'title': tag == 'title', 'h1': tag == 'h1'}
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.script_buffer = []
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta':
            key = attrs.get('name') or attrs.get('property')
            if key:
                self.meta[key] = attrs.get('content', '')
                if key in ('robots', 'googlebot'):
                    self.robots.append(attrs.get('content', ''))
        if self.active('body') and tag in BLOCKS:
            self.body.append(' ')
        if tag == 'a' and self.active('body') and attrs.get('href'):
            self.links.append(attrs['href'])
        if tag == 'img' and self.active('article'):
            self.images.append({key: attrs.get(key) for key in ('src', 'srcset', 'alt', 'width', 'height')})
        if tag not in VOID:
            self.stack.append((tag, flags))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == 'script' and self.script_buffer is not None:
            try:
                self.jsonld.append(json.loads(''.join(self.script_buffer)))
            except (ValueError, TypeError):
                self.jsonld.append({'_invalid': True})
            self.script_buffer = None
        if self.active('body') and tag in BLOCKS:
            self.body.append(' ')
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, value):
        if self.script_buffer is not None:
            self.script_buffer.append(value)
        if self.active('script'):
            return
        if self.active('title'):
            self.title.append(value)
        if self.active('h1'):
            self.h1.append(value)
        if self.active('body'):
            self.body.append(value)

    def result(self):
        return {'title': normalized(''.join(self.title)), 'h1': normalized(''.join(self.h1)),
                'description': self.meta.get('description'), 'canonical': self.canonical,
                'publishedTime': self.meta.get('article:published_time'),
                'ogUrl': self.meta.get('og:url'), 'ogImage': self.meta.get('og:image'),
                'twitterImage': self.meta.get('twitter:image'),
                'robots': self.robots, 'bodyText': normalized(''.join(self.body)),
                'bodyLinks': self.links, 'images': self.images, 'jsonld': self.jsonld}


class ScopedRedirect(HTTPRedirectHandler):
    def __init__(self, private_names):
        self.private_names = {name.lower() for name in private_names}

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected and origin(req.full_url) != origin(newurl):
            for key in list(redirected.headers):
                if key.lower() in self.private_names:
                    redirected.remove_header(key)
        return redirected


class Client:
    def __init__(self, base, header_file=None):
        self.base = validate_origin(base, '--base-url')
        self.headers = {}
        if header_file:
            path = Path(header_file)
            if path.stat().st_mode & 0o077:
                raise ValueError('Header file must be private (chmod 600).')
            self.headers = json.loads(path.read_text())
            if not isinstance(self.headers, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in self.headers.items()):
                raise ValueError('Header file must be a JSON object of string request headers.')

    def get(self, path, accept='text/html', binary=False):
        url = urljoin(self.base + '/', path)
        headers = {'User-Agent': 'ContentMigrationVerifier/1.0', 'Accept': accept}
        if origin(url) == origin(self.base):
            headers.update(self.headers)
        for attempt in range(3):
            try:
                response = build_opener(ScopedRedirect(self.headers)).open(Request(url, headers=headers), timeout=45)
                break
            except HTTPError as exc:
                response = exc
                if exc.code in (429, 502, 503, 504) and attempt < 2:
                    time.sleep(attempt + 1)
                    continue
                break
            except (URLError, TimeoutError, OSError) as exc:
                if attempt < 2:
                    time.sleep(attempt + 1)
                    continue
                # Do not serialize request headers, error details, or signed URLs.
                return {'status': 0, 'error': type(exc).__name__, 'path': url_path(url)}
        with response:
            data = response.read()
            # Whitelist response headers, avoiding cookies or authentication data.
            header_names = ('content-type', 'cache-control', 'vary', 'link', 'x-robots-tag', 'x-vercel-cache', 'age')
            # Multiple Vary/Link field lines are legal and must be combined;
            # selecting the last one hides middleware representation headers.
            safe_headers = {key: ', '.join(response.headers.get_all(key)) for key in header_names if response.headers.get_all(key)}
            result = {'status': response.status, 'headers': safe_headers, 'bytes': len(data)}
            if binary:
                result['sha256'] = sha256(data).hexdigest()
            else:
                result['text'] = data.decode('utf-8', errors='replace')
            return result

    def page(self, path):
        response = self.get(path)
        parser = PageParser()
        parser.feed(response.pop('text', ''))
        return {**response, **parser.result()}


def parallel_map(values, fn, workers):
    results = {}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(fn, value): value for value in values}
        for future in as_completed(futures):
            value = futures[future]
            results[value] = future.result()
    return dict(sorted(results.items()))


def read_sitemap(client):
    response = client.get('/sitemap.xml', 'application/xml')
    if response['status'] != 200:
        raise ValueError(f'Sitemap returned HTTP {response["status"]}.')
    try:
        document = ET.fromstring(response.pop('text'))
    except ET.ParseError:
        raise ValueError('Sitemap is not XML (preview may require authentication).') from None
    if document.tag.rsplit('}', 1)[-1] != 'urlset':
        raise ValueError('Expected a urlset sitemap; sitemap indexes are not supported.')
    entries = []
    for item in document:
        fields = {child.tag.rsplit('}', 1)[-1]: child.text for child in item}
        if fields.get('loc'):
            entries.append(fields)
    return {**response, 'entries': entries}


def original_image(src, base):
    url = urljoin(base, src or '')
    parsed = urlsplit(url)
    if parsed.path == '/_next/image':
        image = parse_qs(parsed.query).get('url', [''])[0]
        return urljoin(base, image)
    return url


def article_paths(sitemap):
    return sorted(url_path(item['loc']) for item in sitemap['entries']
                  if re.fullmatch(r'/experiments/[^/]+', url_path(item['loc'])))


def checksum_assets(client, pages, paths, workers):
    urls = sorted({original_image(image['src'], client.base) for path in paths
                   for image in pages[path]['images'] if image.get('src')})
    return parallel_map(urls, lambda url: client.get(url, 'image/*', binary=True), workers)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('mode', choices=('baseline', 'verify'))
    parser.add_argument('--base-url', required=True)
    parser.add_argument('--canonical-origin', help='Production URL origin, even when testing a preview.')
    parser.add_argument('--baseline-dir', type=Path, default=ROOT / '.content-local/baseline')
    parser.add_argument('--report', type=Path, help='Defaults to .content-local/verification.json.')
    parser.add_argument('--expected-experiments', type=int)
    parser.add_argument('--expected-urls', type=int)
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--expect-noindex', action='store_true', help='Require preview-wide noindex through HTML or HTTP.')
    args = parser.parse_args()
    if not 1 <= args.workers <= 16:
        parser.error('--workers must be between 1 and 16')
    if args.mode == 'verify' and not args.canonical_origin:
        parser.error('--canonical-origin is required for preview verification')
    if args.mode == 'baseline' and (args.baseline_dir / 'baseline.json').exists():
        parser.error('Baseline already exists. Use a new --baseline-dir to preserve the original evidence.')
    client = Client(args.base_url, os.getenv('CONTENT_VERIFY_HEADERS_FILE'))
    sitemap = read_sitemap(client)
    paths = sorted({url_path(item['loc']) for item in sitemap['entries']})
    experiments = article_paths(sitemap)
    print(f'Crawling {len(paths)} sitemap paths, including {len(experiments)} experiments.', flush=True)
    pages = parallel_map(paths, client.page, args.workers)
    assets = checksum_assets(client, pages, experiments, args.workers)
    stamp = datetime.now(timezone.utc).isoformat()
    snapshot = {'capturedAt': stamp, 'baseUrl': client.base, 'sitemap': sitemap, 'pages': pages, 'assets': assets}
    failures = []
    warnings = []
    checks = 0

    def check(ok, path, test, actual=None, expected=None):
        nonlocal checks
        checks += 1
        if not ok:
            failure = {'path': path, 'test': test}
            if actual is not None:
                failure['actual'] = actual
            if expected is not None:
                failure['expected'] = expected
            failures.append(failure)

    check(len(paths) == len(sitemap['entries']), '/sitemap.xml', 'unique sitemap URLs')
    if args.expected_urls is not None:
        check(len(paths) == args.expected_urls, '/sitemap.xml', 'expected URL count', len(paths), args.expected_urls)
    if args.expected_experiments is not None:
        check(len(experiments) == args.expected_experiments, '/sitemap.xml', 'expected experiment count', len(experiments), args.expected_experiments)
    for path, page in pages.items():
        check(page['status'] == 200, path, 'HTTP 200', page['status'], 200)
    for url, asset in assets.items():
        check(asset['status'] == 200, url_path(url), 'original image HTTP 200', asset['status'], 200)
        check(asset.get('headers', {}).get('content-type', '').startswith('image/'), url_path(url), 'original image MIME type', asset.get('headers', {}).get('content-type'))

    if args.mode == 'baseline':
        for path in experiments:
            page = pages[path]
            check(bool(page['bodyText']), path, 'article body captured')
            check(bool(page['images']), path, 'article hero captured')
        snapshot['findings'] = {'checks': checks, 'failures': failures}
        save_json(args.baseline_dir / 'baseline.json', snapshot)
        print(f'Baseline saved: {args.baseline_dir / "baseline.json"}; {len(failures)} failures.', flush=True)
        return 1 if failures else 0

    baseline = json.loads((args.baseline_dir / 'baseline.json').read_text())
    expected_paths = set(baseline['pages'])
    canonical_origin = validate_origin(args.canonical_origin, '--canonical-origin')
    check(set(paths) == expected_paths, '/sitemap.xml', 'sitemap path parity',
          {'missing': sorted(expected_paths - set(paths)), 'extra': sorted(set(paths) - expected_paths)})
    check(set(experiments) == set(article_paths(baseline['sitemap'])), '/sitemap.xml', 'experiment path parity')
    for item in sitemap['entries']:
        check(origin(item['loc']) == canonical_origin, url_path(item['loc']), 'sitemap production origin', origin(item['loc']), canonical_origin)

    def noindex(page):
        return 'noindex' in ','.join([*page['robots'], page.get('headers', {}).get('x-robots-tag', '')]).lower()

    def comparable_link(link):
        # Host correction is planned; preserve path/query/fragment and external URLs.
        # Browsers trim surrounding ASCII whitespace from hrefs (one legacy
        # YouTube link has a leading space). Preserve the effective destination.
        parsed = urlsplit(urljoin(baseline['baseUrl'], link.strip(' \t\n\r\f')))
        known_hosts = {urlsplit(baseline['baseUrl']).netloc, urlsplit(canonical_origin).netloc,
                       urlsplit(client.base).netloc}
        known_hosts |= {host.removeprefix('www.') for host in known_hosts}
        if parsed.netloc in known_hosts:
            return urlunsplit(('', '', parsed.path, parsed.query, parsed.fragment))
        return urlunsplit(parsed)

    for path, page in pages.items():
        if page['canonical']:
            check(origin(page['canonical']) == canonical_origin, path, 'canonical production origin', page['canonical'])
        if args.expect_noindex:
            check(noindex(page), path, 'preview noindex')
    for path in experiments:
        page = pages[path]
        old = baseline['pages'].get(path)
        if not old:
            continue
        expected_canonical = canonical_origin + path
        for field in ('title', 'h1', 'description'):
            check(page[field] == old[field], path, f'{field} parity', page[field], old[field])
        check(same_timestamp(page['publishedTime'], old['publishedTime']), path, 'publication instant and timezone parity', page['publishedTime'], old['publishedTime'])
        check(page['canonical'] == expected_canonical, path, 'article canonical', page['canonical'], expected_canonical)
        check(page['ogUrl'] == expected_canonical, path, 'Open Graph URL', page['ogUrl'], expected_canonical)
        check(comparable_prose(page['bodyText']) == comparable_prose(old['bodyText']), path, 'article text parity',
              {'previewLength': len(page['bodyText']), 'baselineLength': len(old['bodyText'])})
        check(sorted(map(comparable_link, page['bodyLinks'])) == sorted(map(comparable_link, old['bodyLinks'])), path,
              'article link parity', page['bodyLinks'], old['bodyLinks'])
        check(len(page['images']) == len(old['images']), path, 'article image count', len(page['images']), len(old['images']))
        check(not CONTENTFUL.search(json.dumps(page)), path, 'no Contentful image references')
        check(all(not item.get('_invalid') for item in page['jsonld']), path, 'valid structured data')
        article_schemas = [item for item in schema_nodes(page['jsonld']) if item.get('datePublished')]
        dates = [item['datePublished'] for item in article_schemas]
        check(any(same_timestamp(date, old['publishedTime']) for date in dates), path, 'structured publication date', dates, old['publishedTime'])
        for item in article_schemas:
            for field in ('url', 'mainEntityOfPage'):
                check(item.get(field) == expected_canonical, path, f'structured {field}', item.get(field), expected_canonical)
        if not args.expect_noindex:
            check(not noindex(page), path, 'indexable article (use --expect-noindex for protected preview)')
        for new_img, old_img in zip(page['images'], old['images']):
            new_url = original_image(new_img['src'], client.base)
            old_url = original_image(old_img['src'], baseline['baseUrl'])
            check(assets.get(new_url, {}).get('sha256') == baseline['assets'].get(old_url, {}).get('sha256'), path,
                  'image original checksum parity', assets.get(new_url, {}).get('sha256'), baseline['assets'].get(old_url, {}).get('sha256'))
            check(bool(new_img.get('alt')), path, 'image alt text')
            optimized = client.get(urljoin(client.base, new_img['src']), 'image/avif,image/webp,image/*', binary=True)
            check(optimized['status'] == 200 and optimized.get('headers', {}).get('content-type', '').startswith('image/'), path,
                  'rendered image responds', {'status': optimized['status'], 'contentType': optimized.get('headers', {}).get('content-type')})
        image_urls = {original_image(item['src'], client.base) for item in page['images']}
        for field in ('ogImage', 'twitterImage'):
            social_image = page[field] or ''
            # Local media previews use the production origin in social metadata;
            # compare the corresponding path on the preview before cutover.
            if origin(social_image) == canonical_origin:
                parsed = urlsplit(social_image)
                local_equivalent = client.base + urlunsplit(('', '', parsed.path, parsed.query, ''))
                if local_equivalent in image_urls:
                    social_image = local_equivalent
            check(social_image in image_urls, path, f'{field} uses migrated image', page[field])

    # Inspect all migrated alternate URLs, then exercise negotiation in both cache
    # orders for representative long/short content and the independent blog route.
    def alternate(path):
        md = client.get(path + '.md', 'text/html')
        api = client.get('/api' + path, 'text/markdown')
        return {'md': md, 'api': api}

    alternates = parallel_map(experiments, alternate, args.workers)
    for path, variants in alternates.items():
        for name, response in variants.items():
            headers = response.get('headers', {})
            check(response['status'] == 200, path, f'{name} status', response['status'], 200)
            check(headers.get('content-type', '').startswith('text/markdown'), path, f'{name} Markdown MIME', headers.get('content-type'))
            check(f'<{canonical_origin + path}>; rel="canonical"' in headers.get('link', ''), path, f'{name} canonical Link', headers.get('link'))
            check(varies_accept(headers), path, f'{name} Vary Accept', headers.get('vary'))
            check('no-store' in cache_directives(headers), path, f'{name} Markdown not cached', headers.get('cache-control'))
            check(not CONTENTFUL.search(response.get('text', '')), path, f'{name} no Contentful references')
            check(pages[path]['h1'] in response.get('text', ''), path, f'{name} contains title')
        check(variants['md'].get('text') == variants['api'].get('text'), path, '.md/API Markdown parity')

    representatives = sorted(experiments, key=lambda path: len(pages[path]['bodyText']))
    probes = list(dict.fromkeys(representatives[:1] + representatives[-1:] + [path for path in paths if path.startswith('/blog/')][:1]))
    cache_checks = []
    for path in probes:
        for order in (('text/html', 'text/markdown', 'text/html'), ('text/markdown', 'text/html', 'text/markdown')):
            responses = []
            for accept in order:
                response = client.get(path, accept)
                headers = response.get('headers', {})
                check(response['status'] == 200, path, f'negotiation {accept} status', response['status'])
                check(headers.get('content-type', '').startswith(accept), path, f'negotiation {accept} MIME after previous variant', headers.get('content-type'))
                if accept == 'text/html':
                    check(safe_html_negotiation(headers), path, 'HTML varies by Accept or requires private revalidation', headers)
                    check('<article' in response.get('text', ''), path, 'HTML is article, not Markdown wrapper')
                else:
                    check(varies_accept(headers), path, 'negotiated Markdown Vary Accept', headers.get('vary'))
                    check('no-store' in cache_directives(headers), path, 'negotiated Markdown not cached', headers.get('cache-control'))
                    check(f'<{canonical_origin + path}>; rel="canonical"' in headers.get('link', ''), path, 'negotiated Markdown canonical Link')
                responses.append({'accept': accept, 'status': response['status'], 'headers': headers})
            cache_checks.append({'path': path, 'responses': responses})
        wrapped = client.get('/api' + path, 'text/html')
        check(wrapped['status'] == 200 and wrapped.get('headers', {}).get('content-type', '').startswith('text/html'), path, 'API HTML wrapper preserved')

    pagination = client.page('/experiments?page=2')
    check(pagination['status'] == 200, '/experiments?page=2', 'pagination status')
    check(pagination['canonical'] == canonical_origin + '/experiments?page=2', '/experiments?page=2', 'pagination self-canonical', pagination['canonical'])
    search = client.page('/experiments?search=verification')
    check(noindex(search), '/experiments?search=verification', 'search noindex')
    missing = '/experiments/content-migration-verification-missing-page'
    for path, accept in ((missing, 'text/html'), (missing, 'text/markdown'), (missing + '.md', 'text/html'), ('/api' + missing, 'text/markdown')):
        response = client.get(path, accept)
        check(response['status'] == 404, path, f'true 404 ({accept})', response['status'], 404)

    report = {'verifiedAt': stamp, 'baseUrl': client.base, 'canonicalOrigin': canonical_origin,
              'baselineCapturedAt': baseline['capturedAt'], 'counts': {'urls': len(paths), 'experiments': len(experiments), 'originalImages': len(assets), 'checks': checks},
              'passed': not failures, 'failures': failures, 'warnings': warnings, 'cacheChecks': cache_checks,
              'snapshot': snapshot}
    output = args.report or ROOT / '.content-local/verification.json'
    save_json(output, report)
    print(f'{checks} checks; {len(failures)} failures. Report: {output}', flush=True)
    for failure in failures[:20]:
        print(f'FAIL {failure["path"]}: {failure["test"]}')
    return 1 if failures else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError) as exc:
        print(f'Verification stopped: {exc}', file=sys.stderr)
        sys.exit(2)
