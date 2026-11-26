# AGENTS.md — Shreemad Bhagawat Katha

## Project context
This repository contains a Bengali educational website explaining Śrīmad Bhāgavatam, its stories, ślokas, philosophy, and Gauḍīya Vaiṣṇava interpretations.

## Coding guidelines
- Prefer minimal, targeted fixes.
- Inspect only files and code sections relevant to the request.
- Avoid reading the entire content-heavy HTML file unless necessary.
- Reuse existing CSS classes and JavaScript utilities.
- Do not introduce new frameworks or dependencies without a clear reason.
- Preserve the existing visual design unless a redesign is explicitly requested.

## Content safety
- Do not rewrite Bengali religious content during technical fixes.
- Preserve original ślokas, Bengali translations, references, and explanations.
- Do not silently change Sanskrit transliteration or Bengali spelling.
- Maintain UTF-8 encoding.
- Treat user-provided Markdown articles as locked source text unless the user explicitly asks for proofreading or wording changes. Styling, layout, and paragraph-flow edits must not paraphrase, summarize, translate, or omit their sentences.
- Keep private/raw conversation Markdown outside the public repository unless the user explicitly asks to publish or commit it. Check staged files before every commit so source notes are not pushed accidentally.

## Markdown articles and editorial rendering
- Follow [`EDITORIAL_STYLE_GUIDE.md`](EDITORIAL_STYLE_GUIDE.md) for the shared HTML, CSS, typography, color, responsive-layout, and component patterns.
- For standalone blog contents navigation, follow the guide's "Standalone article contents navigation" section. Use the corrected Kapila–Devahuti pair as the reference: desktop sticky left panel, mobile collapsed contents above the article, explicit `.toc-number` and `.toc-title` elements. Never put a bare title text node into a grid's narrow number column.
- New long-form Markdown articles should use the site's existing editorial reading theme: restrained terracotta, warm paper, and muted blue-green accents; avoid dashboard-like cards, decorative emoji, and excessive whitespace.
- Preserve Markdown headings, lists, blockquotes, scripture, references, and tables as distinct structures. Join adjacent short prose paragraphs only when they clearly form one continuous thought; keep the source wording and sentence order exact.
- Apply numbered-heading layouts only when the heading actually has a Bengali section number. For unnumbered headings, use a full-width heading style; never let a bare text node inherit a narrow number column.
- Decorative blockquote marks must not overlap Bengali text or Sanskrit verses. Check quote padding and pseudo-elements at desktop and mobile widths.
- When a renderer adds special classes or CSS for one article, scope them to that article/content pane so other tabs keep their existing design.
- After changing the Markdown renderer, rebuild the committed HTML and inspect representative output: numbered and unnumbered headings, prose paragraph flow, lists, tables, and scripture quotes. Validate mobile and desktop layout when the change affects styling.

## Testing
- Run targeted tests when possible.
- Validate relevant desktop and mobile layouts for UI changes.
- Do not run unrelated tests or extensive repository-wide analysis unless necessary.
- Report what changed and how it was verified.

## Response style
- Keep explanations concise.
- Summarize modified files and important changes.
- Mention any remaining issues.
