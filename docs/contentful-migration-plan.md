# Contentful migration plan

October 13, 2026. Selected architecture and rollout for Hacky Experiments.

The selected authoring workflow is Markdown/Git, with Codex handling publishing and assets. Retain Next.js and store images in one R2 bucket. Download the images during the build and serve them from this website under `/media`. No custom media domain is required. Add a small publishing tool for uploads, validation and previews. This makes the content, media files and public URLs portable. A browser admin and CMS database are outside the initial build.

## Current scope

Read-only Contentful API inventory and public-site checks found:

| Item | Observed state |
| --- | --- |
| Experiments | 53 `hackyBlog` entries, all published, each with title, slug, description, body, date and hero |
| Referenced media | 53 distinct published, processed images, totaling 17,495,721 bytes, approximately 17.5 MB |
| Image formats | 32 PNG, 17 JPEG, 3 WebP, 1 AVIF |
| Experiment bodies | Paragraphs, links, H2s, lists, a blockquote, bold and inline code; no embedded entry or asset nodes in the current 53 bodies |
| Missing references | None found in the experiment dependency graph |
| Existing local blog | 13 MDX files, separate from experiments |
| Live sitemap | 80 URLs, including all 53 experiments |
| Framework | Lockfile has Next.js 16.1.6 and React 19.2.3 |
| Entire Contentful space | 142 entries across 9 models; 138 asset records, of which 134 contain file metadata, totaling about 68.1 MB |

The shared space contains other projects, including two entries with unpublished changes and six draft assets. Migrating this website does not establish that the whole Contentful account can be closed. Preserve those records and identify their consumers before retiring the space. Four asset records lack files and must be recorded as empty records, not silently counted as successful file exports.

## Content architecture

Proposed layout:

```text
content/experiments/<slug>.md      Published experiment content
content/blog/*.mdx                Existing blog, unchanged initially
content/media.json                Asset identities and file metadata
lib/content/                     Validated model and reader functions
scripts/content/                 Import, upload, validate and preview tools
```

Frontmatter should contain a stable ID, original Contentful ID, title, slug, description, original publication timestamp, genuine modification timestamp when known, publication status, hero ID and optional project URL, repository URL and tags. Preserve timezone information. Do not invent missing metadata or replace publication dates with migration dates.

Use ordinary Markdown for prose. Reserve MDX for posts that actually need React components. Keep `/experiments/<slug>` and `/blog/<slug>` as separate public collections. Next supports Markdown and MDX with Server Components; a CMS is not required to produce crawlable HTML. [Next.js MDX guide](https://nextjs.org/docs/app/guides/mdx)

One content reader should supply the experiment list, article renderer, metadata, sitemap, search and Markdown endpoints. Validate required fields, unique slugs, dates and asset references before producing a deployable build. Unknown conversion nodes and unresolved references should stop the migration with a report.

Git supplies change history and rollback. Publishing is an explicit reviewed merge/deploy; a saved draft is not a published post. Draft source and images may be public in this open-source repository. Publication status controls whether posts appear on the website, in search, feeds and sitemaps. Future scheduled publishing needs a scheduler that actually triggers deployment; a future date alone does not do that.

## Publishing workflow

The user works through ordinary requests to Codex, while the underlying commands remain usable directly from a terminal. These are planned capabilities, not existing commands:

| Request | Codex workflow |
| --- | --- |
| Draft a new experiment | Create Markdown and metadata, check project claims, and prepare a local or deployment preview. |
| Add or replace an image | Upload to the public bucket, record dimensions and checksum, reuse identical files, and preview the card and article crops. |
| Review the post | Show the rendered preview and Git diff; validate metadata, links, asset references and publication state. |
| Publish the post | On an explicit publish request, verify public assets, commit the content and manifest together, deploy, then verify the live article and image URLs. |
| Revise or roll back | Make a reviewable content change or restore the previous content revision and retained asset keys. |

The tools should support repeatable uploads, readable errors and structured results that identify the changed files and preview or live URLs. A failed deployment must not be reported as published. Drafting does not publish an article. All images, including images for draft posts, use the same public bucket. No additional MCP server is needed initially; repository instructions and a small CLI are sufficient.

## Alternatives considered

| Option | Recommendation |
| --- | --- |
| Markdown and a content CLI | Selected. Codex handles authoring, assets and publishing, with few dependencies and straightforward backups. |
| Keystatic | Revisit only if a browser editor becomes useful. Its standard image field saves to local files or Git; R2 upload and media browsing require additional integration. Test its Next.js compatibility and Markdown round-trip fidelity before adoption. |
| Payload with Postgres and R2 | Revisit if a full admin, editorial roles or collaborative workflows become necessary. It is the strongest full CMS candidate for this Next.js app, but introduces database migrations, authentication, backups and more maintenance. |
| TinaCMS | Credible visual editing alternative; self-hosting adds Git integration, authentication and a database. Less attractive for the current small authoring workflow. |

Keystatic documents local and GitHub modes, MDX and image fields. Its older Next installation guide and newer repository compatibility work make a trial more useful than assuming compatibility. [Keystatic MDX](https://keystatic.com/docs/fields/mdx), [GitHub mode](https://keystatic.com/docs/github-mode), [image field](https://keystatic.com/docs/fields/image), [Next integration](https://keystatic.com/docs/installation-next-js)

Payload provides drafts, versions, APIs and an MCP plugin. Its standard rich text is database-backed editor JSON, so Markdown would normally be an export rather than the source of truth. The release list inspected shows stable 3.90.2 and a v4 beta; use a tested stable release. Its documented Next 16 requirement starts at 16.2.6, above this repository's lockfile version. Verify the stable version's requirements before adoption. [Payload drafts](https://payloadcms.com/docs/versions/drafts), [MCP plugin](https://payloadcms.com/docs/plugins/mcp), [releases](https://github.com/payloadcms/payload/releases), [installation](https://payloadcms.com/docs/getting-started/installation), [Tina self-hosting](https://tina.io/docs/self-hosted/overview)

## Asset storage and serving

Use one R2 bucket for all images. The authoring tool uploads original bytes with a content hash in the filename. Before a build, the preparation command downloads any missing files into `public/media/`, verifies their SHA-256 checksums, and fails if an image is missing or corrupt. Next.js deploys those files with the website and optimizes responsive sizes through `next/image`.

```text
Codex upload -> R2 bucket -> build downloads -> public/media -> website readers
```

A public image URL uses the existing website domain, such as `/media/experiments/shiptiffin/hero.<hash>.png`. Changing bytes creates a new key, so existing cached files remain valid. The domain belongs to the website owner; changing object storage later does not change reader-facing image URLs.

`content/media.json` records relative object keys, dimensions, descriptions, content types and checksums. It contains no access keys or account endpoints. R2 credentials are used by local upload tools and by builds that need to download images. They are never sent to browsers. A build can use a read-only bucket key; authoring needs object read/write. A local staged copy lets the build run without storage credentials.

Downloaded files remain ignored by Git, but are included in the website deployment. A fresh checkout needs R2 configuration and `npm run content -- prepare` before local preview; `npm run build` runs preparation automatically. The entire current image collection is only about 17.5 MB, making this straightforward.

All images, including images intended for draft posts, are deliberately public once deployed. No private bucket, asset promotion, signed-image URLs or custom-domain setup is required. An optional `NEXT_PUBLIC_MEDIA_BASE_URL` lets Next.js fetch originals from a public CDN instead of downloading them at build time. In both modes the default Next.js image optimizer serves responsive versions through the website host and uses its bandwidth.

R2 remains replaceable through its S3-compatible interface. Image optimization uses the existing Next.js mechanism. [R2 S3 API](https://developers.cloudflare.com/r2/api/s3/api/), [Next Image](https://nextjs.org/docs/app/api-reference/components/image)

The usual remote-storage alternative passes a stable public S3/R2 image URL to `next/image`. On a cache miss, Next.js fetches that original and produces the requested size; visitors still receive the optimized image from the website host. This does not require build-time downloads. The selected build-copy approach is suitable for this small, Git-published collection and makes each deployment independent of R2 at request time. Both approaches use the same optimizer. [Vercel image delivery and cache keys](https://vercel.com/docs/image-optimization)

Keep original bytes, content-hashed keys, recorded dimensions, meaningful alt text, responsive `sizes`, a limited quality setting and long cache lifetimes. Replacements get new keys. Cache hits avoid repeated transformations, but delivery still consumes hosting bandwidth. Current Vercel pricing meters transformations and cache operations separately from delivery; the documented 5,000-transformation allowance is for Hobby, while Pro uses usage credits. These are team-level billing concerns, not a limit on how many source images may be stored. [Image usage and pricing](https://vercel.com/docs/image-optimization/limits-and-pricing), [Pro plan](https://vercel.com/docs/plans/pro-plan)

## Preview verification

All 53 published experiments and their 53 original images have been imported. R2 uploads were read back and checked by SHA-256; a clean local download restored every image. The production build succeeds without Contentful credentials. The local production preview passed 2,297 checks with no failures or warnings: all 80 sitemap URLs, content and link parity, publication timestamps, metadata, structured data, original and optimized images, Markdown endpoints, search, pagination and missing-page responses. Desktop and mobile previews were inspected. Production has not switched; Vercel edge behavior remains a deployment check.

Run `npm run content:verify -- verify --base-url http://localhost:3000 --canonical-origin https://www.hackyexperiments.com --expected-experiments 53 --expected-urls 80` against the built local server. The original baseline and detailed verification report remain under ignored `.content-local/`.

## SEO and experience improvements

Keep the existing article paths, meaningful content, publication dates, internal links and server-rendered HTML. Preserve the existing `.md`, `Accept: text/markdown` and API representations. A CMS replacement alone does not improve rankings.

The current site offers concrete improvements:

1. Align canonical, Open Graph and sitemap URLs with the existing `www.hackyexperiments.com` redirect destination. The source currently uses the bare domain. Check Search Console's selected canonicals before finalizing the correction. [Canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
2. Give each valid pagination page its own canonical; page two currently points to page one. Keep crawlable next/previous links and exclude internal search variants from indexing. [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
3. Preserve original dates and use genuine modification dates. Use appropriate article structured data, author information and breadcrumbs. Do not invent ratings or freshness. [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
4. Canonicalize alternate Markdown representations to their article and test HTML/Markdown cache separation, including `Vary: Accept` where negotiated. The existing representations lack those protections.
5. Improve descriptive alt text and responsive crops. Only prioritize the actual above-the-fold image; current first-page logic prioritizes every card. Preserve uncropped screenshots in article bodies.
6. After parity, add project/repository buttons, related experiments, useful tags, body search, heading anchors and a table of contents for long posts. Improve mobile spacing, keyboard navigation and code copying while retaining the site's personality.

We cannot configure redirects on Contentful-owned image hostnames. Move every site-controlled image reference, including social previews, to the website media paths; retain old assets during the transition where possible. Image search may need to recrawl the replacements. Page parity can be tested; zero ranking fluctuation cannot be promised. [Google image guidance](https://developers.google.com/search/docs/appearance/google-images)

## Rollout and acceptance gates

| Phase | Work | Completion evidence |
| --- | --- | --- |
| 1. Preserve and baseline | Export scoped entries, raw Rich Text, models, publication states and original media. Separately back up shared-space data privately, retaining published snapshots and unpublished changes as distinct states. Snapshot existing URLs, rendered content, metadata, screenshots and Search Console performance. | Counts and checksums match; backup restores successfully; shared-space data preserved. |
| 2. Build a representative preview | Convert a long post, a short post, lists, links and inline code. Add the validated reader and media manifest. Test the chosen publishing workflow. | No lost text or formatting; working preview; acceptable mobile and desktop crops. |
| 3. Migrate all experiments | Convert all 53 posts, upload and verify 53 images, then stage them for the website build, update every reader and alternate endpoint, then crawl the preview. Freeze Contentful edits briefly and repeat the export/diff immediately before cutover. | All 53 article paths and all other existing sitemap routes preserved; zero missing images or references; production build succeeds without Contentful credentials or requests to Contentful. |
| 4. Switch and verify | Deploy the source migration with equivalent presentation. Verify public pages, metadata, optimized image requests, sitemap and Markdown behavior. | New asset URLs visibly used in production; no draft leaks; rollback deployment and prior assets available. |
| 5. Improve and retire | Ship measured SEO/UI changes separately; compare indexing, traffic, errors and performance over several weeks. Audit other consumers before cancelling Contentful. | No unexplained content loss or crawl errors; independent backups proven; all remaining Contentful dependencies accounted for. |

Use representative visual checks plus an automated crawl of every article, image and internal link. Compare normalized text, link targets, heading structure, lists, metadata and original dates. Scan raw hyperlinks, site source and generated HTML/Markdown for Contentful CDN URLs; typed asset links alone are not a complete media inventory. Historical URLs may remain in the ignored migration manifest, but public representations must use the replacement files. Block a release on incomplete sitemap generation instead of silently emitting a reduced sitemap. Capture mobile performance before and after under identical conditions; use field data for real user outcomes when available.

Check unknown routes too. Next.js can return `200` with `noindex` after streaming begins; validate that missing content is excluded and prefer real `404` responses through static route validation or early existence checks. [Next not-found behavior](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)

Keep the content migration and visual redesign independently deployable. Google recommends changing major elements sequentially, making attribution and rollback easier. [Google migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

## Implementation touchpoints

- `lib/contentful.ts`: replace experiment fetching with the validated file reader.
- `lib/rich-text-to-markdown.ts`: use only as scaffolding; it currently drops unresolved embeds and falls through on unknown nodes. Write strict conversion checks for the actual inventory.
- `app/(main)/experiments/page.tsx` and `[slug]/page.tsx`: preserve routes and rendering before redesign.
- `app/api/experiments/[slug]/route.ts`, `proxy.ts` and `lib/markdown-response.ts`: preserve representations and correct caching/canonical behavior.
- `app/sitemap.ts`, `lib/site-config.ts` and `next.config.ts`: use one publication list, consistent primary host and the owned image hostname.
- `app/feed.xml/route.ts`: currently blog-only; preserve its subscription behavior and consider a separate experiments feed later.
- `AGENTS.md` and publishing documentation: update only when the migration becomes the accepted publishing workflow.

The initial deliverable should be a complete preview with all 53 migrated experiments and verified assets. Production cutover follows parity checks; shared-space deletion is a later, separate decision.
