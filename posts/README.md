# Publishing a Post (A → Z)

The homepage (hero, featured row, category sections, tags, filter) renders
entirely from `posts/posts.json` — you never need to touch `index.html` or
the JavaScript to publish a new post.

## 1. Write the post

Create a new `.md` file in this `posts/` directory. The filename becomes
part of the post's URL: `yoursite.com/#your-file-name` (no `.md`
extension, no spaces).

If the post has screenshots, put them under
`posts/image-post/<post-slug>/` and reference them with an absolute URL
(a GitHub raw URL works well once the images are pushed):

```markdown
![Alt text](https://raw.githubusercontent.com/you/your-repo/main/posts/image-post/your-post/1.png)
```

### Front matter

At the top of the file, between two `---` lines:

```markdown
---
date: 2026-01-15 09:30:00 PM
updated: 2026-01-20 10:00:00 AM
category: CVE
author: Your Name
coauthors: Jane Doe (Example Org), John Smith (Another Org)
---

# Post Title

Body content...
```

Every field is optional — a missing field simply doesn't render in the
meta card at the top of the post:

| Field       | Rendered as                                                   |
|-------------|----------------------------------------------------------------|
| `date`      | "Published dd/mm/yyyy" badge                                   |
| `updated`   | "Updated dd/mm/yyyy" badge (only shown if present)              |
| `category`  | A badge (this is **different** from `category` in `posts.json` — see §3) |
| `author`    | "Posted by ..." line (defaults to "Your Name" if omitted)       |
| `coauthors` | Comma-separated list of co-authors                              |

### Writing the body

- `#` / `##` / `###` headings automatically build the sidebar table of
  contents.
- Tag fenced code blocks with a language (` ```http `, ` ```python `,
  ` ```php `, ` ```js `, ...) for syntax highlighting; an untagged block
  renders as plain text.
- Use absolute image URLs, not relative paths.

## 2. Register the post in `posts.json`

Open `posts/posts.json` and add an entry to the `posts` array (position
in the array only matters within the same category — it sets the
display order):

```json
{
  "filename": "your-file.md",
  "title": "Short, descriptive title",
  "category": "CVE",
  "image": "",
  "tags": ["XSS"],
  "featured": false
}
```

| Field      | Meaning |
|------------|---------|
| `filename` | The `.md` file in `posts/`. You can also paste a full `https://...` URL here (e.g. a report hosted on HackerOne) — it then opens in a new tab instead of being rendered as markdown. |
| `title`    | Shown on the homepage card/listing. Keep it short — avoid repeating information already in `tags` (an identifier, a CVE number) so cards in the same category stay roughly the same length. |
| `category` | Which homepage section the post belongs to (e.g. `/cve`, `/bug-bounty`). This is also what drives the stats line (see §3). This is **not** the same as the `category` field in the post's own front matter, which only shows a badge on that post's page. |
| `image`    | Leave as `""` if you don't have a thumbnail. |
| `tags`     | Shown under the post and used by the "Filter by tag" control. For a CVE, put the CVE ID as the first tag — it's used as the label on the featured card. |
| `featured` | `true` puts the post in the "// featured" row at the top of the homepage. |

### Example — a new CVE write-up

```json
{
  "filename": "cve-2026-00001.md",
  "title": "SQL Injection via Export Endpoint",
  "category": "CVE",
  "image": "",
  "tags": ["CVE-2026-00001", "SQL Injection"],
  "featured": true
}
```

## 3. The "Published: ..." stats line

The stats line at the top of the homepage is computed automatically from
every post's `category` field — publishing another post in an existing
category just increments the count, no further changes needed.

Two optional config keys sit alongside `posts` in `posts.json`:

```json
{
  "statsExclude": ["Misc"],
  "statsLabels": {
    "CVE": "CVEs",
    "Bug Bounty": "Bug Bounty Reports"
  },
  "posts": [ ... ]
}
```

- `statsExclude` — categories listed here are left out of the stats line
  (the posts are still counted in the overall "Write-ups" total).
- `statsLabels` — a nicer display name for a category; anything not
  listed here just shows its raw category name.
- A brand-new category with no entry in either key shows up in the
  stats line automatically, under its own name.

## 4. Publish checklist

- [ ] Wrote the `.md` file under `posts/`, with front matter if needed.
- [ ] Uploaded any images under `posts/image-post/<slug>/`.
- [ ] Added an entry to `posts/posts.json`: `filename`, `title` (short),
      `category`, `tags`, `featured`.
- [ ] New category? Check whether it needs a label in `statsLabels` or
      should be left out via `statsExclude`.
- [ ] Reloaded the homepage: the card shows up in the right section,
      tags are correct, the tag filter finds it, and the featured row
      (if applicable) shows it at the top.
