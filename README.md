# Blog-Cyber-Security

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A free, no-build, single-page blog template for security researchers —
CVE write-ups, bug bounty reports, pentest notes. Dark/terminal theme,
tag-based filtering with shareable links, a featured-posts row, a table
of contents with scroll-spy, syntax-highlighted code blocks, and a
reading-position memory — all static HTML/CSS/JS, deployed for free on
GitHub Pages. No framework, no build step, no backend: edit a JSON file
and a Markdown file, push, done.

## Features

- **Dark, terminal-inspired theme** — JetBrains Mono accents, a single
  accent color, responsive down to phone width.
- **Data-driven homepage** — hero stats, featured posts, category
  sections and tag filtering all render from `posts/posts.json`; no
  HTML/JS edits needed to publish.
- **Tag filter with shareable links** — readers can multi-select tags;
  the filter state is saved (`localStorage`) and encodable into a URL
  (`#filter=tag1,tag2`) so a filtered view can be shared directly.
- **Markdown posts** — front matter for date/author/category/co-authors,
  auto-generated table of contents, syntax highlighting (Prism.js),
  copy-to-clipboard on code blocks, "copy link to this section" on every
  heading.
- **Reading-position memory** — scrolling into a long post and coming
  back later resumes where you left off.
- **Full Screen mode** — hides the table of contents and widens the
  reading column for distraction-free reading.

## Quick start

1. **Use this template.** Click "Use this template" on GitHub (or fork
   this repo).
2. **Name your repository `<your-github-username>.github.io`.**
   This matters: the site uses root-relative asset paths in some places,
   and this naming convention is what GitHub Pages serves at your
   domain's root (`https://<username>.github.io/`) instead of a
   sub-path. If you'd rather keep a different repo name, see
   [Deploying under a sub-path](#deploying-under-a-sub-path) below.
3. **Enable GitHub Pages.** In your new repo, go to
   **Settings → Pages**, set **Source** to "Deploy from a branch",
   pick the `main` branch and the `/ (root)` folder, then **Save**.
   GitHub builds and serves the site within a minute or two.
4. **Customize it** — see the next section.
5. **Publish your first post** — see [`posts/README.md`](posts/README.md).

### Deploying under a sub-path

If your repository isn't named `<username>.github.io` (e.g. you kept
the name `Blog-Cyber-Security`), GitHub Pages serves it at
`https://<username>.github.io/<repo-name>/` instead of the domain root.
Everything in this template already uses relative paths (`style/...`,
`script/...`, `posts/...`), so it works correctly either way — the only
thing to double check is the "home" links (`a href="./"` in the header,
and the "Back Home" button), which also use a relative path and will
correctly resolve to your sub-path.

## Customization

| What                          | Where to change it                                               |
|-------------------------------|--------------------------------------------------------------------|
| **Favicon**                   | Replace `images/favicon.ico` with your own `.ico` file (same filename). |
| **Browser tab title**         | `<title>Security Research Blog</title>` in `index.html`.          |
| **Header brand** (`~/yourname$`) | `.header-title-path` text in `index.html` (near the top of `<body>`). |
| **Nav links** (resume/contact/LinkedIn/GitHub) | The `<nav class="header-nav">` block in `index.html` — swap each `href`. |
| **Name, role, tagline**       | `.hero-title` and `.hero-role` text in `index.html`.               |
| **Footer name/copyright**     | `.footer-copy` in `index.html` — the year updates itself automatically. |
| **Resume file**                | Drop a PDF at `images/resume.pdf` (or change the `href` to point elsewhere). |
| **Accent color / theme tokens** | The `:root { --accent-green: ...; }` block near the top of `style/light.css`. |
| **Google Analytics**          | Commented out at the top of `index.html`'s `<head>` — uncomment and replace `G-XXXXXXXXXX` with your own tracking ID, or delete it entirely if you don't want analytics. |

## Publishing posts

See [`posts/README.md`](posts/README.md) for the full guide: writing a
post's front matter and Markdown body, registering it in
`posts/posts.json` (title, category, tags, featured flag), and how the
homepage stats line is configured. A sample post ships with the
template (`posts/sample-post.md`) — delete it, along with its entry in
`posts/posts.json`, once you've published your own first write-up.

## Tech stack

Plain HTML/CSS/JavaScript, no build step. [marked](https://marked.js.org/)
for Markdown rendering and [Prism.js](https://prismjs.com/) for syntax
highlighting are loaded from a CDN at runtime; everything else is this
repository's own code.

## Contributing

Found a bug, or have an idea for a feature? Open an [issue](../../issues)
or a [pull request](../../pulls) — contributions are welcome.

## License

Licensed under the [GNU AGPLv3 License](LICENSE).

© 2026 thewindghost. All rights reserved.
