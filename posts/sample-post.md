---
date: 2026-01-01 09:00:00 AM
category: CVE
author: Your Name
coauthors: Jane Doe (Example Org), John Smith (Another Org)
---

# Sample Post: How to Write-Up a Finding

This is a sample post shipped with the template so you can see how the
front matter, headings, code blocks, images, and references render.
Delete this file (and its entry in `posts/posts.json`) once you've
published your first real write-up — see `posts/README.md` for the
full guide.

---

## 1. Front Matter

The block between the two `---` lines at the top of this file controls
the meta card shown above the title: publish date, update date,
category badge, author, and co-authors. Every field is optional.

## 2. Headings Build the Table of Contents

Every `#`, `##`, `###` heading in this file automatically becomes an
entry in the sidebar table of contents, with smooth-scroll and a
"copy link to this section" icon.

## 3. Code Blocks

Tag a fenced code block with a language so it gets syntax highlighting:

```http
GET /api/v1/export?user=1337 HTTP/1.1
Host: example.com
Cookie: session=...
```

```python
def is_vulnerable(response):
    return "admin" in response.text.lower()
```

## 4. Images

Reference images with an absolute URL (GitHub raw URLs work well once
you've pushed them, e.g. under `posts/image-post/<slug>/`):

```markdown
![Alt text describing the screenshot](https://raw.githubusercontent.com/you/your-repo/main/posts/image-post/sample-post/1.png)
```

## 5. Callouts

> Use a blockquote for anything you want to stand out — a vendor
> response, a disclosure timeline, or a note to the reader.

## 6. References

- [GitHub Pages docs](https://docs.github.com/en/pages)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
