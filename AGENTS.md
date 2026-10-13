# Experiment publishing

Keep answers concise. Experiments live in `content/experiments/*.md` and appear at `/experiments/<slug>`. The separate MDX blog stays in `content/blog/`. Contentful is used only by the one-time import tool.

## Credentials and configuration

Use the repository's ignored `.env.local`, mode `600`. See `.env.example` for variable names. Never print, commit, or put secret values in docs, manifests, command arguments or chat. R2 credentials are for tooling/builds only, never client components or `NEXT_PUBLIC_` variables. Only public site/media URL settings may use that prefix.

Images use one R2 bucket. The build downloads missing files into ignored `public/media/` and the website serves them under `/media/`. All images are intended to be public. No private bucket or custom media domain is needed.

## Writing

Read recent experiment Markdown before drafting. Match the project's substance and length. Use the project name as the title, a concise card description, a lowercase hyphenated slug and the intended publication date. Quote date values in YAML and preserve timezone information. Include a direct project/repository link near the beginning. Explain the concrete problem, implementation, interesting mechanism and material limits.

Check claims against the owning repository and public site. Verify pricing when mentioned. Documentation and tests are not proof of adoption or production reliability. Avoid invented anecdotes, em dashes and generic conclusions. Use short functional H2s for longer posts.

Prefer a real 3:2 landscape hero with a centered subject and generous margins. Preview both the card and article crops. Provide useful image descriptions. Never overwrite an immutable asset with different bytes; create a new ID/key and update the post.

## Commands

```sh
npm run content -- add-image /path/to/hero.png --id project-hero --title "Project hero" --description "A useful description"
npm run content -- new project-slug --title "Project" --description "One sentence." --hero project-hero
npm run content -- validate --files
npm run content -- prepare
npm run dev
npm run test:content
npm run build
```

New posts start with `status: draft` and are excluded from published pages and the sitemap. Their source and images may be public; there is no confidential draft system. `npm run content -- publish project-slug` verifies its stored hero and changes the source status. It does not commit, deploy or claim the article is live.

Publish/deploy when the user asks. Review the diff, run relevant checks, deploy a preview and verify article URLs, media and SEO before a production cutover. Keep publication dates unchanged during migrations. Verify the actual deployed page before reporting a change live.

## Import and verification

```sh
npm run content:import -- --expected-count 53
npm run content:upload
python3 scripts/content/verify-preview.py baseline --base-url https://www.example.com
python3 scripts/content/verify-preview.py verify --base-url http://localhost:3000 --canonical-origin https://www.example.com
```

Import reads published Contentful entries and original assets; it never writes to Contentful. Raw snapshots, migration reports and source URLs stay in ignored `.content-local/`. Existing differing files require an explicit overwrite flag. Do not remove the old Contentful space or unrelated projects as part of this site's migration.
