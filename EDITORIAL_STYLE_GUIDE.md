# Editorial Style Guide

This guide keeps new Bengali articles and reading experiences consistent with the Śrīmad Bhāgavatam site's calm, literary editorial design. It complements [`AGENTS.md`](AGENTS.md); content-preservation rules there still apply.

## Design intent

- Make the page feel like a carefully typeset Bengali literary journal, not a dashboard or an admin panel.
- Let the writing lead. Use hierarchy, whitespace, and a few restrained accents to help readers follow the argument and narrative.
- Use cards only when they express a real unit, such as a selected lesson, a story, or a key takeaway. Keep ordinary prose as prose.
- Keep the visual language quiet and consistent across tabs, standalone articles, and future Markdown blogs.

## Shared visual tokens

Use the existing stylesheet and local assets before adding new values or fonts.

| Purpose | Existing value / pattern |
| --- | --- |
| Page background | `#f8f6f1` |
| Reading surface | `#fff` |
| Soft paper surface | `#fcfaf5` or `#fbfaf7` |
| Main text | `#282828` / `#171717` |
| Muted text | `#74695e` / `#555` |
| Terracotta accent | `#a8320c` / `#9c2d09` |
| Blue-green accent | `#315e63` / `#17556f` |
| Fine separators | `#dedbd4` / `#e2ded6` |
| Bengali reading font | Local `Noto Serif Bengali`, with `Nirmala UI` and `serif` fallbacks |

Use terracotta for section emphasis and links, and muted blue-green for a secondary voice, quoted material, or a distinct concept. Use pale backgrounds and thin borders. Avoid saturated colors, gradients that compete with text, large shadows, and introducing a new accent color for every section.

## Type and reading rhythm

- Use semantic heading levels: article title, major section, then subsection. Do not choose heading tags only for their default size.
- Keep Bengali text in the local Bengali serif family where available. Avoid unnecessarily bold or oversized paragraph text.
- At desktop sizes, keep long-form reading width around the existing `860–960px` content measure. Retain comfortable side padding on smaller screens.
- Body copy should have a relaxed but connected line height, generally around `1.85–1.95`, with balanced paragraph spacing. Avoid making every sentence its own visual card or adding large blank gaps between consecutive ideas.
- Preserve paragraph boundaries from the source unless adjacent short paragraphs clearly form one continuous thought. When joining, add only whitespace between the original sentences; do not edit their wording or order.
- Use bold sparingly to guide scanning. A short emphasized phrase should not turn into a second heading.

## Article structure and components

### Headings

- Numbered Bengali section headings may use a number rail plus a title column. Render the number and title as explicit elements, such as `.porichoy-section-number` and `.porichoy-section-title`.
- Only use the number-rail/grid layout when the heading contains a real section number. Unnumbered headings must occupy the full content width and must not inherit the narrow number column.
- Use smaller, quieter subsection headings to distinguish them from major section headings. Reserve a terracotta variation for a meaningful reflection or conclusion.

### Standalone article contents navigation

Use `articles/kapila-devohuti-mind-bhakti.html`, `articles/kapila-devohuti-dhyana-yoga.html`, and their scoped rules in `assets/article.css` as the approved reference. Reuse the pattern for future standalone blogs without copying their article-specific body class.

- Above `1000px`, use a two-column article grid: a roughly `240–260px` sticky left contents panel and a `minmax(0,1fr)` reading column. Keep the contents links in one column. The panel scrolls vertically within the viewport and stays below the top bar (`top:64px`, `max-height:calc(100vh - 80px)` in the current template).
- At `1000px` and below, place the contents above the article in normal document flow. Initially collapse the native `<details>` panel; readers can open it using the Bengali summary. Give the article the available width with comfortable side padding. Use the same breakpoint in CSS and initialization JavaScript.
- Keep `<details>` closed in the HTML, then initialize it open on desktop. Do not repeatedly reset its state while the reader is using it. Preserve working section anchors and keyboard access.
- Each numbered link must contain two explicit elements. The title must occupy the flexible second column. A bare text node is an anonymous grid item: if it is the only child, the whole title can fall into the narrow number column and wrap one word per line. Changing breakpoints or sidebar width does not fix this markup error.

```html
<a href="#section-1">
  <span class="toc-number">১.</span>
  <span class="toc-title">ভূমিকা — পাঠের সূচনা</span>
</a>
<!-- An unnumbered entry spans the full link width. -->
<a href="#sources"><span class="toc-title">শাস্ত্রীয় সূত্র</span></a>
```

```css
/* Scope these rules to the intended article/template. */
.article-toc a { display:grid; grid-template-columns:28px minmax(0,1fr); gap:8px; }
.article-toc .toc-number { grid-column:1; }
.article-toc .toc-title { grid-column:2; min-width:0; color:inherit; }
.article-toc .toc-title:only-child { grid-column:1/-1; }
```

Before publishing a navigation change, inspect both numbered and unnumbered entries in the rendered browser. Check desktop sticky/open behavior and mobile static/collapsed behavior, expand and follow a link, and check for page-level horizontal overflow. Target phone widths of `360px` and `390px` plus a desktop viewport. Report the actual viewport if a preview tool clamps its size; do not call a requested size a verified size. Review CSS specificity and article-local overrides. When shared CSS changes, update the affected pages' stylesheet version query so cached styles do not conceal the fix. A successful build/deploy alone does not verify layout.

### Paragraphs, callouts, and quotations

- Keep explanatory narrative in `<p>` elements. Use `<blockquote>` for actual quotations, including Sanskrit ślokas, and preserve line breaks that belong to verse form.
- Decorative quote marks must never overlap text. Check pseudo-elements, top padding, and mobile overrides together; hide the decoration if it cannot be positioned safely for the content.
- Use a subdued callout only for a genuine question, definition, key teaching, or concise thesis. Do not add a colored panel to every paragraph.

### Lists, tables, diagrams, and images

- Use `<ol>` and `<ul>` for actual lists; preserve Bengali numbering where the source uses it. Do not simulate lists with repeated paragraphs or manual spacing.
- Give tables a clear header and use a contained horizontal scroller on mobile when columns cannot fit. Prevent the whole page from acquiring horizontal overflow.
- Use `<figure>` and `<figcaption>` for diagrams and meaningful illustrations. Diagram labels and connector relationships must remain clear on desktop and mobile. If a diagram needs zoom, keep zoom/pan inside its viewer and leave normal page scrolling intact.
- Images should scale within their column and include useful Bengali alternative text when they convey information.
- Use cards for distinct, scannable items such as takeaways; keep them subtle, aligned to the palette, and one column on narrow screens.

## HTML and CSS implementation

- Prefer semantic HTML (`<article>`, `<section>`, `<header>`, `<figure>`, `<figcaption>`, `<blockquote>`, `<ol>`, `<table>`) and native controls.
- Scope article-specific styles to that article or content pane. Do not alter other tabs through broad selectors when adding a new blog style.
- Reuse existing classes, CSS variables, fonts, and layout utilities before creating new ones. Avoid dependencies for presentation-only changes.
- Ensure interactive controls have visible focus states, accessible names, and comfortable touch targets. Do not rely on color alone to indicate selection or meaning.
- Avoid emoji in headings and navigation unless the user asks for them.

## Review checklist for each new article

1. Compare rendered headings, paragraphs, lists, references, tables, and quotations against the supplied Markdown; preserve wording and order.
2. Check at least one numbered heading and every unnumbered heading style. Confirm bare heading text cannot fall into a narrow grid column.
3. Check verse and quotation marks at desktop and mobile widths for collisions or clipping.
4. Check that diagrams and tables do not cause page-level horizontal overflow on a phone-sized viewport.
5. Confirm the article still matches the site's editorial palette and that ordinary prose has not become a wall of identical cards or a series of disconnected fragments.
6. Rebuild generated HTML when the site uses its builder, then run the repository's targeted validation and inspect the generated output.
