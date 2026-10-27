let themeLink, tocList, postTime;
let allPosts = [];
let currentFetchController = null;

// Copy Buttons
function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('#markdown-content pre');

    codeBlocks.forEach((pre) => {
        if (pre.querySelector('.copy-btn')) return;

        // Wrap pre in a relative container
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.innerHTML = svgCopy();
        btn.title = 'Copy code';

        Object.assign(btn.style, {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            padding: '6px 8px',
            cursor: 'pointer',
            zIndex: '10',
            lineHeight: '0',
        });

        btn.addEventListener('click', () => {
            const code = pre.querySelector('code');
            const raw = code ? code.textContent : pre.textContent;

            const txt = document.createElement('textarea');
            txt.innerHTML = raw;
            const text = txt.value;

            navigator.clipboard.writeText(text).then(() => {
                btn.innerHTML = svgCheck();
                setTimeout(() => btn.innerHTML = svgCopy(), 1500);
            });
        });

        wrapper.appendChild(btn); // append to wrapper, NOT pre
    });
}

function svgCopy() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        style="color:#c7d2db">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`;
}

function svgCheck() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="#39d98a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;
}

// Initialize DOM elements
function initializeElements() {
    themeLink = document.getElementById("themeStylesheet");
    postTime = document.getElementById("post-time");

    tocList = document.querySelector("#toc ul");
    if (!tocList) {
        const tocContainer = document.getElementById("toc");
        if (tocContainer) {
            tocList = document.createElement("ul");
            tocContainer.appendChild(tocList);
        }
    }
}

function getRandomRecommendations(currentSlug, count = 3) {
    const others = allPosts.filter(
        (p) => p.filename && p.filename.replace(".md", "") !== currentSlug
    );
    return others.sort(() => Math.random() - 0.5).slice(0, count);
}

function renderRecommendations(currentSlug) {
    const recs = getRandomRecommendations(currentSlug);
    const main = document.querySelector("main");
    const old = document.getElementById("recommendations");

    if (old) old.remove();
    if (!recs.length) return;

    const sec = document.createElement("section");
    sec.id = "recommendations";

    const title = document.createElement("p");
    title.className = "read-more-title";
    title.textContent = "Read More";
    sec.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "read-more-grid";

    recs.forEach((r) => {
        const a = document.createElement("a");
        a.href = `#${r.filename.replace(".md", "")}`;
        a.className = "read-more-card";
        const tag = r.category || "Post";
        a.innerHTML = `${r.title}<span class="read-more-tag">${tag}</span>`;
        grid.appendChild(a);
    });

    sec.appendChild(grid);
    if (main) main.appendChild(sec);
}

function ensureMarkdownContainer() {
    let container = document.getElementById("markdown-content");
    const main = document.querySelector("main");

    if (!container && main) {
        container = document.createElement("div");
        container.id = "markdown-content";
        main.appendChild(container);
    }
    return container;
}

function switchTheme(cssFile) {
    if (themeLink) {
        themeLink.setAttribute("href", cssFile);
        localStorage.setItem("theme", cssFile);
    }
}

function getPostFromURL() {
    const hash = window.location.hash;
    if (!hash || hash.startsWith("#filter=")) return null;
    const postName = hash.substring(1);
    return postName ? `posts/${postName}.md` : null;
}

function loadMarkdown() {
    const saved = localStorage.getItem("theme");
    if (saved && themeLink) themeLink.href = saved;

    const toggleBtn = document.getElementById("toggleWidthBtn");
    const toc = document.getElementById("toc");
    const container = ensureMarkdownContainer();
    if (!container) return;

    const file = getPostFromURL();
    const main = document.querySelector("main");

    if (!file) {
        if (main) main.style.display = "none";
        if (toc) toc.style.display = "none";
        if (toggleBtn) toggleBtn.style.display = "none";

        document.querySelectorAll(".section-container section").forEach((sec) => {
            sec.style.display = "block";
        });
        container.innerHTML = "";

        const oldRec = document.getElementById("recommendations");
        if (oldRec) oldRec.remove();

        // Coming back to the homepage (possibly via a #filter= share link) —
        // re-sync the tag filter pills/listing to match.
        applyFiltersFromHash();
        return;
    }

    loadPost(file, container, main, toc, toggleBtn);
}

async function loadPost(file, container, main, toc, toggleBtn) {

    marked.use({
    renderer: {
        code({ text, lang }) {
            const language = lang && Prism.languages[lang] ? lang : 'plaintext';
            const highlighted = Prism.languages[language]
                ? Prism.highlight(text, Prism.languages[language], language)
                : text;
            return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`;
            }
        }
    });

    if (currentFetchController) {
        currentFetchController.abort();
    }
    currentFetchController = new AbortController();

    try {
        if (toggleBtn) toggleBtn.style.display = "inline-block";

        const res = await fetch(file, {
            cache: "no-store",
            signal: currentFetchController.signal
        });

        if (!res.ok) throw new Error("File not found");
        const md = await res.text();

        const { metadata, content } = extractFrontMatter(md);

        if (postTime) {
            const dt = metadata.date ? parseCustomDate(metadata.date) : null;
            const dateStr = dt && !isNaN(dt.getTime())
                ? dt.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' })
                : null;

            const updatedStr = metadata.updated
                ? parseCustomDate(metadata.updated)?.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' })
                : null;

            const category = metadata.category || '';
            const author = metadata.author || 'Your Name';
            const coauthors = metadata.coauthors ? metadata.coauthors.split(',').map(s => s.trim()) : [];
            const initials = author.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

            postTime.innerHTML = `
                <div class="post-meta-card">
                    <div class="post-meta-badges">
                        ${category ? `<span class="badge badge-blue">${category}</span>` : ''}
                        ${dateStr ? `<span class="badge badge-green">Published ${dateStr}</span>` : ''}
                        ${updatedStr ? `<span class="badge badge-amber">Updated ${updatedStr}</span>` : ''}
                    </div>
                    <div class="post-meta-author">
                        <span class="author-avatar">${initials}</span>
                        <span>Posted by <strong>${author}</strong></span>
                    </div>
                    ${coauthors.length ? `
                    <div class="post-meta-coauthors">
                        Report co-authors: ${coauthors.map(c => `<span class="coauthor">${c}</span>`).join(', ')}
                    </div>` : ''}
                </div>
            `;
            postTime.style.display = 'block';
        }

        const html = marked.parse(content);
        container.innerHTML = html;

        container.classList.remove("full-width");
        container.classList.add("normal-width");

        generateTOC();
        setupTOCScrollSpy();

        const currentSlug = window.location.hash.substring(1);
        renderRecommendations(currentSlug);

        addCopyButtons();
        restoreScrollPosition(currentSlug);

        if (main) main.style.display = "block";
        if (toc) toc.style.display = "block";

        document.querySelectorAll(".section-container section").forEach((sec) => {
            sec.style.display = "none";
        });

    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('Fetch aborted');
            return;
        }

        console.error("Error loading post:", err);

        if (main) main.style.display = "none";
        if (toc) toc.style.display = "none";
        if (toggleBtn) toggleBtn.style.display = "none";

        document.querySelectorAll(".section-container section").forEach((sec) => {
            sec.style.display = "block";
        });
        container.innerHTML = `<p style="color:red;">File not found.</p>`;

        const oldRec = document.getElementById("recommendations");
        if (oldRec) oldRec.remove();
    } finally {
        currentFetchController = null;
    }
}

function parseCustomDate(dateStr) {
    const parts = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s+(AM|PM)/i);
    if (!parts) return new Date(dateStr); // Fallback

    let [_, year, month, day, hour, min, sec, meridiem] = parts;
    hour = parseInt(hour);

    if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;

    return new Date(`${year}-${month}-${day}T${hour.toString().padStart(2,'0')}:${min}:${sec}`);
}

function generateTOC() {
    if (!tocList) return;

    tocList.innerHTML = "";

    const content = document.getElementById("markdown-content");
    if (!content) return;

    const headings = content.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length === 0) return;

    const usedIds = new Set();

    headings.forEach((h) => {
        const text = h.textContent;
        let id = slugify(text);
        let counter = 1;

        while (usedIds.has(id)) {
            id = `${slugify(text)}-${counter}`;
            counter++;
        }

        h.id = id;
        usedIds.add(id);

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${id}`;
        a.textContent = text;
        li.appendChild(a);
        tocList.appendChild(li);

        if (h.tagName === "H2") li.style.marginLeft = "0.5em";
        if (h.tagName === "H3") li.style.marginLeft = "1em";
        if (h.tagName === "H4") li.style.marginLeft = "1.5em";
        if (h.tagName === "H5") li.style.marginLeft = "2em";
        if (h.tagName === "H6") li.style.marginLeft = "2.5em";
    });
}

function setupTOCScrollSpy() {
    const headings = document.querySelectorAll('#markdown-content h1, #markdown-content h2, #markdown-content h3, #markdown-content h4');
    const tocLinks = document.querySelectorAll('#toc a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(a => a.classList.remove('active'));
                const active = document.querySelector(`#toc a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '0px 0px -70% 0px' });

    headings.forEach(h => observer.observe(h));
}

function slugify(text) {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function scrollHandler() {
    const btn = document.getElementById("scrollToTop");
    if (!btn) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.style.display = y > 200 ? "block" : "none";
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Remember how far into a post the reader scrolled, so coming back to a
// long write-up later (or after a reload) resumes where they left off
// instead of starting back at the top.
function scrollPositionKey(slug) {
    return `csblog:scrollpos:${slug}`;
}

function saveScrollPosition() {
    try {
        const hash = window.location.hash;
        if (!hash || hash.startsWith("#filter=")) return;
        const slug = hash.substring(1);
        localStorage.setItem(scrollPositionKey(slug), String(window.scrollY));
    } catch (e) {
        // localStorage unavailable — ignore
    }
}

let scrollSaveTimer = null;
function onScrollSavePosition() {
    if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(saveScrollPosition, 300);
}

function restoreScrollPosition(slug) {
    if (!slug) return;
    try {
        const saved = localStorage.getItem(scrollPositionKey(slug));
        if (saved === null) return;
        const y = parseInt(saved, 10);
        if (!isNaN(y) && y > 0) {
            setTimeout(() => window.scrollTo(0, y), 50);
        }
    } catch (e) {
        // localStorage unavailable — ignore
    }
}

document.addEventListener("click", function(e) {
    if (e.target.tagName === "A" && e.target.closest("#toc")) {
        const targetId = e.target.getAttribute("href").substring(1);
        const el = document.getElementById(targetId);

        if (el) {
            window.scrollTo({
                top: el.offsetTop - 20,
                behavior: "smooth"
            });
            e.preventDefault();
        }
    }
});

window.addEventListener("hashchange", () => {
    loadMarkdown();
});

function extractFrontMatter(md) {
    const regex = /^---\s*[\r\n]+([\s\S]+?)[\r\n]+---/;
    const match = md.match(regex);

    let metadata = {};
    let content = md;

    if (match) {
        const yaml = match[1];
        content = md.slice(match[0].length);
        yaml.split("\n").forEach((line) => {
            const [key, ...rest] = line.split(":");
            if (key && rest.length > 0) {
                metadata[key.trim()] = rest.join(":").trim();
            }
        });
    }

    return { metadata, content };
}

function categoryToId(category) {
    return category.toLowerCase().replace(/[^a-z0-9]/g, "") + "-list";
}

function formatCategoryTitle(category) {
    return category.replace(/_/g, " ");
}

function createCopyLinkIcon(slug) {
    const img = document.createElement("img");
    img.src = "https://img.icons8.com/?size=20&id=1BYH0ZFsjeIy&format=png&color=7D8B99";
    img.alt = "Copy link";
    img.className = "copy-link-icon";
    img.style.cursor = "pointer";
    img.style.marginLeft = "6px";
    img.style.width = "16px";
    img.style.height = "16px";
    img.style.verticalAlign = "middle";
    img.title = "Copy link to this section";

    img.addEventListener("click", (e) => {
        e.stopPropagation();
        const url = `${location.origin}${location.pathname}#${slug}`;
        navigator.clipboard.writeText(url);
        img.title = "Copied!";
        setTimeout(() => {
            img.title = "Copy link to this section";
        }, 1200);
    });

    return img;
}

function createCategorySectionAtTop(category) {
    const sectionContainer = document.querySelector('.section-container');
    if (!sectionContainer) return;

    const section = document.createElement('section');
    const h2 = document.createElement('h2');
    const listing = document.createElement('div');

    const titleText = formatCategoryTitle(category);
    const slug = slugify(titleText);
    h2.id = slug;
    h2.className = 'path-head';

    const name = document.createElement('span');
    name.className = 'path-name';
    name.textContent = titleText;
    h2.appendChild(name);

    const count = document.createElement('span');
    count.className = 'count';
    h2.appendChild(count);

    const copyIcon = createCopyLinkIcon(slug);
    h2.appendChild(copyIcon);

    listing.className = 'listing';
    listing.id = categoryToId(category);

    section.appendChild(h2);
    section.appendChild(listing);
    sectionContainer.appendChild(section);
}

// Stats line is built from posts.json's own `category` field — no extra
// field needed. `statsExclude`/`statsLabels` are read from posts.json's
// top-level config: list a category in statsExclude to leave it out of
// the line entirely (it's still counted in the "Write-ups" total), and
// give it an entry in statsLabels to show a nicer name than the raw
// category string.
function renderHeroStats(posts, statsExclude, statsLabels) {
    const el = document.getElementById("heroStats");
    if (!el) return;

    const exclude = statsExclude || [];
    const labels = statsLabels || {};
    const pad = (n) => String(n).padStart(2, "0");
    const counts = {};
    const order = [];

    posts.forEach((post) => {
        const category = post.category || "Uncategorized";
        if (exclude.includes(category)) return;

        if (!(category in counts)) {
            counts[category] = 0;
            order.push(category);
        }
        counts[category] += 1;
    });

    const parts = order.map((category) => {
        const label = labels[category] || formatCategoryTitle(category);
        return `<b>${pad(counts[category])}</b> ${label}`;
    });
    parts.push(`<b>${pad(posts.length)}</b> Write-ups`);

    el.innerHTML = "Published: " + parts.join('<span class="sep">|</span>');
}

function renderFeatured(posts) {
    const section = document.getElementById("featuredSection");
    const grid = document.getElementById("featuredGrid");
    if (!section || !grid) return;

    const featured = posts.filter((p) => p.featured);
    grid.innerHTML = "";

    if (!featured.length) {
        section.style.display = "none";
        section.dataset.hasFeatured = "false";
        return;
    }
    section.dataset.hasFeatured = "true";

    featured.forEach((post) => {
        const a = document.createElement("a");
        a.className = "featured-card";
        const isExternalUrl = /^https?:\/\//i.test(post.filename);
        if (isExternalUrl) {
            a.href = post.filename;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
        } else {
            a.href = `#${post.filename.replace(".md", "")}`;
        }

        const eyebrow = document.createElement("span");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = (post.tags && post.tags[0]) || post.category || "";
        a.appendChild(eyebrow);

        const h3 = document.createElement("h3");
        h3.textContent = post.title;
        a.appendChild(h3);

        const meta = document.createElement("span");
        meta.className = "meta";
        meta.textContent = post.category || "";
        a.appendChild(meta);

        grid.appendChild(a);
    });

    section.style.display = "";
}

let activeTags = [];

const FILTER_STORAGE_KEY = "csblog:activeTags";

function loadStoredTags() {
    try {
        const raw = localStorage.getItem(FILTER_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveStoredTags() {
    try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(activeTags));
    } catch (e) {
        // localStorage unavailable (private mode, quota, etc.) — ignore
    }
}

function getTagsFromHash() {
    const hash = window.location.hash;
    if (!hash.startsWith("#filter=")) return null;
    return decodeURIComponent(hash.slice("#filter=".length))
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
}

// Re-sync pill selection from the URL's #filter= (share link) if present,
// else from whatever was last saved to localStorage, then apply it.
function applyFiltersFromHash() {
    const bar = document.getElementById("filterBar");
    if (!bar) return;

    const urlTags = getTagsFromHash();
    const tags = urlTags !== null ? urlTags : loadStoredTags();

    activeTags = [];
    bar.querySelectorAll(".pill").forEach((pill) => {
        const t = pill.dataset.tag;
        if (tags.includes(t)) {
            activeTags.push(t);
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });

    applyTagFilter();
}

function renderFilterBar(posts) {
    const bar = document.getElementById("filterBar");
    const toggle = document.getElementById("filterToggle");
    const clearBtn = document.getElementById("filterClear");
    const copyBtn = document.getElementById("filterCopy");
    if (!bar || !toggle) return;

    const tagSet = [];
    posts.forEach((p) => (p.tags || []).forEach((t) => {
        if (!tagSet.includes(t)) tagSet.push(t);
    }));

    if (!tagSet.length) return;
    tagSet.sort();

    bar.innerHTML = "";
    tagSet.forEach((t) => {
        const pill = document.createElement("span");
        pill.className = "pill";
        pill.dataset.tag = t;
        pill.textContent = t;
        bar.appendChild(pill);
    });

    toggle.style.display = "inline-flex";

    toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        bar.hidden = open;
    });

    bar.addEventListener("click", (e) => {
        const pill = e.target.closest(".pill");
        if (!pill) return;
        const t = pill.dataset.tag;
        const i = activeTags.indexOf(t);
        if (i === -1) {
            activeTags.push(t);
            pill.classList.add("active");
        } else {
            activeTags.splice(i, 1);
            pill.classList.remove("active");
        }
        applyTagFilter();
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            activeTags = [];
            bar.querySelectorAll(".pill.active").forEach((p) => p.classList.remove("active"));
            applyTagFilter();
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!activeTags.length) return;
            // The URL is kept in sync with activeTags by syncFilterHash()
            // on every change, so the address bar already has the right link.
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                const original = copyBtn.textContent;
                copyBtn.textContent = "Copied!";
                copyBtn.classList.add("copied");
                setTimeout(() => {
                    copyBtn.textContent = original;
                    copyBtn.classList.remove("copied");
                }, 1500);
            });
        });
    }

    // Restore filter from a shared link (#filter=...) or, failing that,
    // from whatever the visitor last had selected (localStorage).
    applyFiltersFromHash();
}

// Keep the URL's #filter= in sync with activeTags, via replaceState so it
// never adds a history entry or fires hashchange. Never touches the hash
// while an actual post is open (hash present and not a #filter= one).
function syncFilterHash() {
    const currentHash = window.location.hash;
    const isPostHash = currentHash && !currentHash.startsWith("#filter=");
    if (isPostHash) return;

    const base = `${window.location.pathname}${window.location.search}`;
    const newHash = activeTags.length ? `#filter=${encodeURIComponent(activeTags.join(","))}` : "";
    const newUrl = base + newHash;
    if (newUrl !== window.location.pathname + window.location.search + window.location.hash) {
        history.replaceState(null, "", newUrl);
    }
}

function applyTagFilter() {
    const rows = document.querySelectorAll(".section-container .row");
    rows.forEach((r) => {
        const tags = (r.dataset.tags || "").split(",").filter(Boolean);
        const show = activeTags.length === 0 || activeTags.some((t) => tags.includes(t));
        r.classList.toggle("hidden", !show);
    });

    document.querySelectorAll(".section-container .listing").forEach((list) => {
        const visible = list.querySelectorAll(".row:not(.hidden)").length;
        const section = list.closest("section");
        if (section) section.style.display = visible ? "" : "none";
        const countEl = section ? section.querySelector(".head .count, .path-head .count") : null;
        if (countEl) countEl.textContent = visible;
    });

    // Featured is a curated "browse everything" shelf — once a filter is
    // active it's no longer relevant, so hide it while filtering.
    const featuredSection = document.getElementById("featuredSection");
    if (featuredSection && featuredSection.dataset.hasFeatured === "true") {
        featuredSection.style.display = activeTags.length ? "none" : "";
    }

    const countBadge = document.getElementById("filterCount");
    if (countBadge) {
        countBadge.textContent = activeTags.length ? `(${activeTags.length})` : "";
        countBadge.classList.toggle("show", activeTags.length > 0);
    }

    const clearBtn = document.getElementById("filterClear");
    const copyBtn = document.getElementById("filterCopy");
    if (clearBtn) clearBtn.style.display = activeTags.length ? "inline-flex" : "none";
    if (copyBtn) copyBtn.style.display = activeTags.length ? "inline-flex" : "none";

    saveStoredTags();
    syncFilterHash();
}

async function renderPostLists() {
    try {
        const res = await fetch("posts/posts.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load posts.json");

        const data = await res.json();
        const posts = Array.isArray(data) ? data : (data.posts || []);
        allPosts = posts;

        const statsExclude = Array.isArray(data.statsExclude) ? data.statsExclude : [];
        const statsLabels = data.statsLabels || {};

        renderHeroStats(posts, statsExclude, statsLabels);
        renderFeatured(posts);
        renderFilterBar(posts);

        const createdSections = new Set();
        const categoryCounts = {};

        allPosts.forEach((post) => {
            const category = post.category || "Uncategorized";
            const listId = categoryToId(category);

            if (!createdSections.has(listId)) {
                createCategorySectionAtTop(category);
                createdSections.add(listId);
                categoryCounts[listId] = 0;
            }

            const targetList = document.getElementById(listId);
            if (!targetList) return;

            const tags = Array.isArray(post.tags) ? post.tags : [];
            categoryCounts[listId] += 1;

            const a = document.createElement("a");
            const isExternalUrl = /^https?:\/\//i.test(post.filename);
            if (isExternalUrl) {
                a.href = post.filename;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
            } else {
                a.href = `#${post.filename.replace(".md", "")}`;
            }
            a.className = "row";
            a.dataset.tags = tags.join(",");

            const titleWrap = document.createElement("span");
            titleWrap.className = "title";

            const idx = document.createElement("span");
            idx.className = "idx";
            idx.textContent = String(categoryCounts[listId]).padStart(2, "0");
            titleWrap.appendChild(idx);

            if (post.image) {
                const img = document.createElement("img");
                img.src = post.image;
                img.alt = post.title;
                img.classList.add("post-image");
                titleWrap.appendChild(img);
            }
            titleWrap.appendChild(document.createTextNode(post.title));
            a.appendChild(titleWrap);

            if (tags.length) {
                const tagsWrap = document.createElement("span");
                tagsWrap.className = "tags";
                tags.forEach((t) => {
                    const tagEl = document.createElement("span");
                    tagEl.className = "tag";
                    tagEl.textContent = t;
                    tagsWrap.appendChild(tagEl);
                });
                a.appendChild(tagsWrap);
            }

            targetList.appendChild(a);
        });

        Object.keys(categoryCounts).forEach((listId) => {
            const list = document.getElementById(listId);
            const section = list ? list.closest("section") : null;
            const countEl = section ? section.querySelector(".count") : null;
            if (countEl) countEl.textContent = categoryCounts[listId];
        });
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

function addCopyIconsToSections() {
    document.querySelectorAll(".section-container section h2").forEach((h2) => {
        const slug = slugify(h2.textContent);
        h2.id = slug;

        if (h2.querySelector(".copy-link-icon")) return;

        const copyIcon = createCopyLinkIcon(slug);
        h2.appendChild(copyIcon);
    });
}

function highlightHeadingOnHash(slug) {
    document.querySelectorAll(".section-container section h2.active-heading")
        .forEach((h2) => {
            h2.classList.remove("active-heading");
        });

    const hash = typeof slug === "string" ? slug : location.hash.substring(1);
    // Not a heading slug — it's the tag-filter hash (#filter=...) or empty.
    if (!hash || hash.startsWith("filter=")) return;

    let target = null;
    try {
        const id = window.CSS && CSS.escape ? CSS.escape(hash) : hash;
        target = document.querySelector(`.section-container section h2#${id}`);
    } catch (e) {
        return;
    }

    if (target) {
        target.classList.add("active-heading");
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function toggleBackButton() {
    const btn = document.getElementById("backHome");
    if (!btn) return;
    const hash = window.location.hash;
    const isPost = hash && !hash.startsWith("#filter=");
    btn.style.display = isPost ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing app...");

    initializeElements();

    // Wire up static buttons before anything that fetches data or touches
    // the hash, so one of those throwing never leaves a button dead for
    // the rest of the session (DOMContentLoaded only runs once).
    const toggleBtn = document.getElementById("toggleWidthBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const content = document.getElementById("markdown-content");
            const toc = document.getElementById("toc");
            if (!content) return;

            const isFocus = document.body.classList.toggle("focus-mode");

            if (isFocus) {
                content.classList.remove("normal-width");
                content.classList.add("full-width");
                toggleBtn.textContent = "Exit full screen mode";
            } else {
                content.classList.remove("full-width");
                content.classList.add("normal-width");
                toggleBtn.textContent = "Full Screen";
            }

            if (toc) {
                toc.style.display = isFocus ? "none" : "block";
            }
        });
    }

    window.addEventListener("scroll", scrollHandler);
    window.addEventListener("scroll", onScrollSavePosition);

    try {
        if (window.initLibraries) {
            await window.initLibraries();
        }

        await renderPostLists();
        loadMarkdown();

        highlightHeadingOnHash();
        toggleBackButton();
        addCopyIconsToSections();
    } catch (err) {
        console.error("Init error:", err);
    }
});

window.addEventListener("hashchange", () => {
    loadMarkdown();
    highlightHeadingOnHash();
    toggleBackButton();
});
