const fs = require("fs");
const path = require("path");
const conversationSections = require("./conversation-sections");
const vishnuArticle = require("./build_vishnu_article").buildArticle();

const source = fs.readFileSync(path.join(__dirname, "..", "raw_conversation.md"), "utf8").replace(/\r\n/g, "\n");
const integrationSource = fs.readFileSync(path.join(__dirname, "..", "BHAGAVATAM_CODEX_INTEGRATION.md"), "utf8").replace(/\r\n/g, "\n");
const porichoyMarkdown = fs.readFileSync(path.join(__dirname, "..", "probo_1_porichoy.md"), "utf8").replace(/\r\n/g, "\n");
const chotushlokiArticlePath = "articles/chotushloki-bhagavat.html";
const chotushlokiMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_2_chotushlokyio_bhagawat.md"), "utf8").replace(/\r\n/g, "\n");
const krishnaVishnuArticlePath = "articles/krishna-vishnu-tattva.html";
const krishnaVishnuMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_3_Krishna_Vishtu_totto.md"), "utf8").replace(/\r\n/g, "\n");
const choturdoshBhobanArticlePath = "articles/choturdosh-bhoban.html";
const choturdoshBhobanMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_4_choturdosh_bhoban.md"), "utf8").replace(/\r\n/g, "\n");
const shibtottoArticlePath = "articles/brahma-shiva-shakti-tattva.html";
const shibtottoMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_5_shibtatto.md"), "utf8").replace(/\r\n/g, "\n");
const krishnaShaktiArticlePath = "articles/krishna-shakti-tattva.html";
const krishnaShaktiMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_6_krishna_shakti_totto.md"), "utf8").replace(/\r\n/g, "\n");
const radhaTattvaArticlePath = "articles/radha-mahaprabhu-prema-tattva.html";
const radhaTattvaMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_7_radhatotto.md"), "utf8").replace(/\r\n/g, "\n");
const rasaGopigitaArticlePath = "articles/vrindavan-rasa-gopigita.html";
const rasaGopigitaMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_8_shokhitotto.md"), "utf8").replace(/\r\n/g, "\n");
const gitagovindaArticlePath = "articles/jayadeva-gitagovinda.html";
const gitagovindaMarkdown = fs.readFileSync(path.join(__dirname, "..", "porbo_9_gitagovinda.md"), "utf8").replace(/\r\n/g, "\n");
const porbo10ArticlePath = "articles/kapila-devohuti-mind-bhakti.html";
const porbo10Markdown = fs.readFileSync(path.join(__dirname, "..", "porbo_10_debahuti_kopilmuni.md"), "utf8").replace(/\r\n/g, "\n");
const porbo11ArticlePath = "articles/ahaituki-bhakti.html";
const porbo11Markdown = fs.readFileSync(path.join(__dirname, "..", "porbo_11_ahituki_bhakti.md"), "utf8").replace(/\r\n/g, "\n");
const porbo12ArticlePath = "articles/puranjan-upakhyan.html";
const porbo12Markdown = fs.readFileSync(path.join(__dirname, "..", "porbo_12_puranjan.md"), "utf8").replace(/\r\n/g, "\n");
const porbo13ArticlePath = "articles/dhruva-bhakti-journey.html";
const porbo13Markdown = fs.readFileSync(path.join(__dirname, "..", "porbo_13_dhrubo.md"), "utf8").replace(/\r\n/g, "\n");
const porbo14ArticlePath = "articles/ambarisha-durvasa-story.html";
const porbo14Markdown = fs.readFileSync(path.join(__dirname, "..", "porbo_14_ambarish.md"), "utf8").replace(/\r\n/g, "\n");
const porbo15ArticlePath = "articles/uddhava-gita-path.html";
const porbo15Markdown = fs.readFileSync(path.join(__dirname, "..", "porbo_15_udhabgita.md"), "utf8").replace(/\r\n/g, "\n");
const shikha1ArticlePath = "articles/shikha-porbo-1-mon-kapilmuni.html";
const shikha1Markdown = fs.readFileSync(path.join(__dirname, "..", "shikhaporbo1_mon_kopilmuni.md"), "utf8").replace(/\r\n/g, "\n");

function parseBlogArticle(markdown, filename) {
  const lines = markdown.trimEnd().split("\n");
  const titleIndex = lines.findIndex(line => /^#\s+/.test(line));
  const title = lines[titleIndex]?.match(/^#\s+(.+)$/)?.[1];
  const deckIndex = lines.findIndex((line, index) => index > titleIndex && /^###\s+/.test(line));
  const deck = lines[deckIndex]?.match(/^###\s+(.+)$/)?.[1];
  const divider = lines.findIndex((line, index) => index > deckIndex && /^\s*---+\s*$/.test(line));
  if (!title || !deck || divider < 0) throw new Error(`Blog article header is incomplete: ${filename}`);
  return {
    title,
    deck,
    metadata: lines.slice(deckIndex + 1, divider).filter(line => line.trim()),
    body: lines.slice(divider + 1).join("\n"),
  };
}

function parseSeriesArticle(markdown, filename) {
  const lines = markdown.trimEnd().split("\n");
  const titleIndex = lines.findIndex(line => /^#{1,2}\s+/.test(line));
  const titleMatch = lines[titleIndex]?.match(/^(#{1,2})\s+(.+)$/);
  if (!titleMatch) throw new Error(`Blog article title is missing: ${filename}`);
  const titleLevel = titleMatch[1].length;
  const dividerIndex = lines.findIndex((line, index) => index > titleIndex && /^\s*---+\s*$/.test(line));
  const firstSectionIndex = lines.findIndex((line, index) => index > titleIndex && /^##\s+/.test(line));
  let bodyStart;
  let preface;
  if (titleLevel === 1 && dividerIndex >= 0 && (firstSectionIndex < 0 || dividerIndex < firstSectionIndex)) {
    bodyStart = dividerIndex + 1;
    preface = lines.slice(titleIndex + 1, dividerIndex);
  } else if (titleLevel === 1) {
    bodyStart = firstSectionIndex;
    if (bodyStart < 0) bodyStart = lines.length;
    preface = lines.slice(titleIndex + 1, bodyStart);
  } else {
    bodyStart = titleIndex + 1;
    preface = [];
  }
  const deckLine = preface.find(line => /^###\s+/.test(line) || /^\*[^*].*[^*]\*$/.test(line.trim()));
  const deck = deckLine
    ? deckLine.trim().replace(/^###\s+/, "").replace(/^\*|\*$/g, "")
    : "";
  const metadata = preface.filter(line => line.trim() && line !== deckLine && /^\*\*.+\*\*$/.test(line.trim()));
  return { title: titleMatch[2], deck, metadata, body: lines.slice(bodyStart).join("\n") };
}

function joinShortNarrativeParagraphs(markdown) {
  const blocks = markdown.split(/\n\s*\n+/).map(block => block.trim()).filter(Boolean);
  const paragraphs = [];
  const isNarrative = block => {
    if (/^(#{1,6}\s|>|```|---+\s*$|\||[-*]\s+|[0-9০-৯]+\.\s+)/m.test(block)) return false;
    if (/^\*\*.+\*\*$/.test(block) && !/:\*\*$/.test(block)) return false;
    return true;
  };
  for (const block of blocks) {
    const previous = paragraphs.at(-1);
    const joinedLength = previous ? previous.length + 1 + block.length : Infinity;
    const previousIsQuestion = previous && /[?؟!]\s*$/.test(previous);
    const nextIsQuestion = /[?؟!]\s*$/.test(block);
    const canJoin = previous && isNarrative(previous) && isNarrative(block) &&
      !previousIsQuestion && !nextIsQuestion && joinedLength <= 350 &&
      (previous.length <= 180 || block.length <= 90 || /^(?:কারণ|বরং|তাই|অর্থাৎ|এই কারণে|এই প্রশ্নের উত্তর|কিন্তু|তবে|আর)(?:\s|$)/u.test(block));
    if (canJoin) paragraphs[paragraphs.length - 1] = `${previous} ${block}`;
    else paragraphs.push(block);
  }
  return paragraphs.join("\n\n");
}

const chotushlokiArticle = parseBlogArticle(chotushlokiMarkdown, "porbo_2_chotushlokyio_bhagawat.md");
const krishnaVishnuArticle = parseBlogArticle(krishnaVishnuMarkdown, "porbo_3_Krishna_Vishtu_totto.md");
const choturdoshBhobanArticle = parseBlogArticle(choturdoshBhobanMarkdown, "porbo_4_choturdosh_bhoban.md");
const shibtottoArticle = parseBlogArticle(shibtottoMarkdown, "porbo_5_shibtatto.md");
const krishnaShaktiArticle = parseBlogArticle(krishnaShaktiMarkdown, "porbo_6_krishna_shakti_totto.md");
const radhaTattvaArticle = parseBlogArticle(radhaTattvaMarkdown, "porbo_7_radhatotto.md");
const rasaGopigitaArticle = parseBlogArticle(rasaGopigitaMarkdown, "porbo_8_shokhitotto.md");
const gitagovindaArticle = parseBlogArticle(gitagovindaMarkdown, "porbo_9_gitagovinda.md");
const porbo10Article = parseSeriesArticle(porbo10Markdown, "porbo_10_debahuti_kopilmuni.md");
const porbo11Article = parseSeriesArticle(porbo11Markdown, "porbo_11_ahituki_bhakti.md");
const porbo12Article = parseSeriesArticle(porbo12Markdown, "porbo_12_puranjan.md");
const porbo13Article = parseSeriesArticle(porbo13Markdown, "porbo_13_dhrubo.md");
const porbo14Article = parseSeriesArticle(porbo14Markdown, "porbo_14_ambarish.md");
const porbo15Article = parseSeriesArticle(porbo15Markdown, "porbo_15_udhabgita.md");
const shikha1Article = parseSeriesArticle(shikha1Markdown, "shikhaporbo1_mon_kopilmuni.md");

function parseFrontmatter(markdown, filename) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`Frontmatter missing in detailed lesson: ${filename}`);
  const metadata = {};
  match[1].split("\n").forEach(line => {
    const field = line.match(/^([a-z_]+):\s*(.+)$/);
    if (!field) return;
    const value = field[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      metadata[field[1]] = value.slice(1, -1).split(",").map(item => item.trim().replace(/^"|"$/g, ""));
    } else {
      metadata[field[1]] = value.replace(/^"|"$/g, "");
    }
  });
  return { metadata, body: markdown.slice(match[0].length) };
}

function readDetailedLessonSources() {
  const parentDirectory = path.join(__dirname, "..");
  return fs.readdirSync(parentDirectory)
    .filter(filename => /^bhagavat_.*\.md$/i.test(filename))
    .sort((a, b) => a.localeCompare(b, "bn"))
    .map(filename => {
      const markdown = fs.readFileSync(path.join(parentDirectory, filename), "utf8").replace(/\r\n/g, "\n");
      const { metadata, body } = parseFrontmatter(markdown, filename);
      const required = ["title", "scripture", "skandha", "chapter", "verses", "category", "speaker", "listener"];
      required.forEach(field => {
        if (!metadata[field]) throw new Error(`Detailed lesson ${filename}: missing ${field}`);
      });
      const instructionMarker = "\n---\n\n## ওয়েবসাইটে সংযোজনের নির্দেশ";
      const contentEnd = body.indexOf(instructionMarker);
      const content = (contentEnd >= 0 ? body.slice(0, contentEnd) : body)
        .trimStart()
        .replace(/^#\s+[^\n]+\n+/, "")
        .trim();
      const oneLine = content.match(/^>\s+\*\*এক বাক্যে শিক্ষা:\*\*\s+(.+)$/m);
      if (!oneLine) throw new Error(`Detailed lesson ${filename}: one-line teaching missing`);
      return {
        id: slugify(metadata.title, `lesson-s${String(metadata.skandha).padStart(2, "0")}-c${String(metadata.chapter).padStart(2, "0")}`),
        filename,
        title: metadata.title,
        scripture: metadata.scripture,
        skandha: metadata.skandha,
        chapter: metadata.chapter,
        verses: metadata.verses,
        category: metadata.category,
        speaker: metadata.speaker,
        listener: metadata.listener,
        sourcePages: metadata.source_pages || "",
        tags: metadata.tags || [],
        oneLineLesson: oneLine[1],
        content,
      };
    });
}

const ordinalToNumber = new Map([
  ["১ম", 1], ["২য়", 2], ["৩য়", 3], ["৪র্থ", 4], ["৫ম", 5], ["৬ষ্ঠ", 6],
  ["৭ম", 7], ["৮ম", 8], ["৯ম", 9], ["১০ম", 10], ["১১তম", 11], ["১২তম", 12],
]);

function sourceSection(start, end) {
  const from = integrationSource.indexOf(start);
  if (from < 0) throw new Error(`Integration source section missing: ${start}`);
  const to = integrationSource.indexOf(end, from + start.length);
  if (to < 0) throw new Error(`Integration source section missing: ${end}`);
  return integrationSource.slice(from, to);
}

function parseMarkdownTable(block) {
  const lines = block.split("\n").filter(line => line.trim().startsWith("|"));
  if (lines.length < 3) return [];
  return lines.slice(2).map(line => line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim()));
}

function parseStoryIntegration() {
  const storySection = sourceSection("# 5. LOCKED CONTENT", "# 6. LOCKED EXTRA STORY-CARD CONTENT");
  const skandhaMatches = [...storySection.matchAll(/^##\s+([০-৯]+(?:ম|য়|র্থ|ষ্ঠ|তম))\s+স্কন্ধ\s+—\s+(.+)$/gm)];
  if (skandhaMatches.length !== 12) throw new Error(`Expected 12 skandhas, found ${skandhaMatches.length}`);

  const skandhas = skandhaMatches.map((match, position) => {
    const ordinal = match[1];
    const number = ordinalToNumber.get(ordinal);
    if (!number) throw new Error(`Unknown skandha ordinal: ${ordinal}`);
    const bodyStart = match.index + match[0].length;
    const bodyEnd = position + 1 < skandhaMatches.length ? skandhaMatches[position + 1].index : storySection.length;
    const body = storySection.slice(bodyStart, bodyEnd);
    const meta = body.match(/\*\*([০-৯]+)টি অধ্যায় \| মূল ভাব: (.+)\*\*/);
    if (!meta) throw new Error(`Missing metadata for skandha ${number}`);
    const tableMatches = [...body.matchAll(/(?:^###\s+(.+)\n\n)?((?:^\|.+\n)+)/gm)];
    const stories = [];
    tableMatches.forEach(tableMatch => {
      const group = tableMatch[1] || "";
      parseMarkdownTable(tableMatch[2]).forEach(cells => {
        if (cells.length !== 2 && cells.length !== 3) throw new Error(`Unexpected table width in skandha ${number}`);
        const fullTitle = cells[0];
        const titleMatch = fullTitle.match(/^(.*) \(([^()]+)\)$/);
        if (!titleMatch) throw new Error(`Story reference missing: ${fullTitle}`);
        const whatHappened = cells.length === 3 ? cells[1] : cells[1];
        const lesson = cells.length === 3 ? cells[2] : cells[1];
        stories.push({
          id: `story-s${String(number).padStart(2, "0")}-${String(stories.length + 1).padStart(2, "0")}`,
          skandha: number,
          chapter: titleMatch[2],
          title: titleMatch[1],
          fullTitle,
          whatHappened,
          lesson,
          group,
          sourceCells: cells,
        });
      });
    });
    return {
      number,
      ordinal,
      titleBn: match[2],
      chapterCount: Number(meta[1].replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))),
      chapterCountBn: meta[1],
      themeBn: meta[2],
      stories,
    };
  });

  const memorySection = sourceSection("# 7. ১২ স্কন্ধের এক-বাক্যের স্মরণসূত্র", "# 8. UI behavior");
  const memoryRows = parseMarkdownTable(memorySection.match(/(?:^\|.+\n)+/gm)?.[0] || "");
  memoryRows.forEach(([numberBn, memoryLineBn]) => {
    const number = Number(numberBn.replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit))));
    const skandha = skandhas.find(item => item.number === number);
    if (!skandha) throw new Error(`Memory line has unknown skandha: ${numberBn}`);
    skandha.memoryLineBn = memoryLineBn;
  });

  const detailSection = sourceSection("# 6. LOCKED EXTRA STORY-CARD CONTENT", "# 7. ১২ স্কন্ধের এক-বাক্যের স্মরণসূত্র");
  const detailMatches = [...detailSection.matchAll(/^## বিস্তারিত কার্ড: (.+) \((.+) স্কন্ধ\)$/gm)];
  const details = detailMatches.map((match, position) => {
    const bodyStart = match.index + match[0].length;
    const bodyEnd = position + 1 < detailMatches.length ? detailMatches[position + 1].index : detailSection.length;
    const body = detailSection.slice(bodyStart, bodyEnd);
    const field = label => {
      const value = body.match(new RegExp(`\\*\\*${label}:\\*\\* ([^\\n]+)`));
      if (!value) throw new Error(`Missing ${label} in detail: ${match[1]}`);
      return value[1];
    };
    const skandha = ordinalToNumber.get(match[2]);
    if (!skandha) throw new Error(`Unknown detail skandha: ${match[2]}`);
    return {
      detailKey: `detail-s${String(skandha).padStart(2, "0")}-${match[1]}`,
      skandha,
      title: match[1],
      background: field("গল্পের পটভূমি"),
      narrative: field("ঘটনাটি বিস্তারিত"),
      takeaway: field("মূল শিক্ষা"),
      memoryHook: field("মনে রাখার সূত্র"),
    };
  });

  details.forEach(detail => {
    const story = skandhas[detail.skandha - 1].stories.find(item => item.title === detail.title);
    if (!story) throw new Error(`Expanded detail has no source row: ${detail.title}`);
    story.detailKey = detail.detailKey;
  });

  const expectedRows = [7, 6, 8, 8, 7, 8, 8, 8, 8, 23, 11, 8];
  skandhas.forEach((skandha, index) => {
    if (skandha.stories.length !== expectedRows[index]) throw new Error(`Skandha ${skandha.number}: expected ${expectedRows[index]} rows, found ${skandha.stories.length}`);
    if (!skandha.memoryLineBn) throw new Error(`Skandha ${skandha.number}: memory line missing`);
    skandha.stories.forEach(story => {
      const reconstructed = story.sourceCells.length === 3
        ? [story.fullTitle, story.whatHappened, story.lesson]
        : [story.fullTitle, story.lesson];
      if (JSON.stringify(reconstructed) !== JSON.stringify(story.sourceCells)) throw new Error(`Source fidelity mismatch: ${story.fullTitle}`);
    });
  });
  if (details.length !== 23) throw new Error(`Expected 23 expanded cards, found ${details.length}`);

  return { skandhas, details, storyCount: skandhas.reduce((total, item) => total + item.stories.length, 0) };
}

const storyIntegration = parseStoryIntegration();

function between(start, end) {
  const a = source.indexOf(start);
  if (a < 0) throw new Error(`শুরুর চিহ্ন পাওয়া যায়নি: ${start}`);
  const b = source.indexOf(end, a + start.length);
  if (b < 0) throw new Error(`শেষের চিহ্ন পাওয়া যায়নি: ${end}`);
  return source.slice(a, b).trim();
}

const chapters = [
  {
    id: "intro",
    title: "পরিচয়",
    renderPrefix: "porichoy",
    markdown: porichoyMarkdown,
  },
  {
    id: "shlokas",
    title: "নির্বাচিত শ্লোক",
    markdown: between(
      "এই ২৫টি শ্লোক কোনো শাস্ত্রীয় বা আনুষ্ঠানিক শ্রেষ্ঠ তালিকা নয়",
      "\n----\n\n```\nThanks. There are so many"
    ),
  },
  {
    id: "conversations",
    title: "স্কন্ধভিত্তিক কথোপকথন",
    markdown: between(
      "খুব সুন্দর। তাহলে এবার **শ্রীমদ্ভাগবতকে ১২টি স্কন্ধের collection হিসেবে নয়",
      "\n\n----\n\n```\nPlease go ahead"
    ),
  },
  {
    id: "timeline",
    title: "চরিত্র ও সময়রেখা",
    markdown: between(
      "হ্যাঁ—এটা করা যায়, এবং করলে ভাগবত বোঝা অনেক সহজ হবে।",
      "```\nEta ki html"
    ),
  },
  {
    id: "stories",
    title: "গল্প ও শিক্ষা",
    markdown: "",
    storyModule: true,
  },
];

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slugify(text, prefix) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-section-${(hash >>> 0).toString(36)}`;
}

const detailedLessons = readDetailedLessonSources();

function inline(text, preserveSource = false) {
  return escapeHtml(preserveSource ? text : withoutEmoji(text))
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function diagramNode(title, meta = "", type = "") {
  return `<div class="map-node ${type}"><strong>${escapeHtml(title)}</strong>${meta ? `<small>${escapeHtml(meta)}</small>` : ""}</div>`;
}

function sourceFallback(code) {
  return `<details class="diagram-source"><summary>মূল পাঠ্যচিত্র দেখুন</summary><pre><code>${escapeHtml(code)}</code></pre></details>`;
}

function responsiveDiagram(markup) {
  const match = markup.match(/^<figure class="editorial-map ([^"]+)">([\s\S]*)<\/figure>$/);
  if (!match || !/(?:narration-map|family-map|cosmos-map)/.test(match[1])) return markup;
  const captionEnd = match[2].indexOf("</figcaption>") + "</figcaption>".length;
  const body = match[2].slice(captionEnd);
  const sourceStart = body.lastIndexOf('<details class="diagram-source">');
  const drawing = sourceStart < 0 ? body : body.slice(0, sourceStart);
  const source = sourceStart < 0 ? "" : body.slice(sourceStart);
  return `<figure class="editorial-map responsive-diagram"><figcaption>${match[2].slice(0, captionEnd).replace(/^<figcaption>|<\/figcaption>$/g, "")}</figcaption><button type="button" class="diagram-expand" data-open-diagram-viewer aria-haspopup="dialog" aria-controls="diagram-viewer">⛶ বড় করে দেখুন</button><div class="diagram-preview" data-map-preview><div class="diagram-canvas ${match[1]}" data-map-canvas>${drawing}</div></div>${source}</figure>`;
}

function chainDiagram(items, title, subtitle, code) {
  return `<figure class="editorial-map chain-map"><figcaption><strong>${title}</strong><span>${subtitle}</span></figcaption><div class="map-chain">${items.map((item, i) => `${diagramNode(item[0], item[1] || "", item[2] || "")}${i < items.length - 1 ? '<span class="map-arrow" aria-hidden="true">↓</span>' : ""}`).join("")}</div>${sourceFallback(code)}</figure>`;
}

function renderDiagram(code) {
  if (code.includes("বিদুর ↔ মৈত্রেয়") && code.includes("শৌনকাদি ঋষি")) {
    return `<figure class="editorial-map narration-map"><figcaption><strong>কথোপকথনের প্রধান স্থাপত্য</strong><span>কে কাকে কোন সংবাদ বলছেন</span></figcaption><div class="map-chain compact">${diagramNode("শৌনকাদি ঋষি", "প্রশ্নকারী") }<span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("সূত গোস্বামী", "পুনর্বর্ণনাকারী") }<span class="map-arrow" aria-hidden="true">↓</span></div><div class="dialogue-pair"><div>${diagramNode("পরীক্ষিৎ মহারাজ", "প্রশ্নকারী", "listener")}</div><div class="relation-line"><span>প্রশ্ন</span><b aria-hidden="true">→</b></div><div>${diagramNode("শুকদেব গোস্বামী", "প্রধান বক্তা", "speaker")}</div></div><div class="nested-label">শুকদেবের কথনের ভিতরে</div><div class="branch-grid"><div class="branch-card"><b>বিদুর ↔ মৈত্রেয়</b><span>কপিল ↔ দেবহূতি</span><span>ধ্রুব ↔ নারদ</span><span>পৃথু প্রভৃতি</span></div><div class="branch-card"><b>অজামিল</b><span>যমদূত ↔ বিষ্ণুদূত</span></div><div class="branch-card"><b>প্রহ্লাদ ↔ হিরণ্যকশিপু</b></div><div class="branch-card divine"><b>কৃষ্ণ ↔ গোপীগণ</b><span>উদ্ধব ↔ গোপীগণ</span></div><div class="branch-card divine"><b>কৃষ্ণ ↔ উদ্ধব</b><span>উদ্ধবগীতা</span></div></div><div class="map-legend"><span><i class="legend-terracotta"></i> কথনের প্রধান প্রবাহ</span><span><i class="legend-blue"></i> কৃষ্ণকেন্দ্রিক সংবাদ</span><span>↔ সরাসরি কথোপকথন</span></div>${sourceFallback(code)}</figure>`;
  }

  if (code.startsWith("স্বায়ম্ভুব মনু + শতরূপা")) {
    return `<figure class="editorial-map family-map"><figcaption><strong>স্বায়ম্ভুব মনুর দুই পারিবারিক শাখা</strong><span>কপিল ও ধ্রুব একই প্রাচীন পুরাণীয় জগতের অংশ</span></figcaption>${diagramNode("স্বায়ম্ভুব মনু + শতরূপা", "মূল পরিবার", "root-node")}<div class="family-split"><div class="family-branch">${diagramNode("দেবহূতি", "কর্দম মুনির পত্নী") }<span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("কপিলদেব", "পুত্র ও শিক্ষক", "divine")}</div><div class="family-branch">${diagramNode("উত্তানপাদ", "মনুর পুত্র") }<span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("ধ্রুব", "উত্তানপাদের পুত্র")}</div></div>${sourceFallback(code)}</figure>`;
  }

  if (code.startsWith("স্বায়ম্ভুব মনু\n")) return chainDiagram([["স্বায়ম্ভুব মনু","প্রাচীন মনু"],["উত্তানপাদ","পুত্র"],["ধ্রুব মহারাজ","নারদের শিষ্যসুলভ সাধক"]],"মনু থেকে ধ্রুব","পারিবারিক ধারাবাহিকতা",code);
  if (code.startsWith("ঋষভদেব")) return chainDiagram([["ঋষভদেব","পিতা ও শিক্ষক"],["ভরত","পুত্র"]],"ঋষভদেব থেকে ভরত","রাজর্ষি বংশধারা",code);

  if (code.startsWith("জয়-বিজয়")) {
    return `<figure class="editorial-map family-map"><figcaption><strong>জয়–বিজয়ের প্রথম অসুরজন্ম</strong><span>প্রহ্লাদ-কাহিনির পূর্বসূত্র</span></figcaption>${diagramNode("জয়–বিজয়","বৈকুণ্ঠের দ্বারপাল","root-node")}<span class="map-arrow" aria-hidden="true">↓</span><div class="dialogue-pair siblings">${diagramNode("হিরণ্যাক্ষ","বরাহদেবের দ্বারা বধ")}${diagramNode("হিরণ্যকশিপু","প্রহ্লাদের পিতা")}</div><span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("প্রহ্লাদ","নৃসিংহদেবের মহান ভক্ত","divine")}${sourceFallback(code)}</figure>`;
  }

  if (code.startsWith("কল্প")) {
    return `<figure class="editorial-map cosmos-map"><figcaption><strong>পুরাণীয় সময়ের স্তর</strong><span>সব ঘটনা একই সরল মানবীয় সময়রেখায় নয়</span></figcaption><div class="cosmos-level level-one">${diagramNode("কল্প","বৃহৎ সৃষ্টিচক্র","root-node")}</div><div class="cosmos-level level-two"><span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("মন্বন্তর","একজন মনুর শাসনপর্ব")}</div><div class="cosmos-level level-three"><div>${diagramNode("যুগচক্র","সত্য–ত্রেতা–দ্বাপর–কলি")}</div><div>${diagramNode("রাজবংশ","রাজর্ষি ও প্রজন্ম")}</div><div>${diagramNode("অবতার ও লীলা","বিভিন্ন সময়পর্ব","divine")}</div></div><p class="map-note">একটি কল্পের মধ্যে বহু মন্বন্তর; প্রতিটি মন্বন্তরের মধ্যে যুগচক্র, রাজবংশ ও অবতারলীলার প্রসঙ্গ আসে।</p>${sourceFallback(code)}</figure>`;
  }

  if (code.startsWith("পাণ্ডু")) {
    return `<figure class="editorial-map family-map pandava-map"><figcaption><strong>পাণ্ডব থেকে পরীক্ষিৎ</strong><span>মহাভারত ও ভাগবতের পারিবারিক সেতু</span></figcaption>${diagramNode("পাণ্ডু","কুরুবংশ","root-node")}<div class="family-split three"><div>${diagramNode("যুধিষ্ঠির","জ্যেষ্ঠ পাণ্ডব")}</div><div>${diagramNode("ভীম","দ্বিতীয় পাণ্ডব")}</div><div class="family-branch">${diagramNode("অর্জুন","পরীক্ষিতের পিতামহ","speaker")}<span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("অভিমন্যু","পরীক্ষিতের পিতা")}<span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("পরীক্ষিৎ","ভাগবতের প্রধান শ্রোতা","listener")}<span class="map-arrow" aria-hidden="true">↓</span>${diagramNode("জনমেজয়","পরীক্ষিতের পুত্র")}</div></div>${sourceFallback(code)}</figure>`;
  }

  if (code.startsWith("নারদ")) return chainDiagram([["নারদ","দেবর্ষি ও পথপ্রদর্শক"],["ব্যাসদেব","ভাগবতের রচয়িতা"],["শুকদেব","প্রধান বক্তা"],["পরীক্ষিৎ","প্রধান শ্রোতা"]],"নারদ থেকে পরীক্ষিৎ","শিক্ষা, পরিবার ও শ্রবণের ধারাবাহিকতা",code);
  if (code.startsWith("শৌনকাদি ঋষি")) return chainDiagram([["শৌনকাদি ঋষি","প্রশ্ন করেন"],["সূত গোস্বামী","বলেন"],["শুকদেব ↔ পরীক্ষিৎ","মূল সংবাদ"],["আরও প্রাচীন কথোপকথন","ভাগবতের ভিতরে আরও প্রাচীন কথা"]],"ভাগবতের কথন-স্তর","একটি সংবাদের ভিতরে আরও প্রাচীন সংবাদ",code);

  return `<figure class="editorial-map text-map"><figcaption><strong>সম্পর্কচিত্র</strong><span>মূল আলোচনার বিন্যাস</span></figcaption><pre><code>${escapeHtml(code)}</code></pre>${sourceFallback(code)}</figure>`;
}

const verseContext = {
  "১.১.১": ["ব্যাসদেবের মঙ্গলাচরণ", "সরাসরি মানব শ্রোতা নেই", "গ্রন্থের সূচনায় পরম সত্যের ধ্যান।"],
  "১.১.২": ["ব্যাসদেবের প্রারম্ভিক ঘোষণা", "ভাগবতের পাঠক ও শ্রোতা", "নির্মল ভাগবত-ধর্মের বৈশিষ্ট্য ঘোষণা।"],
  "১.১.৩": ["ব্যাসদেবের আহ্বান", "রসিক ও ভাবুক ভক্তগণ", "বেদরূপ কল্পবৃক্ষের ফল ভাগবত-রস পান করার আমন্ত্রণ।"],
  "১.২.৬": ["সূত গোস্বামী", "শৌনকাদি ঋষি", "নৈমিষারণ্যে মানুষের সর্বোচ্চ ধর্ম ব্যাখ্যা।"],
  "১.২.৭": ["সূত গোস্বামী", "শৌনকাদি ঋষি", "বাসুদেব-ভক্তির স্বাভাবিক ফল ব্যাখ্যা।"],
  "১.২.১৭": ["সূত গোস্বামী", "শৌনকাদি ঋষি", "কৃষ্ণকথা শ্রবণের হৃদয়শোধক শক্তি বর্ণনা।"],
  "১.২.১৮": ["সূত গোস্বামী", "শৌনকাদি ঋষি", "নিয়মিত ভাগবতসেবায় নৈষ্ঠিকী ভক্তির উদয়।"],
  "১.৩.২৮": ["সূত গোস্বামী", "শৌনকাদি ঋষি", "অবতারসমূহ বর্ণনার শেষে কৃষ্ণের স্বয়ং-ভগবত্তা ঘোষণা।"],
  "১.৮.২৫": ["কুন্তীদেবী", "শ্রীকৃষ্ণ", "বিপদের মধ্যেও কৃষ্ণদর্শন ও স্মরণ চেয়ে প্রার্থনা।"],
  "১.৮.২৬": ["কুন্তীদেবী", "শ্রীকৃষ্ণ", "অহংকারের বিপরীতে অকিঞ্চন-ভাবের প্রার্থনা।"],
  "২.১.৫": ["শুকদেব গোস্বামী", "পরীক্ষিৎ মহারাজ", "মৃত্যু আসন্ন মানুষের শ্রবণ–কীর্তন–স্মরণের কর্তব্য।"],
  "২.১.৬": ["শুকদেব গোস্বামী", "পরীক্ষিৎ মহারাজ", "মানবজীবনের চূড়ান্ত সাফল্য হিসেবে নারায়ণস্মৃতি।"],
  "৭.৬.১": ["প্রহ্লাদ মহারাজ", "অসুরবালকেরা", "শৈশব থেকেই ভাগবতধর্ম অনুশীলনের উপদেশ।"],
  "৭.৫.২৩": ["প্রহ্লাদ মহারাজ", "হিরণ্যকশিপু", "বিদ্যালয়ে শেখা শ্রেষ্ঠ বিষয়ের উত্তরে নববিধা ভক্তি।"],
  "৭.৯.৪৩": ["প্রহ্লাদ মহারাজ", "নৃসিংহদেব", "নিজের মুক্তির বদলে ভগবানবিমুখ জীবদের জন্য করুণাময় প্রার্থনা।"],
  "৬.২.১৪": ["বিষ্ণুদূতগণ", "যমদূতগণ", "অজামিল প্রসঙ্গে ভগবৎনামের স্বতন্ত্র শক্তি ব্যাখ্যা।"],
  "৮.৩.২": ["গজেন্দ্র", "পরমেশ্বর", "নিজ শক্তি নিঃশেষ হলে সম্পূর্ণ শরণাগতির প্রার্থনা।"],
  "১০.৩.৮": ["শুকদেব গোস্বামী", "পরীক্ষিৎ মহারাজ", "দেবকীর গর্ভে শ্রীকৃষ্ণের দিব্য আবির্ভাবের বর্ণনা।"],
  "১০.৯.১৮": ["শুকদেব গোস্বামী", "পরীক্ষিৎ মহারাজ", "মা যশোদার পরিশ্রম দেখে কৃষ্ণের প্রেমবন্ধন স্বীকারের বর্ণনা।"],
  "১০.১৪.৩": ["ব্রহ্মা", "শ্রীকৃষ্ণ", "ব্রহ্মবিমোহনের পরে জ্ঞানগর্ব ত্যাগ করে নম্র প্রার্থনা।"],
  "১০.১৪.১৪": ["ব্রহ্মা", "শ্রীকৃষ্ণ", "কৃষ্ণকে সকল জীবের অন্তরাত্মা ও অধীশ্বররূপে বন্দনা।"],
  "১০.৩১.৯": ["গোপীগণ", "শ্রীকৃষ্ণ", "কৃষ্ণবিরহে গোপীগীতের মধ্যে কথামৃতের মহিমা।"],
  "১০.১৪.৮": ["ব্রহ্মা", "শ্রীকৃষ্ণ", "প্রতিকূলতার মধ্যেও ভগবৎকৃপা দেখার শরণাগত প্রার্থনা।"],
  "১২.৩.৫১": ["শুকদেব গোস্বামী", "পরীক্ষিৎ মহারাজ", "কলিযুগের অসংখ্য দোষের মধ্যে কৃষ্ণকীর্তনের মহান গুণ।"],
  "১২.১৩.২৩": ["সূত গোস্বামী", "শৌনকাদি ঋষি", "ভাগবতের সমাপ্তিতে নামসংকীর্তন ও হরিপ্রণামের বন্দনা।"]
};

function withoutEmoji(text) {
  return text.replace(/\p{Extended_Pictographic}\uFE0F?\s*/gu, "").trim();
}

function bengaliNumber(value) {
  return String(value).padStart(2, "0").replace(/[0-9]/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
}

function numericValue(value) {
  return Number(String(value).replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit))));
}

function renderShlokaChapter(markdown, prefix) {
  const firstVerse = markdown.search(/^###\s+১\./m);
  const studyStart = markdown.search(/^##\s+.*২৫টি থেকে/m);
  const introText = markdown.slice(0, firstVerse).trim();
  const versesText = markdown.slice(firstVerse, studyStart < 0 ? markdown.length : studyStart);
  const studyText = studyStart < 0 ? "" : markdown.slice(studyStart).trim();
  const introRendered = markdownToHtml(
    introText.replace(/^এই ২৫টি শ্লোক[^\n]+/, "পরম সত্যের ধ্যান দিয়ে শুরু হয় শ্রীমদ্ভাগবত। এখানে নির্বাচিত ২৫টি শ্লোক সেই সূচনা থেকে ভক্তি, শ্রবণ-কীর্তন, হরিনাম ও শরণাগতির মধ্য দিয়ে কৃষ্ণলীলা ও প্রেমের দিকে নিয়ে যায়। প্রতিটি শ্লোকের সঙ্গে আছে সহজ বাংলা অর্থ এবং বক্তা, শ্রোতা ও প্রসঙ্গের পরিচয়।"),
    `${prefix}-intro`,
  );
  const studyRendered = studyText ? markdownToHtml(studyText
    .replace("সব ২৫টি একসঙ্গে মুখস্থ করার দরকার নেই। আমি প্রথমে এই **৭টি** নিতাম:", "মুখস্থ করার জন্য শুরুতে এই **সাতটি শ্লোক** বেছে নেওয়া যেতে পারে।")
    .replace("এগুলিকে একসঙ্গে দেখলে একটা খুব সুন্দর progression তৈরি হয়:", "এই শ্লোকগুলি মিলিয়ে পড়লে ভক্তির অনুশীলন কীভাবে এগোয়, তা ধাপে ধাপে বোঝা যায়।"),
    `${prefix}-study`) : { html: "", nav: [] };
  const nav = [...introRendered.nav];
  const entries = [];
  const versePattern = /^###\s+([০-৯0-9]+)\.\s+([^\n]+)\n([\s\S]*?)(?=^###\s+[০-৯0-9]+\.|(?![\s\S]))/gm;
  let match;
  while ((match = versePattern.exec(versesText)) !== null) {
    const index = numericValue(match[1]);
    const title = withoutEmoji(match[2].replace(/\*\*/g, "").trim());
    const body = match[3].trim();
    const referenceMatch = body.match(/^\*\*([০-৯.]+)\*\*/m);
    const reference = referenceMatch ? referenceMatch[1] : "";
    const lines = body.split("\n");
    const verseLines = lines.filter(line => line.trim().startsWith(">")).map(line => line.replace(/^>\s?/, "").replace(/\*\*/g, "").trim()).filter(Boolean);
    const remaining = lines.filter(line => !line.trim().startsWith(">") && !/^\*\*[০-৯.]+\*\*$/.test(line.trim()) && !/^---+$/.test(line.trim())).join("\n").trim();
    const explanation = markdownToHtml(remaining
      .replace("**Flow:**", "**ভক্তির ধারা:**")
      .replace("এখানেই ভাগবতের এক অপূর্ব রহস্য:", "দামোদরলীলার তাৎপর্য ধরা পড়ে ভক্তের প্রেমে।")
      .replace("খুব সহজে মনে রাখার অংশ:", "শ্লোকটির মূল স্মরণসূত্র"),
      `${prefix}-note-${index}`).html;
    const id = `${prefix}-verse-${reference.replace(/\./g, "-") || index}`;
    const context = verseContext[reference] || ["বর্ণনাকারী", "শ্রোতা", "প্রসঙ্গটি যাচাইাধীন।"];
    nav.push({ id, title: `${bengaliNumber(index)} · ${title}` });
    entries.push(`<article class="verse-entry" id="${id}"><aside class="verse-rail"><span>${bengaliNumber(index)}</span><small>${reference}</small></aside><div class="verse-body"><header class="verse-header"><h3>${escapeHtml(title)}</h3><div class="verse-reference">শ্রীমদ্ভাগবত ${reference}</div></header><dl class="verse-context"><div><dt>বক্তা</dt><dd>${escapeHtml(context[0])}</dd></div><div><dt>শ্রোতা/উদ্দেশ্য</dt><dd>${escapeHtml(context[1])}</dd></div><div class="context-wide"><dt>প্রসঙ্গ</dt><dd>${escapeHtml(context[2])}</dd></div></dl><div class="verse-text" aria-label="মূল শ্লোক">${verseLines.map(line => `<span>${escapeHtml(line)}</span>`).join("")}</div><div class="verse-explanation">${explanation}</div></div></article>`);
  }
  return { html: `${introRendered.html}<div class="verse-collection">${entries.join("")}</div>${studyRendered.html}`, nav: [...nav, ...studyRendered.nav] };
}

const introHeadings = {
  "শ্রীমদ্ভাগবত আসলে কী?": "শ্রীমদ্ভাগবত রচনার পটভূমি",
  "গ্রন্থটির গঠন": "বারো স্কন্ধের বিষয়বিন্যাস",
  "কিন্তু পুরো ভাগবতটা কৃষ্ণলীলা নয়": "ভক্তির কাহিনি থেকে কৃষ্ণলীলা",
  "পরীক্ষিত মহারাজ ও শুকদেব গোস্বামী": "পরীক্ষিৎ ও শুকদেবের কথোপকথন",
};

const verseSectionHeadings = {
  "শ্রীমদ্ভাগবত — ২৫টি গুরুত্বপূর্ণ শ্লোক": "ভক্তিপথের ২৫টি নির্বাচিত শ্লোক",
  "২৫টি থেকে প্রথমে কোনগুলি মুখস্থ করবেন?": "মুখস্থের জন্য সাতটি শ্লোক",
};

const timelineHeadings = {
  "Śrīmad Bhāgavatam — Who's Who + Timeline Map": "শ্রীমদ্ভাগবত: চরিত্রপরিচয় ও কালক্রম",
  "Level 1 — Cosmic beginning": "প্রথম স্তর — সৃষ্টির আদিপর্ব",
  "Level 2 — স্বায়ম্ভুব মনুর যুগ": "দ্বিতীয় স্তর — স্বায়ম্ভুব মনুর যুগ",
  "স্বায়ম্ভুব মনু ↔ শতরূপা": "স্বায়ম্ভুব মনু ও শতরূপা",
  "দেবহূতি → কপিলদেব": "দেবহূতি ও কপিলদেব",
  "নারদ ↔ প্রাচীনবর্হি": "নারদ ও প্রাচীনবর্হির সংলাপ",
  "ঋষভদেব → ভরত": "ঋষভদেব ও ভরত",
  "জড় ভরত ↔ রাজা রহূগণ": "জড় ভরত ও রাজা রহূগণের সংলাপ",
  "হিরণ্যকশিপু → প্রহ্লাদ": "হিরণ্যকশিপু ও প্রহ্লাদ",
  "বসুদেব + দেবকী": "বসুদেব ও দেবকী",
  "একই broad period — ধ্রুব মহারাজ": "একই কালপর্বে ধ্রুব মহারাজ",
  "একটা জিনিস খেয়াল করুন — নারদ timeline-crossing character": "বিভিন্ন সময়পর্বে দেবর্ষি নারদ",
  "প্রহ্লাদ মহারাজ — এখানে chronology tricky": "প্রহ্লাদের কাহিনি ও পুরাণীয় কালক্রম",
  "গজেন্দ্র — অন্য মন্বন্তরের কাহিনি": "গজেন্দ্রের কাহিনি — অন্য মন্বন্তরের প্রেক্ষাপটে",
  "তারপর মানবীয় genealogy আমাদের পরিচিত হতে শুরু করে": "রাজবংশের ধারায় পরিচিত মানবীয় কালক্রম",
  "Krishna period — এখানে চরিত্রগুলো একত্র হয়": "কৃষ্ণের সমসাময়িক চরিত্রেরা",
  "এখন সম্পর্কগুলো দেখুন": "চরিত্রগুলোর পারস্পরিক সম্পর্ক",
  "Mahābhārata → Krishna → Parīkṣit connection": "মহাভারত, কৃষ্ণ ও পরীক্ষিতের যোগসূত্র",
  "তারপর শুকদেব": "শুকদেবের কাছে ভাগবত শ্রবণ",
  "তারপর সূত গোস্বামী": "সূত গোস্বামীর মাধ্যমে ভাগবত-কথার প্রচার",
  "এবার পুরো Approximate Purāṇic Timeline": "পুরাণীয় কালক্রম — একটি সংক্ষিপ্ত সারণি",
  "কিন্তু একটা আরও সুন্দর Mental Model আছে": "কালক্রম বোঝার তিনটি দৃষ্টিকোণ",
};

function editTimeline(markdown) {
  const replacements = [
    ["**ব্যাসদেব → শুকদেব → পরীক্ষিৎ**  \nএবং পরে  \n**সূত গোস্বামী → শৌনকাদি ঋষি**", "**ব্যাসদেব → শুকদেব → পরীক্ষিৎ → সূত গোস্বামী → শৌনকাদি ঋষি**"],
    ["এখন দুটো বিশাল branch তৈরি হচ্ছে।", "মনুর এই দুই সন্তানের বংশধারা থেকে কপিলদেব ও ধ্রুব মহারাজের কাহিনি এগিয়েছে।"],
    ["এটা মনে রাখলে স্কন্ধ ৩–৪ হঠাৎ অনেক পরিষ্কার হয়ে যায়।", "এই বংশচিত্রে তৃতীয় ও চতুর্থ স্কন্ধের কাহিনিগুলির পারিবারিক যোগসূত্র স্পষ্ট হয়।"],
    ["এবং এখানেই:\n\n### নারদ ও প্রাচীনবর্হির সংলাপ", "এই প্রসঙ্গে নারদ ও প্রাচীনবর্হির সংলাপও এসেছে।\n\n### নারদ ও প্রাচীনবর্হির সংলাপ"],
    ["তারপর:\n\n### জড় ভরত ও রাজা রহূগণের সংলাপ\n\nএটিও ভাগবতের অত্যন্ত গুরুত্বপূর্ণ conversation।\n\nআগের map-এ এটি যোগ করা উচিত।", "### জড় ভরত ও রাজা রহূগণের সংলাপ"],
    ["### স্বায়ম্ভুব মনু ↔ শতরূপা", "### স্বায়ম্ভুব মনু ও শতরূপা"],
    ["### নারদ ↔ প্রাচীনবর্হি", "### নারদ ও প্রাচীনবর্হির সংলাপ"],
    ["### জড় ভরত ↔ রাজা রহূগণ", "### জড় ভরত ও রাজা রহূগণের সংলাপ"],
    ["### বসুদেব + দেবকী", "### বসুদেব ও দেবকী"],
    ["হ্যাঁ—এটা করা যায়, এবং করলে ভাগবত বোঝা অনেক সহজ হবে। তবে একটা গুরুত্বপূর্ণ distinction রাখতে হবে:", "শ্রীমদ্ভাগবতের ঘটনাক্রম বুঝতে একটি বিষয় মনে রাখা জরুরি:"],
    ["শ্রীমদ্ভাগবত modern BCE/CE calendar দেয় না", "শ্রীমদ্ভাগবত আধুনিক খ্রিষ্টীয় সালপঞ্জি অনুযায়ী ঘটনার তারিখ দেয় না"],
    ["তাই “ধ্রুব ঠিক কত BCE?” বলার চেয়ে", "তাই “ধ্রুব ঠিক কোন খ্রিষ্টপূর্ব সালে?” জিজ্ঞাসা করার চেয়ে"],
    ["আর একটা মজার ব্যাপার:", "এখানে আরও একটি পার্থক্য মনে রাখা দরকার:"],
    ["ভাগবতের narration-এর chronology এবং ঘটনাগুলোর historical/cosmic chronology এক নয়।", "ভাগবতের কথনক্রম এবং ঘটনাগুলোর ঐতিহাসিক বা মহাজাগতিক কালক্রম এক নয়।"],
    ["প্রথমে দুটো timeline আলাদা করি।", "এই পার্থক্যটি বুঝতে কথনক্রম ও ঘটনাক্রম—দুই ধারাকে আলাদা করে দেখা যাক।"],
    ["**Narration timeline:**", "**কথনক্রম:**"],
    ["কিন্তু **events timeline** বহু বিশাল:", "অন্যদিকে, **ঘটনাক্রম** বিস্তৃত—সৃষ্টির আদিপর্ব থেকে বিভিন্ন মন্বন্তর, রাজবংশ ও অবতারলীলার মধ্য দিয়ে তা এগিয়েছে:"],
    ["এবার একটু পরিষ্কার করে দেখি।", "এই দুই ধারার প্রধান যোগসূত্রগুলি নিচে সাজানো হয়েছে।"],
    ["ভগবান আদিকবি ব্রহ্মার হৃদয়ে বৈদিক জ্ঞান প্রকাশ করেন।", "ভাগবতের বর্ণনা অনুযায়ী, ভগবান আদিকবি ব্রহ্মার হৃদয়ে বৈদিক জ্ঞান প্রকাশ করেন।"],
    ["তাঁদের সন্তানদের মধ্যে:\n\n**দেবহূতি**  \nএবং  \n**উত্তানপাদ**।", "তাঁদের সন্তানদের মধ্যে দেবহূতি ও উত্তানপাদ বিশেষভাবে উল্লেখযোগ্য; তাঁদের বংশধারায় যথাক্রমে কপিলদেব ও ধ্রুব মহারাজের কাহিনি এসেছে।"],
    ["**স্কন্ধ ৩**\n\nদেবহূতির বিবাহ হয় **কর্দম মুনির** সঙ্গে।\n\nতাঁদের পুত্র:", "**তৃতীয় স্কন্ধে** দেবহূতির সঙ্গে **কর্দম মুনির** বিবাহ এবং তাঁদের পুত্র **ভগবান কপিলদেবের** আবির্ভাব বর্ণিত হয়েছে।"],
    ["তারপর বিখ্যাত:\n\n**দেবহূতি ↔ কপিলদেব**\n\nConversation:", "দেবহূতি ও কপিলদেবের সংলাপে আলোচিত হয়েছে:"],
    ["অর্থাৎ কপিলদেবের ঘটনা **কৃষ্ণের পৃথিবীর লীলার বহু বহু পূর্ববর্তী cosmic history** হিসেবে ভাগবতে বর্ণিত।", "অর্থাৎ, ভাগবতে কপিলদেবের ঘটনাকে **কৃষ্ণের পৃথিবীলীলার বহু পূর্ববর্তী মহাজাগতিক ইতিহাসের** অংশ হিসেবে বর্ণনা করা হয়েছে।"],
    ["স্বায়ম্ভুব মনুর পুত্র:\n\n**উত্তানপাদ**\n\nতাঁর পুত্র:\n\n### ধ্রুব মহারাজ", "স্বায়ম্ভুব মনুর পুত্র উত্তানপাদ; তাঁর পুত্র ধ্রুব মহারাজ।"],
    ["ধ্রুব তখন শিশু।\n\n**নারদ ↔ ধ্রুব**\n\nনারদ তাঁকে সাধনার পথ দেখান।\n\nতাই interestingly—\n\n**কপিল ও ধ্রুব completely unrelated random stories নন।**\n\nতাঁরা একই **স্বায়ম্ভুব-মনু centred ancient world**-এর অংশ।", "ধ্রুব তখন শিশু। দেবর্ষি নারদ তাঁকে সাধনার পথ দেখান। কপিলদেব ও ধ্রুবের কাহিনি বিচ্ছিন্ন নয়; দুটিই স্বায়ম্ভুব মনুর বংশধারার একই প্রাচীন কালপর্বের সঙ্গে যুক্ত।"],
    ["**স্কন্ধ ৪**\n\nধ্রুবের narrative-এর পরে ভাগবত পৃথুর কাহিনিতে যায়।", "**চতুর্থ স্কন্ধে** ধ্রুবের কাহিনির পর ভাগবত পৃথু মহারাজের প্রসঙ্গে যায়।"],
    ["পৃথুকে ভগবানের **শক্ত্যাবেশ-অবতার** হিসেবে বর্ণনা করা হয়।\n\nতারপর আসে আরেক lineage:", "পৃথুকে ভগবানের **শক্ত্যাবেশ-অবতার** হিসেবে বর্ণনা করা হয়েছে। এই ধারার পর আসে আরেকটি বংশসূত্র:"],
    ["আপনার প্রশ্নের এখানেই একটা খুব সুন্দর উত্তর আছে।\n\nনারদকে আমরা পাই:\n\n**ব্যাসের সঙ্গে**  \n**ধ্রুবের সঙ্গে**  \n**প্রহ্লাদের context-এ**  \n**প্রাচীনবর্হির সঙ্গে**  \n**কৃষ্ণলীলাতেও**।", "বিভিন্ন কালপর্ব ও কাহিনিতে দেবর্ষি নারদের উপস্থিতি দেখা যায়—ব্যাসদেব, ধ্রুব, প্রহ্লাদ ও প্রাচীনবর্হির প্রসঙ্গে, এমনকি কৃষ্ণলীলাতেও।"],
    ["কারণ পুরাণীয় cosmology-তে নারদ সাধারণ মানুষের মতো ৭০–৮০ বছরের historical character নন।\n\nতিনি **দেবর্ষি**।\n\nতাই তাঁকে বিভিন্ন যুগ ও বিশাল সময়পর্বে দেখা যায়।", "পুরাণীয় বিশ্বদৃষ্টিতে নারদ সাধারণ মানুষের মতো সীমিত আয়ুর ঐতিহাসিক চরিত্র নন; তিনি দেবর্ষি। তাই বিভিন্ন যুগ ও দীর্ঘ সময়পর্বের কাহিনিতে তাঁর উপস্থিতি বর্ণিত হয়েছে।"],
    ["**স্কন্ধ ৫**\n\nএরপর আরেকটি অত্যন্ত গুরুত্বপূর্ণ lineage:", "**পঞ্চম স্কন্ধে** ঋষভদেব ও তাঁর পুত্র ভরতকে ঘিরে আরেকটি গুরুত্বপূর্ণ বংশধারা বর্ণিত হয়েছে:"],
    ["এই ভরত মহারাজের কাহিনি তিন জন্মে বিস্তৃত:", "এই ভরত মহারাজের কাহিনি পরপর তিন জন্মে বিস্তৃত:"],
    ["তারপর:\n\n### জড় ভরত ↔ রাজা রহূগণ\n\nএটিও ভাগবতের অত্যন্ত গুরুত্বপূর্ণ conversation।", "পরবর্তী জন্মে ভরত জড় ভরত হন। তাঁর সঙ্গে রাজা রহূগণের সংলাপও ভাগবতের একটি গুরুত্বপূর্ণ প্রসঙ্গ।"],
    ["এখানে আসে:\n\n**আমি শরীর নই → আত্মতত্ত্ব → অহংকার → সাধুসঙ্গ।**", "এই সংলাপে দেহ ও আত্মার পার্থক্য, আত্মতত্ত্ব, অহংকার এবং সাধুসঙ্গের প্রসঙ্গ উঠে আসে।"],
    ["এটি অত্যন্ত প্রাচীন ঘটনা।\n\nহিরণ্যকশিপু ও হিরণ্যাক্ষ আসলে **জয়-বিজয়ের প্রথম অসুরজন্ম**—ভাগবতের narrative অনুযায়ী।", "ভাগবতের বর্ণনা অনুযায়ী, হিরণ্যকশিপু ও হিরণ্যাক্ষ জয়-বিজয়ের প্রথম অসুরজন্ম; তাই প্রহ্লাদের কাহিনি পুরাণীয় কালক্রমের প্রাচীন পর্বের সঙ্গে যুক্ত।"],
    ["আর তাঁর পুত্র প্রহ্লাদ—\n\n**নৃসিংহদেবের মহান ভক্ত।**\n\nএখানে:", "হিরণ্যকশিপুর পুত্র প্রহ্লাদ ছিলেন নৃসিংহদেবের মহান ভক্ত। তাঁদের কাহিনিতে রয়েছে একাধিক সংলাপ ও প্রার্থনা:"],
    ["এখানে আরও একটা গুরুত্বপূর্ণ ব্যাপার বোঝা যায়।\n\nসব ঘটনা একই সরল human dynasty-তে বসানো যাবে না।", "গজেন্দ্রের কাহিনি থেকে বোঝা যায়, ভাগবতের সব ঘটনা একটি সরল মানবীয় বংশধারায় সাজানো যায় না।"],
    ["অর্থাৎ timeline-কে শুধু\n\n**ধ্রুব → প্রহ্লাদ → গজেন্দ্র → কৃষ্ণ**\n\nএইভাবে ordinary historical timeline ভাবলে ভুল হতে পারে।", "তাই **ধ্রুব → প্রহ্লাদ → গজেন্দ্র → কৃষ্ণ**—এই ধারাকে সাধারণ ঐতিহাসিক কালক্রম বলে ধরে নেওয়া ঠিক হবে না।"],
    ["আমরা বর্তমানে পুরাণীয় হিসাবে **বৈবস্বত মন্বন্তরে** আছি।", "পুরাণীয় গণনা অনুসারে, আমরা বর্তমানে **বৈবস্বত মন্বন্তরে** আছি।"],
    ["স্কন্ধ ৯-এ দুটি বিশাল dynasty গুরুত্বপূর্ণ।", "নবম স্কন্ধে দুটি রাজবংশের ধারাবাহিকতা বিশেষভাবে গুরুত্বপূর্ণ।"],
    ["আরেকটি branch:", "চন্দ্রবংশের আরেকটি ধারা হলো:"],
    ["এবং নন্দ-যশোদার ব্রজলীলা।", "একই সময়ে নন্দ–যশোদার গৃহে কৃষ্ণের ব্রজলীলাও বর্ণিত হয়েছে।"],
    ["এখন আমাদের পরিচিত timeline অনেক compact হয়ে আসে।\n\nএকই broad Krishna-era-তে:", "কৃষ্ণের সময়পর্বে বহু পরিচিত চরিত্রের কাহিনি একত্রিত হয়েছে। তাঁদের মধ্যে রয়েছেন:"],
    ["এরা broadly overlapping narrative world-এর মানুষ।", "ভাগবতের বর্ণনায় তাঁদের কাহিনিগুলি একই বৃহত্তর সময়পর্বে এসে মিলেছে।"],
    ["### বিদুর কে?\n\nবিদুর ছিলেন **ধৃতরাষ্ট্র ও পাণ্ডুর সৎভ্রাতা**।\n\nতাই তিনি পাণ্ডবদের কাকা।\n\nতিনি কৃষ্ণের ভক্ত এবং পাণ্ডবদের শুভাকাঙ্ক্ষী।", "### বিদুর\n\nবিদুর ছিলেন **ধৃতরাষ্ট্র ও পাণ্ডুর সৎভ্রাতা**, অর্থাৎ পাণ্ডবদের কাকা। তিনি কৃষ্ণের ভক্ত ও পাণ্ডবদের শুভাকাঙ্ক্ষী ছিলেন।"],
    ["### উদ্ধব কে?\n\nউদ্ধব যদুবংশীয় এবং কৃষ্ণের অত্যন্ত ঘনিষ্ঠ ভক্ত, বন্ধু ও উপদেষ্টা।\n\nকৃষ্ণ তাঁকেই বৃন্দাবনে পাঠিয়েছিলেন।", "### উদ্ধব\n\nযদুবংশীয় উদ্ধব ছিলেন কৃষ্ণের ঘনিষ্ঠ ভক্ত, বন্ধু ও উপদেষ্টা। কৃষ্ণ তাঁকেই বৃন্দাবনে পাঠিয়েছিলেন।"],
    ["পরে:\n\n**কৃষ্ণ → উদ্ধব → উদ্ধবগীতা।**", "পরবর্তীকালে কৃষ্ণের উপদেশ উদ্ধবগীতা নামে পরিচিত হয়।"],
    ["### মৈত্রেয় কে?\n\nমৈত্রেয় একজন মহান ঋষি।\n\nকৃষ্ণের অন্তিম লীলার সময় উদ্ধব ও মৈত্রেয়—দুজনের উপস্থিতির প্রসঙ্গ ভাগবতে আসে।\n\nপরবর্তীতে:\n\n**বিদুর → মৈত্রেয়**\n\nএবং শুরু হয় দীর্ঘ শিক্ষা।", "### মৈত্রেয়\n\nমৈত্রেয় একজন মহান ঋষি। কৃষ্ণের অন্তিম লীলার সময় উদ্ধব ও মৈত্রেয়—দুজনের উপস্থিতির প্রসঙ্গ ভাগবতে এসেছে। পরে বিদুর মৈত্রেয়ের কাছে যান, এবং তাঁদের মধ্যে দীর্ঘ শিক্ষামূলক কথোপকথন শুরু হয়।"],
    ["এটাই সবচেয়ে useful family tree:", "এই বংশধারাটি পরীক্ষিতের সঙ্গে পাণ্ডবদের সম্পর্ক স্পষ্ট করে:"],
    ["অর্থাৎ—\n\n### পরীক্ষিৎ = অর্জুনের পৌত্র।\n\nআর তাঁর পিতা **অভিমন্যু**, যিনি কুরুক্ষেত্র যুদ্ধে নিহত হন।", "পরীক্ষিত ছিলেন অর্জুনের পৌত্র; তাঁর পিতা অভিমন্যু কুরুক্ষেত্র যুদ্ধে নিহত হন।"],
    ["এটা অত্যন্ত সুন্দর connection:", "এই ঘটনাগুলির মধ্যে একটি তাৎপর্যপূর্ণ যোগসূত্র রয়েছে:"],
    ["### ব্যাসদেব → শুকদেব\n\nশুকদেব গোস্বামী হলেন **ব্যাসদেবের পুত্র**।\n\nএখন chain:", "ব্যাসদেবের পুত্র শুকদেব গোস্বামী পরীক্ষিতকে ভাগবত শোনান। তাঁদের কথোপকথনের আগে রয়েছে নারদ ও ব্যাসদেবের গুরু-পরম্পরা:"],
    ["কিন্তু পরীক্ষিৎ ও শুকদেব guru-family relation-এ যুক্ত নন।\n\nশুকদেব এসে পরীক্ষিৎকে ভাগবত শোনান।", "পরীক্ষিত ও শুকদেবের মধ্যে পারিবারিক বা গুরু-শিষ্য সম্পর্ক ছিল না; শুকদেব তাঁকে ভাগবত শোনান।"],
    ["পরীক্ষিৎ ↔ শুকদেবের এই কথোপকথন **সূত গোস্বামী শুনেছিলেন**।", "পরীক্ষিত ও শুকদেবের এই কথোপকথন সূত গোস্বামী শুনেছিলেন।"],
    ["এটাই আমাদের **Bhāgavatam nesting architecture**।", "এইভাবেই ভাগবতের মূল কথনধারার মধ্যে আরও প্রাচীন বহু কথোপকথন স্থান পেয়েছে।"],
    ["এখানে ইচ্ছাকৃতভাবে BCE দিচ্ছি না। কারণ কৃষ্ণের কাল নিয়ে বিভিন্ন traditional ও academic chronology আছে; ভাগবত নিজে modern calendar date দিয়ে ঘটনাগুলো সাজায় না।", "সারণিতে খ্রিষ্টপূর্ব সাল দেওয়া হয়নি। কৃষ্ণের কাল নির্ণয়ে বিভিন্ন প্রথাগত ও গবেষণাভিত্তিক মত রয়েছে; ভাগবত আধুনিক সালপঞ্জির তারিখ দিয়ে ঘটনাগুলি সাজায় না।"],
    ["| Purāṇic phase | প্রধান চরিত্র | প্রধান শিক্ষা/Conversation |", "| পুরাণীয় কালপর্ব | প্রধান চরিত্র | শিক্ষা বা সংলাপ |"],
    ["| প্রাচীন মন্বন্তরীয় কাল | স্বায়ম্ভুব মনু | primordial humanity |", "| প্রাচীন মন্বন্তরীয় কাল | স্বায়ম্ভুব মনু | মানববংশের আদিপর্ব |"],
    ["| একই ancient cycle | কর্দম–দেবহূতি–কপিল | **কপিল ↔ দেবহূতি** |", "| একই প্রাচীন কালচক্র | কর্দম–দেবহূতি–কপিল | **কপিল ↔ দেবহূতি** |"],
    ["| একই broad era | উত্তানপাদ–ধ্রুব | **নারদ ↔ ধ্রুব** |", "| একই কালপর্ব | উত্তানপাদ–ধ্রুব | **নারদ ↔ ধ্রুব** |"],
    ["| প্রাচীন cosmic history | হিরণ্যকশিপু–প্রহ্লাদ | **প্রহ্লাদ ↔ হিরণ্যকশিপু** |", "| প্রাচীন পুরাণীয় ইতিহাস | হিরণ্যকশিপু–প্রহ্লাদ | **প্রহ্লাদ ↔ হিরণ্যকশিপু** |"],
    ["| প্রাচীন রাজর্ষি history | ঋষভ–ভরত | **জড় ভরত ↔ রহূগণ** |", "| প্রাচীন রাজর্ষি-পর্ব | ঋষভ–ভরত | **জড় ভরত ↔ রহূগণ** |"],
    ["| দ্বাপর→কলি সন্ধি | **শুকদেব ↔ পরীক্ষিৎ** | ভাগবতের central narration |", "| দ্বাপর–কলির সন্ধিক্ষণ | **শুকদেব ↔ পরীক্ষিত** | ভাগবতের মূল কথনধারা |"],
    ["| পরবর্তী narration | **সূত ↔ শৌনকাদি ঋষি** | আমরা যে ভাগবত পাই |", "| পরবর্তী কথনপর্ব | **সূত ↔ শৌনকাদি ঋষি** | তাঁদের মাধ্যমে ভাগবত-কথা প্রচারিত হয় |"],
    ["ভাগবতের timeline-কে আমি **একটি সরল রেখা হিসেবে মনে রাখতাম না**।\n\nবরং তিনটি layer:", "ভাগবতের কালক্রমকে একটি সরল রেখা হিসেবে না দেখে তিনটি পরস্পর-সম্পর্কিত স্তরে বোঝা যায়:"],
    ["**Layer 1 — Cosmic history**", "**প্রথম স্তর — মহাজাগতিক ইতিহাস**"],
    ["**Layer 2 — Krishna/Mahābhārata history**", "**দ্বিতীয় স্তর — কৃষ্ণ ও মহাভারতের সময়পর্ব**"],
    ["**Layer 3 — Transmission of Bhāgavatam**", "**তৃতীয় স্তর — ভাগবত-কথার প্রচারধারা**"],
    ["এই **তৃতীয় timeline-টাই** সম্ভবত সবচেয়ে গুরুত্বপূর্ণ।", "এই তৃতীয় ধারাটি বিশেষভাবে গুরুত্বপূর্ণ।"],
    ["আর আপনার আগের conversation-map এবং এই timeline-কে একসঙ্গে রাখলে একটা দারুণ **one-page “Śrīmad Bhāgavatam Master Map” বানানো সম্ভব**: বাঁদিকে **cosmic timeline**, মাঝখানে **family/guru tree**, ডানদিকে **major conversations**, আর নিচে **১২ স্কন্ধের flow**। এটা এমনভাবে করা যায় যাতে ভাগবত পড়ার সময় reference sheet হিসেবে পাশে রাখা যায়।", ""],
  ];
  for (const [before, after] of replacements) markdown = markdown.replace(before, after);
  return markdown
    .replace(/timeline/gi, "সময়রেখা")
    .replace(/branch/gi, "বংশধারা")
    .replace(/conversation/gi, "কথোপকথন")
    .replace(/\bmap\b/gi, "মানচিত্র")
    .replace("Śrīmad Bhāgavatam — Who's Who + সময়রেখা মানচিত্র", "শ্রীমদ্ভাগবত: চরিত্রপরিচয় ও কালক্রম")
    .replace("Level 1 — Cosmic beginning", "প্রথম স্তর — সৃষ্টির আদিপর্ব")
    .replace("Level 2 — স্বায়ম্ভুব মনুর যুগ", "দ্বিতীয় স্তর — স্বায়ম্ভুব মনুর যুগ")
    .replace("একটা জিনিস খেয়াল করুন — নারদ সময়রেখা-crossing character", "বিভিন্ন সময়পর্বে দেবর্ষি নারদ")
    .replace("প্রহ্লাদ মহারাজ — এখানে chronology tricky", "প্রহ্লাদের কাহিনি ও পুরাণীয় কালক্রম")
    .replace("Krishna period — এখানে চরিত্রগুলো একত্র হয়", "কৃষ্ণের সমসাময়িক চরিত্রেরা")
    .replace("Mahābhārata → Krishna → Parīkṣit connection", "মহাভারত, কৃষ্ণ ও পরীক্ষিতের যোগসূত্র")
    .replace("এবার পুরো Approximate Purāṇic সময়রেখা", "পুরাণীয় কালক্রম — একটি সংক্ষিপ্ত সারণি")
    .replace("কিন্তু একটা আরও সুন্দর Mental Model আছে", "কালক্রম বোঝার তিনটি দৃষ্টিকোণ")
    .replace("**events সময়রেখা** বহু বিশাল:", "অন্যদিকে, **ঘটনাক্রম** বিস্তৃত—সৃষ্টির আদিপর্ব থেকে বিভিন্ন মন্বন্তর, রাজবংশ ও অবতারলীলার মধ্য দিয়ে তা এগিয়েছে:")
    .replace("একটি গুরুত্বপূর্ণ guru-paramparā-ও মনে রাখতে পারেন:", "একটি গুরুত্বপূর্ণ গুরু-পরম্পরাও মনে রাখা দরকার:")
    .replace("একটি গুরুত্বপূর্ণ গুরু-পরম্পরাও মনে রাখা দরকার:", "একটি গুরুত্বপূর্ণ গুরু-পরম্পরার ধারাও রয়েছে:")
    .replace("**সময়:** বর্তমান ব্রহ্মাণ্ডীয় সৃষ্টিচক্রের আদিপর্ব।", "**কালপর্ব:** বর্তমান ব্রহ্মাণ্ডীয় সৃষ্টিচক্রের আদিপর্ব।")
    .replace("ভাগবতের প্রথম শ্লোকেই ইঙ্গিত:", "ভাগবতের প্রথম শ্লোকে একটি ইঙ্গিত রয়েছে:")
    .replace("তবে এটি biological family tree নয়; **শিক্ষা/গুরু-পরম্পরা**।", "এটি বংশপরিচয় নয়; এটি শিক্ষা ও গুরু-পরম্পরার ধারা।")
    .replace("এখন দুটো বিশাল বংশধারা তৈরি হচ্ছে।", "মনুর এই দুই সন্তানের বংশধারা থেকে কপিলদেব ও ধ্রুব মহারাজের কাহিনি এগিয়েছে।")
    .replace("আগের মানচিত্র-এ এটি যোগ করা উচিত।", "")
    .replace("আগের map-এ এটি যোগ করা উচিত।", "")
    .replace("আবার map-এ এটি যোগ করা উচিত।", "")
    .replace("**Conversation:**", "**সংলাপের মূল বিষয়:**")
    .replace("**আমি শরীর নই → আত্মতত্ত্ব → অহংকার → সাধুসঙ্গ।**", "দেহ ও আত্মার পার্থক্য, আত্মতত্ত্ব, অহংকার এবং সাধুসঙ্গের প্রসঙ্গ এই সংলাপে উঠে আসে।")
    .replace("**প্রহ্লাদ ↔ হিরণ্যকশিপু**  \n**প্রহ্লাদ ↔ অসুরবালক**  \n**প্রহ্লাদ ↔ নৃসিংহদেব।**", "**প্রহ্লাদ ও হিরণ্যকশিপু**  \n**প্রহ্লাদ ও অসুরবালকেরা**  \n**প্রহ্লাদ ও নৃসিংহদেব**")
    .replace("**রাজা ভরত**  \n↓  \n**হরিণ**  \n↓  \n**জড় ভরত**", "**রাজা ভরত → হরিণ → জড় ভরত**")
    .replace("কৃষ্ণের আগে।\n\nপুরাণীয় যুগবিভাগে:\n\n**রাম → ত্রেতাযুগ**", "পুরাণীয় যুগবিভাগে শ্রীরামের লীলা ত্রেতাযুগে বর্ণিত; তা কৃষ্ণলীলার পূর্ববর্তী।")
    .replace("পরীক্ষিৎ তখন মাতৃগর্ভে।\n\nঅশ্বত্থামার ব্রহ্মাস্ত্র থেকে গর্ভস্থ পরীক্ষিৎকে **কৃষ্ণ রক্ষা করেন**।", "পরীক্ষিৎ তখন মাতৃগর্ভে ছিলেন। অশ্বত্থামার ব্রহ্মাস্ত্র থেকে কৃষ্ণ তাঁকে রক্ষা করেন।")
    .replace("**বসুদেব + দেবকী**", "**বসুদেব ও দেবকী**")
    .replace("এখানে দুটো বিশাল বংশধারা তৈরি হচ্ছে।", "মনুর এই দুই সন্তানের বংশধারা থেকে কপিলদেব ও ধ্রুব মহারাজের কাহিনি এগিয়েছে।")
    .replace("এখন দুটো বিশাল বংশধারা তৈরি হচ্ছে।", "মনুর এই দুই সন্তানের বংশধারা থেকে কপিলদেব ও ধ্রুব মহারাজের কাহিনি এগিয়েছে।")
    .replace("এখানে দুটো বিশাল branch তৈরি হচ্ছে।", "মনুর এই দুই সন্তানের বংশধারা থেকে কপিলদেব ও ধ্রুব মহারাজের কাহিনি এগিয়েছে।")
    .replace("নারদ বলেন **পুরঞ্জনের উপাখ্যান**।", "নারদ প্রাচীনবর্হিকে **পুরঞ্জনের উপাখ্যান** শোনান।")
    .replace("এই দুই ধারার প্রধান যোগসূত্রগুলি নিচে সাজানো হয়েছে।", "প্রতিটি পর্বের চরিত্র ও কথোপকথনের যোগসূত্র নিচে সংক্ষেপে দেখানো হয়েছে।")
    .replace("এখানে ভাগবতের অনেক গুরুত্বপূর্ণ চরিত্র।", "স্বায়ম্ভুব মনুর বংশধারায় ভাগবতের একাধিক গুরুত্বপূর্ণ চরিত্রের কাহিনি স্থান পেয়েছে।")
    .replace("এবং এখানেই:\n\n### নারদ ও প্রাচীনবর্হির সংলাপ", "### নারদ ও প্রাচীনবর্হির সংলাপ")
    .replace("আগের মানচিত্র-এ এটি যোগ করা উচিত।", "")
    .replace("এটিও ভাগবতের অত্যন্ত গুরুত্বপূর্ণ কথোপকথন।", "")
    .replace("তারপর:\n\n### জড় ভরত ও রাজা রহূগণের সংলাপ", "### জড় ভরত ও রাজা রহূগণের সংলাপ")
    .replace("বরং পুরাণের সময়:", "বরং পুরাণীয় সময়চক্রের স্তরগুলি এভাবে সাজানো:")
    .replace("অর্থাৎ:\n\n### শ্রীরাম", "")
    .replace(/\*\*শ্রীকৃষ্ণ\*\*  \n\*\*বলরাম\*\*[\s\S]*?\*\*ভীষ্ম\*\*।/, "**শ্রীকৃষ্ণ, বলরাম, নন্দ–যশোদা, গোপীগণ, উদ্ধব, অক্রূর, বসুদেব–দেবকী, পাণ্ডবগণ, বিদুর, ব্যাসদেব, নারদ, মৈত্রেয়, কুন্তী ও ভীষ্ম**।")
    .replace(/এই যদুবংশ থেকেই পরে:\s*### বসুদেব[^\n]*\n\s*↓\s*\n\s*### শ্রীকৃষ্ণ\s*\n\s*(?:একই সময়ে নন্দ–যশোদার গৃহে কৃষ্ণের ব্রজলীলাও বর্ণিত হয়েছে\.|এবং নন্দ-যশোদার ব্রজলীলা।)/, "এই যদুবংশেই বসুদেব ও দেবকীর পুত্ররূপে শ্রীকৃষ্ণের আবির্ভাব ঘটে। একই সময়ে নন্দ–যশোদার গৃহে তাঁর ব্রজলীলাও বর্ণিত হয়েছে।")
    .replace("এটাই আমাদের **ভাগবতের nesting architecture**।", "এইভাবেই ভাগবতের মূল কথনধারার মধ্যে আরও প্রাচীন বহু কথোপকথন স্থান পেয়েছে।")
    .replace(/\n\nআর আপনার আগের [\s\S]*/, "");
}

function editIntroduction(markdown) {
  return markdown
    .replace(/^অবশ্যই। /, "")
    .replace("এর মূল কথাটি খুব সুন্দরভাবে বলা যায়—", "ভক্তির উদ্দেশ্য সম্পর্কে গ্রন্থটির মূল শিক্ষা এক বাক্যে ধরা যায়।")
    .replace("এটা বোঝা খুব গুরুত্বপূর্ণ। শ্রীমদ্ভাগবত যেন ধীরে ধীরে পাঠককে **কৃষ্ণের দিকে নিয়ে যায়**।", "বিভিন্ন ভক্তের অভিজ্ঞতার মধ্য দিয়ে শ্রীমদ্ভাগবত ধীরে ধীরে পাঠককে **কৃষ্ণের দিকে নিয়ে যায়**।")
    .replace("গজেন্দ্রের কাহিনিতে শরণাগতি। এইভাবে একটির পর একটি স্তর পেরিয়ে দশম স্কন্ধে কৃষ্ণের অন্তরঙ্গ লীলায় প্রবেশ।", "গজেন্দ্রের কাহিনিতে ফুটে ওঠে শরণাগতি। ভক্তির এই নানা রূপের মধ্য দিয়ে পাঠক দশম স্কন্ধে কৃষ্ণের অন্তরঙ্গ লীলায় প্রবেশ করেন।")
    .replace("পুরো গ্রন্থটির একটি অসাধারণ narrative frame আছে।", "পরীক্ষিৎ মহারাজ ও শুকদেব গোস্বামীর কথোপকথন গ্রন্থটির মূল বর্ণনাকে একসূত্রে ধরে রেখেছে।")
    .replace("তাই ভাগবত শুধু কৃষ্ণের জীবনী নয়। এর গভীর প্রশ্ন হলো:", "কৃষ্ণলীলার বর্ণনার মধ্য দিয়েও ভাগবত মানুষের জীবনের একটি মৌলিক প্রশ্ন সামনে আনে।")
    .replace("এজন্যই শ্রীমদ্ভাগবতের বিখ্যাত শিক্ষা:", "ভাগবতের এই শিক্ষাটি দ্বিতীয় অধ্যায়ের ষষ্ঠ শ্লোকে প্রকাশ পেয়েছে।")
    .replace("এই **“অহৈতুকী ভক্তি”** ধারণাটিই আসলে শ্রীমদ্ভাগবতের হৃদয়ের খুব কাছাকাছি।", "**অহৈতুকী ভক্তি** শ্রীমদ্ভাগবতের অন্যতম কেন্দ্রীয় ভাব।");
}

const conversationHeadings = {
  "১. শৌনকাদি ঋষিদের প্রশ্ন — কলিযুগে মানুষের পরম মঙ্গল": "১. শৌনকাদি ঋষি–সূত সংলাপ — কলিযুগে মানুষের পরম মঙ্গল",
  "২. ব্যাসদেবের প্রতি নারদের উপদেশ — ভাগবত রচনার পটভূমি": "২. নারদ–ব্যাসদেব সংলাপ — ভাগবত রচনার পটভূমি",
  "৩. শুকদেবের কাছে পরীক্ষিতের প্রশ্ন — মৃত্যুর মুখে মানুষের কর্তব্য": "৩. পরীক্ষিৎ–শুকদেব সংলাপ — মৃত্যুর মুখে মানুষের কর্তব্য",
  "Śrīmad Bhāgavatam — Conversation Map": "শ্রীমদ্ভাগবতের কথোপকথন",
  "প্রথমে Master Architecture": "ভাগবতের কথন-কাঠামো",
  "স্কন্ধ ১ — “আমি মরতে চলেছি; এখন কী করব?”": "স্কন্ধ ১ — পরীক্ষিতের প্রশ্ন ও ভাগবতের সূচনা",
  "স্কন্ধ ২ — মৃত্যু থেকে অনন্তের দিকে": "স্কন্ধ ২ — শ্রবণ, কীর্তন ও স্মরণ",
  "স্কন্ধ ৩ — বিদুরের মহাযাত্রা": "স্কন্ধ ৩ — বিদুরের জিজ্ঞাসা",
  "④ বিদুর ↔ উদ্ধব": "৪. বিদুর–উদ্ধব সংলাপ — কৃষ্ণের স্মৃতি",
  "⑤ বিদুর ↔ মৈত্রেয় মুনি": "৫. বিদুর–মৈত্রেয় সংলাপ — সৃষ্টি ও ভক্তি",
  "⑥ দেবহূতি ↔ কপিলদেব": "৬. দেবহূতি–কপিলদেব সংলাপ — বন্ধন ও মুক্তি",
  "স্কন্ধ ৪ — ধ্রুব থেকে পৃথু": "স্কন্ধ ৪ — ধ্রুবের সাধনা ও পুরঞ্জনের উপাখ্যান",
  "স্কন্ধ ৫ — ঋষভদেবের শিক্ষা": "স্কন্ধ ৫ — ঋষভদেবের উপদেশে মানবজীবনের উদ্দেশ্য",
  "⑦ ধ্রুব ↔ নারদ": "৭. ধ্রুব–নারদ সংলাপ — আকাঙ্ক্ষা থেকে সাধনা",
  "⑧ নারদ ↔ রাজা প্রাচীনবর্হি": "৮. নারদ–প্রাচীনবর্হি সংলাপ — পুরঞ্জনের রূপক",
  "⑨ ঋষভদেব ↔ তাঁর পুত্রগণ": "৯. পুত্রদের প্রতি ঋষভদেবের উপদেশ",
  "স্কন্ধ ৬ — অজামিল এবং “নাম”": "স্কন্ধ ৬ — অজামিল ও হরিনামের মাহাত্ম্য",
  "⑩ যমদূত ↔ বিষ্ণুদূত": "১০. যমদূত–বিষ্ণুদূত বিতর্ক — ধর্ম ও ভগবানের নাম",
  "⑪ যমরাজ ↔ যমদূত": "১১. যমদূতদের প্রতি যমরাজের ব্যাখ্যা",
  "স্কন্ধ ৭ — প্রহ্লাদ": "স্কন্ধ ৭ — প্রহ্লাদের ভক্তিশিক্ষা",
  "⑫ প্রহ্লাদ ↔ হিরণ্যকশিপু": "১২. প্রহ্লাদ–হিরণ্যকশিপু সংলাপ — নববিধা ভক্তি",
  "⑬ প্রহ্লাদ ↔ অসুর বালকেরা": "১৩. অসুর বালকদের প্রতি প্রহ্লাদের উপদেশ",
  "⑭ গজেন্দ্র → ভগবান": "১৪. ভগবানের কাছে গজেন্দ্রের প্রার্থনা",
  "স্কন্ধ ৯ — দশম স্কন্ধের প্রস্তুতি": "স্কন্ধ ৯ — রাজবংশের ধারায় যদুবংশ",
  "স্কন্ধ ১০ — শ্রীকৃষ্ণ": "স্কন্ধ ১০ — কৃষ্ণলীলা ও ব্রজপ্রেম",
  "⑮ ব্রহ্মা ↔ শ্রীকৃষ্ণ": "১৫. শ্রীকৃষ্ণের কাছে ব্রহ্মার প্রার্থনা",
  "⑯ গোপীগণ ↔ শ্রীকৃষ্ণ": "১৬. কৃষ্ণবিরহে গোপীগীত",
  "⑰ উদ্ধব ↔ গোপীগণ": "১৭. উদ্ধব–গোপী সংলাপ — ব্রজপ্রেমের শিক্ষা",
  "স্কন্ধ ১১ — কৃষ্ণের বিদায়": "স্কন্ধ ১১ — কৃষ্ণের বিদায় ও উদ্ধবগীতা",
  "⑱ শ্রীকৃষ্ণ ↔ উদ্ধব": "১৮. কৃষ্ণ–উদ্ধব সংলাপ — বিদায়ের উপদেশ",
  "⑲ অবধূত ব্রাহ্মণ ↔ রাজা যদু": "১৯. যদু–অবধূত সংলাপ — চব্বিশ গুরু",
  "⑳ নবযোগেন্দ্র ↔ রাজা নিমি": "২০. নিমি–নবযোগেন্দ্র সংলাপ — ভাগবতধর্ম",
  "স্কন্ধ ১২ — পরীক্ষিতের সাত দিনের শেষ": "স্কন্ধ ১২ — পরীক্ষিতের শ্রবণের সমাপ্তি",
  "এবার পুরো ভাগবতকে এক লাইনে ধরুন": "বারো স্কন্ধের কথোপকথন একনজরে",
};

function conversationHeadingValue(titles, heading) {
  return titles[heading] ?? Object.entries(titles).find(([source]) => withoutEmoji(source) === heading)?.[1];
}

const conversationLineEdits = {
  "অর্থাৎ **পরীক্ষিৎ–শুকদেব সংবাদ হলো ভাগবতের প্রধান মেরুদণ্ড**, আর তার চারপাশে বহু nested conversation।": "**পরীক্ষিৎ ও শুকদেবের সংবাদ** ভাগবতের মূল বর্ণনাকে একসূত্রে ধরে রেখেছে। সেই বর্ণনার মধ্যেই উঠে আসে আরও অনেক কথোপকথন।",
  "এখান থেকে শুরু হয় আপনার উল্লেখ করা অত্যন্ত সুন্দর chain।": "বিদুরের অনুসন্ধান উদ্ধবের সঙ্গে সাক্ষাৎ দিয়ে শুরু হয় এবং মৈত্রেয় মুনির কাছে গিয়ে বিস্তৃত হয়।",
  "এটি conversation-driven storytelling-এর masterpiece।": "পিতা ও সঙ্গীদের সঙ্গে প্রহ্লাদের কথায় তাঁর ভক্তিশিক্ষার দুটি দিক উঠে আসে।",
  "এখানে conventional dialogue কম।": "এই পর্বের কেন্দ্রে রয়েছে বিপন্ন গজেন্দ্রের প্রার্থনা।",
  "কিন্তু সবচেয়ে powerful conversation:": "",
  "এখানে ভাগবতের হৃদয় খুলে যায়।": "দশম স্কন্ধে কৃষ্ণলীলার মধ্য দিয়ে ভক্তির নানা রূপ প্রকাশ পায়। ব্রহ্মার প্রার্থনা, গোপীগীত ও উদ্ধবের বৃন্দাবনযাত্রায় সেই রূপগুলি স্পষ্ট হয়ে ওঠে।",
  "এখানে অসংখ্য conversation। কিন্তু কয়েকটি বিশেষ গুরুত্বপূর্ণ।": "",
  "এখানে ভাগবতের আরেকটি summit।": "কৃষ্ণের বিদায়ের প্রাক্কালে উদ্ধবের সঙ্গে তাঁর সংলাপ একাদশ স্কন্ধের প্রধান আলোচনাগুলির একটি।",
  "এই chain-টা মনে রাখলে ১২টি স্কন্ধ আর বিচ্ছিন্ন মনে হবে না:": "প্রধান সংলাপগুলির সূত্র ধরে বারোটি স্কন্ধের সংযোগ বোঝা যায়।",
};

function editConversations(markdown) {
  const blocks = markdown.split(/(?=^#{1,6}\s+.+$)/m);
  const edited = blocks.map(block => {
    if (!block.startsWith("#")) return block;
    const firstBreak = block.indexOf("\n");
    const heading = withoutEmoji(block.slice(0, firstBreak).replace(/^#+\s+/, ""));
    const body = conversationHeadingValue(conversationSections, heading);
    return body === undefined ? block : block.slice(0, firstBreak) + "\n\n" + body + "\n\n";
  }).join("");
  return edited
    .replace(/^খুব সুন্দর।[^\n]+/, "পরীক্ষিৎ মহারাজের প্রশ্ন ও শুকদেব গোস্বামীর উত্তরকে ঘিরে শ্রীমদ্ভাগবতের মূল বর্ণনা গড়ে উঠেছে। সেই বর্ণনার মধ্যে বিদুর, প্রহ্লাদ, উদ্ধব ও আরও অনেকের কথোপকথন উঠে আসে। এখানে বারোটি স্কন্ধের প্রধান সংলাপ গ্রন্থের বর্ণনাক্রমে সাজানো হয়েছে। ঘটনাগুলি কখন ঘটেছিল আর শুকদেব সেগুলি কখন বর্ণনা করেছেন, সেই দুই ক্রম আলাদা।")
    .replace(/^পরের ধাপে এর সবচেয়ে উপকারী companion হবে[^\n]+/m, "বিদুরের সঙ্গে পাণ্ডবদের সম্পর্ক, ব্যাসদেব ও শুকদেবের যোগসূত্র এবং পরীক্ষিতের বংশপরিচয় জানতে ‘চরিত্র ও সময়রেখা’ বিভাগটি দেখুন।")
    .replace(/^\*\*শৌনক → সূত\*\*[\s\S]*?\*\*মৃত্যুভয় → কৃষ্ণস্মরণ।\*\*/m, [
      "- **প্রথম ও দ্বিতীয় স্কন্ধ।** শৌনকাদির প্রশ্নে সূতের বর্ণনা শুরু হয়। ব্যাসদেব ও নারদের আলোচনায় গ্রন্থ রচনার পটভূমি আসে। পরীক্ষিতের প্রশ্নের উত্তরে শুকদেব শ্রবণ, কীর্তন ও স্মরণের পথ দেখান।",
      "- **তৃতীয় থেকে পঞ্চম স্কন্ধ।** বিদুর প্রথমে উদ্ধবের সঙ্গে কথা বলেন, পরে মৈত্রেয়ের কাছে দেবহূতি ও কপিলের সংবাদ শোনেন। এরপর আসে ধ্রুব ও প্রাচীনবর্হির প্রতি নারদের উপদেশ এবং পুত্রদের প্রতি ঋষভদেবের শিক্ষা।",
      "- **ষষ্ঠ থেকে নবম স্কন্ধ।** অজামিলকে ঘিরে যমদূত ও বিষ্ণুদূতের বিতর্কের ব্যাখ্যা দেন যমরাজ। হিরণ্যকশিপুর প্রশ্নে প্রহ্লাদ ভক্তির কথা বলেন। গজেন্দ্রের প্রার্থনায় শরণাগতি প্রকাশ পায়। রাজবংশের বর্ণনা এসে পৌঁছায় যদুবংশে।",
      "- **দশম থেকে দ্বাদশ স্কন্ধ।** কৃষ্ণের কাছে ব্রহ্মার প্রার্থনা, গোপীদের বিরহ ও উদ্ধবের বৃন্দাবনযাত্রার পর আসে উদ্ধবগীতা। একাদশ স্কন্ধে অবধূত ও যদু এবং নবযোগেন্দ্র ও নিমির সংলাপও রয়েছে। শেষে পরীক্ষিৎ ও শুকদেবের কথায় ফিরে এসে মৃত্যুভয় অতিক্রমের পথ হিসেবে কৃষ্ণস্মরণের গুরুত্ব ফুটে ওঠে।",
    ].join("\n"))
    .replace(/^এবং আরও বড় করে দেখলে,[^\n]+\n+\*\*জিজ্ঞাসা\*\*[^\n]+\n+এই lens দিয়ে পড়লে[^\n]+/m, "এই কথোপকথনগুলিতে জিজ্ঞাসা থেকে শ্রবণ ও জ্ঞানের পথে এগোনোর একটি ধারা দেখা যায়। সাধুসঙ্গ ও ভক্তির মধ্য দিয়ে সেই ধারা শরণাগতি, কৃষ্ণস্মরণ ও প্রেমের দিকে নিয়ে যায়। ধ্রুব, প্রহ্লাদ, অজামিল, বিদুর, উদ্ধব ও গোপীদের কাহিনি মিলিয়ে পড়লে ভক্তির এই নানা দিক ফুটে ওঠে।")
    .split("\n")
    .map(line => conversationLineEdits[line.trim()] ?? line
      .replace(/^\*\*([১২৩]\. .+)\*\*$/, "### $1"))
    .join("\n");
}

function markdownToHtml(markdown, prefix, { preserveSource = false } = {}) {
  if (prefix === "shlokas") return renderShlokaChapter(markdown, prefix);
  if (prefix === "intro" && !preserveSource) markdown = editIntroduction(markdown);
  if (prefix === "conversations") markdown = editConversations(markdown);
  if (prefix === "timeline") markdown = editTimeline(markdown);
  if (["porbo4", "shibtotto", "krishnashakti", "radha", "porbo8", "porbo9", "porbo10", "porbo11", "porbo12", "porbo13", "porbo14", "porbo15", "shikha1"].includes(prefix)) {
    markdown = joinShortNarrativeParagraphs(markdown);
  }
  const lines = markdown.split("\n");
  const renderInline = text => inline(text, preserveSource);
  const out = [];
  const nav = [];
  const skandhaStops = [];
  const headingIdCounts = new Map();
  let currentSection = "";
  let currentSubsection = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (prefix === "krishnavishnu" && line === "**শ্রীকৃষ্ণ — স্বয়ং ভগবান**") {
      const mapNodes = [];
      let cursor = i;
      while (cursor < lines.length) {
        while (cursor < lines.length && !lines[cursor].trim()) cursor++;
        const node = lines[cursor]?.match(/^\*\*(.+)\*\*$/);
        if (!node) break;
        mapNodes.push(node[1]);
        cursor++;
        while (cursor < lines.length && !lines[cursor].trim()) cursor++;
        if (/^↓/.test(lines[cursor] || "")) cursor++;
        else break;
      }
      while (cursor < lines.length && !lines[cursor].trim()) cursor++;
      const caption = lines[cursor]?.trim() === "এই বিন্যাস গৌড়ীয় বৈষ্ণব পরম্পরার একটি শিক্ষামূলক সংক্ষিপ্ত রূপ।"
        ? lines[cursor++]
        : "";
      if (mapNodes.length === 9 && caption) {
        const nodes = mapNodes.map((label, index) => `<div class="krishna-map-node${index === 0 ? " is-origin" : index >= 6 ? " is-purusha" : ""}"><strong>${inline(label, true)}</strong></div>${index < mapNodes.length - 1 ? '<div class="krishna-map-connector" aria-hidden="true">↓</div>' : ""}`).join("");
        out.push(`<figure class="krishna-expansion-map" aria-label="শ্রীকৃষ্ণ থেকে তিন পুরুষাবতারের ধারাবাহিক মানচিত্র"><div class="krishna-map-nodes">${nodes}</div><figcaption>${inline(caption.trim(), true)}</figcaption></figure>`);
        i = cursor;
        continue;
      }
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      const isDiagram = language === "text";
      out.push(isDiagram ? responsiveDiagram(renderDiagram(code.join("\n"))) : `<div class="diagram-wrap prompt-wrap"><div class="diagram-label">মূল প্রশ্ন বা বক্তব্য</div><pre class="diagram"><code>${escapeHtml(code.join("\n"))}</code></pre></div>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const headingText = preserveSource ? heading[2] : withoutEmoji(heading[2]);
      const clean = headingText.replace(/\*\*/g, "").trim();
      if (prefix === "porichoy" && heading[1].length === 2) currentSection = clean;
      if (prefix === "porbo4" && heading[1].length === 2) { currentSection = clean; currentSubsection = ""; }
      if (prefix === "porbo4" && heading[1].length === 3) currentSubsection = clean;
      if (prefix === "shibtotto" && heading[1].length === 2) currentSection = clean;
      if (prefix === "krishnashakti" && heading[1].length === 2) currentSection = clean;
      if (prefix === "radha" && heading[1].length === 2) currentSection = clean;
      const baseId = slugify(clean, prefix);
      const headingIdCount = (headingIdCounts.get(baseId) || 0) + 1;
      headingIdCounts.set(baseId, headingIdCount);
      const id = prefix === "chotushloki" && headingIdCount > 1 ? `${baseId}-${headingIdCount}` : baseId;
      const isDialogue = prefix === "conversations" && /^[④-⑳]/u.test(clean);
      const isSkandha = prefix === "conversations" && /^স্কন্ধ [০-৯]+ /u.test(clean);
      const isOverview = prefix === "conversations" && clean === "প্রথমে Master Architecture";
      const level = isDialogue ? 4 : isSkandha || isOverview ? 3 : prefix === "porbo11" ? Math.min(Math.max(heading[1].length - 1, 2), 4) : Math.min(heading[1].length + 1, 4);
      const headings = prefix === "intro" ? introHeadings
        : prefix === "conversations" ? conversationHeadings
        : prefix === "timeline" ? timelineHeadings
        : prefix.startsWith("shlokas-") ? verseSectionHeadings : {};
      const displayTitle = preserveSource ? headingText : (prefix === "conversations" ? conversationHeadingValue(headings, clean) : headings[clean]) ?? headingText;
      if (heading[1].length <= 3) nav.push({ id, title: displayTitle === headingText ? clean : displayTitle, level: heading[1].length });
      if (isSkandha) {
        const [number, topic] = displayTitle.split(" — ", 2);
        skandhaStops.push({ id, number, topic, position: out.length });
        out.push(`<h3 id="${id}" class="skandha-stop"><span>${inline(number)}</span> ${inline(topic)}</h3>`);
      } else {
        const introClass = prefix === "intro" ? ' class="intro-heading"' : "";
        if (prefix === "porichoy" && heading[1].length === 2) {
          const numbered = displayTitle.match(/^([০-৯]+\.)\s+(.+)$/u);
          if (numbered) {
            const titleHtml = `<span class="porichoy-section-number">${renderInline(numbered[1])}</span><span class="porichoy-section-title">${renderInline(numbered[2])}</span>`;
            out.push(`<h${level} id="${id}" class="porichoy-chapter-heading">${titleHtml}</h${level}>`);
          } else {
            out.push(`<h${level} id="${id}" class="porichoy-plain-heading">${renderInline(displayTitle)}</h${level}>`);
          }
        } else if (prefix === "porichoy" && heading[1].length === 3) {
          const subtitleClass = /শিক্ষা|মোড়/.test(clean) ? " porichoy-reflection-heading" : "";
          out.push(`<h${level} id="${id}" class="porichoy-subheading${subtitleClass}">${renderInline(displayTitle)}</h${level}>`);
        } else {
          out.push(`<h${level} id="${id}"${introClass}>${renderInline(displayTitle)}</h${level}>`);
        }
      }
      if (prefix === "shibtotto" && heading[1].length === 2 && clean.startsWith("১৬.")) out.push(renderMayaContrastChart());
      if (prefix === "shibtotto" && heading[1].length === 2 && clean.startsWith("২৪.")) out.push(renderBrahmaShivaOverviewMap());
      if (prefix === "krishnashakti" && heading[1].length === 2 && clean.startsWith("১.")) out.push(renderAchintyaRelationMap());
      if (prefix === "krishnashakti" && heading[1].length === 2 && clean.startsWith("২৩.")) out.push(renderMayaContrastChart());
      if (prefix === "radha" && heading[1].length === 2 && clean.startsWith("৫.")) out.push(renderRadhaKrishnaGauraMap());
      if (prefix === "radha" && heading[1].length === 2 && clean.startsWith("৬.")) out.push(renderRadhaDesiresChart());
      if (prefix === "radha" && heading[1].length === 2 && clean.startsWith("৮.")) out.push(renderMahaprabhuPurposeMap());
      if (prefix === "radha" && heading[1].length === 2 && clean.startsWith("১১.")) out.push(renderRamanandaPath());
      if (prefix === "porbo8" && heading[1].length === 2 && clean.startsWith("৯.")) out.push(renderRasaGopigitaJourney());
      if (prefix === "porbo9" && heading[1].length === 2 && clean.startsWith("২.")) out.push(renderGitagovindaArc());
      if (prefix === "porbo10" && heading[1].length === 2 && clean.startsWith("৬.")) out.push(renderKapilaMindPath());
      if (prefix === "porbo11" && heading[1].length === 3 && clean.startsWith("ভাগবতে অহৈতুকী")) out.push(renderAhaitukiBhaktiPath());
      if (prefix === "porbo12" && heading[1].length === 2 && clean.startsWith("৩.")) out.push(renderPuranjanCityMap());
      if (prefix === "porbo13" && heading[1].length === 2 && clean.startsWith("৭.")) out.push(renderDhruvaJourney());
      if (prefix === "porbo14" && heading[1].length === 2 && clean.startsWith("৩.")) out.push(renderAmbarishaStoryline());
      if (prefix === "porbo15" && heading[1].length === 2 && clean.startsWith("১৪.")) out.push(renderUddhavaTeachingPath());
      i++;
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map(x => x.trim()));
        i++;
      }
      const header = rows[0];
      const body = rows.slice(2);
      if (prefix === "porbo4" && currentSection.startsWith("৫.") && header[0] === "যুগ" && body.length === 5) {
        out.push(renderYugaDurationChart(header, body, renderInline));
        continue;
      }
      if (prefix === "porbo4" && currentSection.startsWith("১৭.") && header[0] === "প্রলয়ের প্রকার" && body.length === 4) {
        out.push(renderPralayaComparison(header, body, renderInline));
        continue;
      }
      if (prefix === "shibtotto" && currentSection.startsWith("২৩.") && header[0] === "বিষয়" && body.length === 6) {
        out.push(renderBrahmaShivaComparison(header, body, renderInline));
        continue;
      }
      if (prefix === "krishnashakti" && currentSection.startsWith("১৭.") && header[0] === "শক্তি" && body.length === 3) {
        out.push(renderShaktiFunctionChart(header, body, renderInline));
        continue;
      }
      if (prefix === "krishnashakti" && currentSection.startsWith("২২.") && header[0] === "বিষয়" && body.length === 5) {
        out.push(renderEnergyComparison(header, body, renderInline));
        continue;
      }
      if (prefix === "radha" && currentSection.startsWith("১৩.") && header[0] === "বিষয়" && body.length === 8) {
        out.push(renderRadhaSummary(header, body, renderInline));
        continue;
      }
      out.push(`<div class="table-wrap"><table><thead><tr>${header.map(c => `<th>${renderInline(c)}</th>`).join("")}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${renderInline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && (lines[i].startsWith(">") || !lines[i].trim())) {
        if (lines[i].startsWith(">")) quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const quoteClass = prefix === "porichoy" ? ' class="porichoy-scripture-quote"' : "";
      out.push(`<blockquote${quoteClass}>${renderInline(quote.join("\n")).replace(/\n/g, "<br>")}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length) {
        if (!/^[-*]\s+/.test(lines[i])) {
          if (!lines[i].trim() && i + 1 < lines.length && /^[-*]\s+/.test(lines[i + 1])) { i++; continue; }
          break;
        }
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      out.push(`<ul>${items.map(x => `<li>${renderInline(x)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^[0-9০-৯]+\.\s+/.test(line)) {
      const bengaliNumbering = /^[০-৯]/.test(line);
      const items = [];
      while (i < lines.length) {
        const nextItem = lines[i].match(/^([0-9০-৯]+)\.\s+/);
        if (!nextItem || /^[০-৯]/.test(nextItem[1]) !== bengaliNumbering) {
          if (!lines[i].trim() && i + 1 < lines.length && /^[0-9০-৯]+\.\s+/.test(lines[i + 1]) && /^[০-৯]/.test(lines[i + 1]) === bengaliNumbering) { i++; continue; }
          break;
        }
        items.push(lines[i].replace(/^[0-9০-৯]+\.\s+/, ""));
        i++;
      }
      const worldList = prefix === "porbo4" && currentSection.startsWith("১.")
        ? currentSubsection === "সাতটি ঊর্ধ্বলোক" ? "upper" : currentSubsection === "সাতটি অধোলোক" ? "lower" : ""
        : "";
      if (worldList && items.length === 7) {
        const label = worldList === "upper" ? "সাতটি ঊর্ধ্বলোক" : "সাতটি অধোলোক";
        out.push(`<figure class="cosmology-world-figure cosmology-world-${worldList}" aria-label="${label}"><ol class="cosmology-world-list">${items.map((item, index) => `<li><span class="cosmology-world-number">${toBengaliDigits(index + 1)}</span><span>${renderInline(item)}</span></li>`).join("")}</ol></figure>`);
      } else if (prefix === "shibtotto" && currentSection.startsWith("২৫.") && items.length === 3) {
        out.push(renderShaktiCategories(items, renderInline));
      } else if (prefix === "krishnashakti" && currentSection.startsWith("২.") && items.length === 3) {
        out.push(renderThreeEnergiesMap(items, renderInline));
      } else {
        const listClasses = [bengaliNumbering ? "bn-numbered-list" : "", prefix === "porichoy" && currentSection === "এই পর্ব থেকে আমাদের প্রধান শিক্ষা" ? "porichoy-takeaways" : ""].filter(Boolean).join(" ");
        out.push(`<ol${listClasses ? ` class="${listClasses}"` : ""}>${items.map(x => `<li>${renderInline(x)}</li>`).join("")}</ol>`);
      }
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const paragraph = [line.trim()];
    i++;
    while (
      i < lines.length && lines[i].trim() &&
      !lines[i].startsWith("#") && !lines[i].startsWith("```") &&
      !lines[i].startsWith(">") && !/^[-*]\s+/.test(lines[i]) && !/^[0-9০-৯]+\.\s+/.test(lines[i]) &&
      !/^\s*---+\s*$/.test(lines[i]) && !lines[i].trim().startsWith("|")
    ) {
      paragraph.push(lines[i].trim());
      i++;
    }
    let paragraphClass = "";
    if (prefix === "intro") {
      if (out.length === 0) paragraphClass = ' class="intro-lead"';
      else if (line.startsWith("শ্রীমদ্ভাগবতে **১২টি স্কন্ধ**")) paragraphClass = ' class="intro-note intro-count"';
      else if (line.startsWith("**আমার জীবন সীমিত")) paragraphClass = ' class="intro-note intro-question"';
      else if (line.startsWith("**“স বৈ পুংসাং")) paragraphClass = ' class="intro-verse"';
    }
    if (prefix === "porichoy" && (line.startsWith("**পাঠমালা:**") || line.startsWith("**প্রধান শাস্ত্রীয় ভিত্তি:**"))) {
      paragraphClass = ' class="porichoy-meta"';
    }
    if (prefix === "porichoy" && !paragraphClass) {
      const text = paragraph.join(" ");
      if (/^\*\*.+\?\*\*$/.test(text)) paragraphClass = ' class="porichoy-question"';
      else if (/^\*\*(?:প্রথম|দ্বিতীয়|তৃতীয়) স্তর:/.test(text)) paragraphClass = ' class="porichoy-flow-step"';
      else if (/^\*\*(?:কল্প|মন্বন্তর|যুগ|বংশপরম্পরা|কথনকাল):\*\*/.test(text)) paragraphClass = ' class="porichoy-definition"';
      else if (/^\*\*ভাগবত আমাদের শুধু ভগবানের কথা/.test(text)) paragraphClass = ' class="porichoy-thesis"';
    }
    out.push(`<p${paragraphClass}>${renderInline(paragraph.join("\n")).replace(/\n/g, "<br>")}</p>`);
  }

  if (prefix === "porichoy" || prefix === "chotushloki" || prefix === "krishnavishnu") combineEditorialParagraphs(out);
  if (skandhaStops.length) addSkandhaNavigation(out, skandhaStops);
  return { html: out.join("\n"), nav };
}

function combineEditorialParagraphs(blocks) {
  const isPlainParagraph = block => /^<p>([\s\S]*)<\/p>$/.test(block) && !/<[^>]+>/.test(block.slice(3, -4));
  const contentOf = block => block.slice(3, -4);
  const textOf = block => contentOf(block).replace(/&(?:amp|lt|gt|quot|#39);/g, "x");
  const shouldKeepApart = text =>
    /^(?:ঘটনা|প্রধান চরিত্র|বৃহত্তর কথনপ্রেক্ষাপট|মূল শিক্ষা)\s*[—:]/.test(text);

  for (let index = 0; index < blocks.length;) {
    if (!isPlainParagraph(blocks[index])) { index++; continue; }
    const group = [blocks[index]];
    let combinedLength = textOf(blocks[index]).length;
    let next = index + 1;
    while (next < blocks.length && isPlainParagraph(blocks[next])) {
      const nextText = textOf(blocks[next]);
      if (combinedLength > 145 || nextText.length > 145 || shouldKeepApart(nextText) || combinedLength + nextText.length > 285) break;
      group.push(blocks[next]);
      combinedLength += nextText.length;
      next++;
    }
    if (group.length > 1) {
      const joinedText = group.map(contentOf).join(" ");
      blocks.splice(index, group.length, `<p class="editorial-flow-paragraph">${joinedText}</p>`);
      index++;
    } else {
      index++;
    }
  }
}

function addSkandhaNavigation(blocks, stops) {
  const overview = blocks.findIndex(block => block.startsWith("<h3 "));
  const recap = blocks.findLastIndex(block => block.startsWith("<h2 "));
  const recapId = blocks[recap].match(/id="([^"]+)"/)[1];
  for (let index = stops.length - 1; index >= 0; index--) {
    const previous = stops[index - 1];
    const next = stops[index + 1];
    const links = [
      previous && `<a rel="prev" href="#${previous.id}">← ${previous.number}</a>`,
      next ? `<a rel="next" href="#${next.id}">${next.number} পড়ুন →</a>`
        : `<a href="#${recapId}">বারো স্কন্ধের সারাংশ →</a>`,
    ].filter(Boolean);
    blocks.splice(next?.position ?? recap, 0, `<nav class="skandha-links skandha-step" aria-label="${stops[index].number} থেকে অন্য অংশে যান">${links.join("")}</nav>`);
  }
  const links = stops.map(({ id, number, topic }) =>
    `<li><a href="#${id}"><span>${inline(number)}</span>${inline(topic)}</a></li>`);
  blocks.splice(overview, 0, `<nav class="skandha-links skandha-index" aria-label="স্কন্ধ ধরে পড়ুন"><p>স্কন্ধ ধরে পড়ুন</p><ul>${links.join("")}</ul></nav>`);
}

function toBengaliDigits(value) {
  return String(value).replace(/[0-9]/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
}

function numericValue(text) {
  return Number(text.replace(/\*\*/g, "").replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit))).replace(/[^0-9]/g, ""));
}

function renderYugaDurationChart(header, body, renderInline) {
  const yugas = body.slice(0, 4);
  const total = body[4];
  const maximum = numericValue(yugas[0][1]);
  const rows = yugas.map(([name, duration, trait], index) => {
    const width = Math.round(numericValue(duration) / maximum * 100);
    return `<li class="yuga-chart-row"><div class="yuga-chart-label"><span>${toBengaliDigits(index + 1)}</span><strong>${renderInline(name)}</strong></div><div class="yuga-chart-measure"><div class="yuga-chart-track"><span style="--yuga-width:${width}%"></span></div><strong>${renderInline(duration)}</strong></div><p>${renderInline(trait)}</p></li>`;
  }).join("");
  return `<figure class="cosmology-yuga-chart" aria-label="চার যুগের সময়কালের তুলনামূলক চিত্র"><p class="yuga-chart-key">${header.map(renderInline).join(" · ")}</p><ol>${rows}</ol><figcaption><span>আপেক্ষিক সময়কাল</span><strong>৪ : ৩ : ২ : ১</strong></figcaption><p class="yuga-chart-total"><span class="yuga-chart-total-label">${renderInline(total[0])}</span><span>${renderInline(total[1])}</span><span>${renderInline(total[2])}</span></p></figure>`;
}

function renderPralayaComparison(header, body, renderInline) {
  const cards = body.map(([kind, when, meaning], index) => `<li class="pralaya-card"><span class="pralaya-card-number">${toBengaliDigits(index + 1)}</span><h4>${renderInline(kind)}</h4><dl><div><dt>${renderInline(header[1])}</dt><dd>${renderInline(when)}</dd></div><div><dt>${renderInline(header[2])}</dt><dd>${renderInline(meaning)}</dd></div></dl></li>`).join("");
  return `<figure class="cosmology-pralaya-chart" aria-label="চার প্রকার প্রলয়ের তুলনামূলক চিত্র"><ol>${cards}</ol></figure>`;
}

function renderBrahmaShivaComparison(header, body, renderInline) {
  const rows = body.map(([topic, brahma, shiva], index) => `<li class="shibtotto-compare-row"><h4><span>${toBengaliDigits(index + 1)}</span>${renderInline(topic)}</h4><div><dt>${renderInline(header[1])}</dt><dd>${renderInline(brahma)}</dd></div><div><dt>${renderInline(header[2])}</dt><dd>${renderInline(shiva)}</dd></div></li>`).join("");
  return `<figure class="shibtotto-compare-chart" aria-label="ব্রহ্মা ও শিবের তাত্ত্বিক অবস্থানের তুলনা"><ol>${rows}</ol><figcaption>${header.map(renderInline).join(" · ")}</figcaption></figure>`;
}

function renderMayaContrastChart() {
  return `<figure class="maya-contrast-chart" aria-label="মহামায়া ও যোগমায়ার কার্যগত পার্থক্য"><div class="maya-chart-node maya-chart-source"><span>শক্তির পরম উৎস</span><strong>ভগবান</strong></div><div class="maya-chart-branches"><section><span>বহিরঙ্গা শক্তি</span><h4>মহামায়া</h4><p>জড়বন্ধন, জড়জগতের গুণ ও কর্মফলের ব্যবস্থা</p></section><section><span>অন্তরঙ্গা শক্তি</span><h4>যোগমায়া</h4><p>ভগবানের দিব্য লীলা ও অন্তরঙ্গ সম্পর্কের প্রকাশ</p></section></div><figcaption>কার্যক্ষেত্র আলাদা; উভয় শক্তির পরম উৎস একই ভগবান।</figcaption></figure>`;
}

function renderBrahmaShivaOverviewMap() {
  return `<figure class="shibtotto-overview-map" aria-label="বিষ্ণু, ব্রহ্মা, শিব ও দুর্গাশক্তির সম্পর্কের মানচিত্র"><div class="shibtotto-map-source"><span>স্বয়ং ভগবান</span><strong>শ্রীকৃষ্ণ</strong></div><div class="shibtotto-map-link" aria-hidden="true">রূপ, কার্য ও শক্তির সম্পর্ক</div><div class="shibtotto-map-branches"><section><h4>নারায়ণ ও তিন পুরুষাবতার</h4><p>সৃষ্টির সামগ্রিক প্রকাশ, ব্রহ্মাণ্ডের অভ্যন্তরীণ আশ্রয় ও অন্তর্যামী কার্য</p><span>দিব্য বিস্তার</span></section><section><h4>ব্রহ্মা</h4><p>ভগবানের শক্তিতে সৃষ্টির পরবর্তী বিন্যাস</p><span>জীবতত্ত্বের সঙ্গে সম্পর্কিত</span></section><section><h4>রুদ্র / শিব</h4><p>জড়সৃষ্টির সংহার ও লয়ের সঙ্গে সম্পর্কিত</p><span>বিশেষ শিবতত্ত্ব</span></section><section><h4>দুর্গা / মহামায়া</h4><p>জড়প্রকৃতির কার্য পরিচালনাকারী শক্তি</p><span>বহিরঙ্গা শক্তি</span></section></div><figcaption>এটি পদমর্যাদার তালিকা নয়; ভিন্ন তত্ত্বের রূপ, কার্য ও শক্তির সম্পর্ক দেখানো হয়েছে।</figcaption></figure>`;
}

function renderShaktiCategories(items, renderInline) {
  const details = [
    "ভগবানের নিত্যধাম, দিব্য লীলা ও প্রেমময় সম্পর্ক",
    "জড়প্রকৃতি ও মহামায়ার সঙ্গে সম্পর্কিত",
    "জীবাত্মার সঙ্গে সম্পর্কিত",
  ];
  return `<figure class="shibtotto-shakti-chart" aria-label="ভগবানের শক্তির তিনটি শ্রেণি"><ol>${items.map((item, index) => `<li><span>${toBengaliDigits(index + 1)}</span><h4>${renderInline(item)}</h4><p>${details[index]}</p></li>`).join("")}</ol><figcaption>সমস্ত শক্তির পরম উৎস ভগবান।</figcaption></figure>`;
}

function renderAchintyaRelationMap() {
  return `<figure class="krishna-shakti-relation-map" aria-label="শক্তিমান ও শক্তির অচিন্ত্যভেদাভেদ সম্পর্ক"><div class="relation-map-title">শক্তিমান ও শক্তির সম্পর্ক</div><div class="relation-map-center">অচিন্ত্যভেদাভেদ</div><div class="relation-map-poles"><section><span>অভেদ</span><p>শক্তি ভগবান থেকে সম্পূর্ণ স্বাধীন নয়।</p></section><section><span>ভেদ</span><p>শক্তি ও শক্তিমানের পরিচয় এবং কার্য একেবারে সমার্থক নয়।</p></section></div><figcaption>এই ভেদাভেদের সম্পূর্ণ প্রকৃতি সাধারণ জড়যুক্তির দ্বারা নিঃশেষে উপলব্ধি করা যায় না।</figcaption></figure>`;
}

function renderThreeEnergiesMap(items, renderInline) {
  const notes = [
    "নিত্যধাম, দিব্য লীলা ও প্রেমময় সম্পর্ক",
    "জীবশক্তি · জীবাত্মা; চৈতন্যময়, অণু",
    "মায়াশক্তি · জড়প্রকৃতি, তার পরিবর্তন ও কার্য",
  ];
  return `<figure class="krishna-shakti-energy-map" aria-label="শ্রীকৃষ্ণের তিন প্রধান শক্তির মানচিত্র"><div class="energy-map-source"><span>পরম শক্তিমান</span><strong>শ্রীকৃষ্ণ</strong></div><div class="energy-map-connector" aria-hidden="true">শক্তির প্রকাশ</div><ol>${items.map((item, index) => `<li class="energy-map-branch energy-map-branch-${index + 1}"><span>${toBengaliDigits(index + 1)}</span><h4>${renderInline(item.replace(/^[0-9০-৯]+\.\s*/, ""))}</h4><p>${notes[index]}</p></li>`).join("")}</ol><figcaption>অসীম শক্তিকে বোঝার সুবিধার্থে তিনটি প্রধান শ্রেণিতে আলোচনা করা হয়।</figcaption></figure>`;
}

function renderShaktiFunctionChart(header, body, renderInline) {
  const cards = body.map(([name, relation, meaning], index) => `<li class="shakti-function-card shakti-function-${index + 1}"><span>${toBengaliDigits(index + 1)}</span><h4>${renderInline(name)}</h4><p class="shakti-function-relation">${renderInline(relation)}</p><p>${renderInline(meaning)}</p></li>`).join("");
  return `<figure class="krishna-shakti-function-chart" aria-label="সন্ধিনী, সম্বিৎ ও হ্লাদিনী শক্তির তুলনা"><p class="function-chart-key">${header.map(renderInline).join(" · ")}</p><ol>${cards}</ol><figcaption>তিনটি পৃথক বস্তু নয়; এক অখণ্ড অন্তরঙ্গা শক্তির বিভিন্ন কার্যপ্রকাশ।</figcaption></figure>`;
}

function renderEnergyComparison(header, body, renderInline) {
  const columns = header.slice(1).map((name, index) => `<section class="energy-comparison-column energy-comparison-${index + 1}"><h4>${renderInline(name)}</h4>${body.map(([topic, ...values]) => `<div><span>${renderInline(topic)}</span><p>${renderInline(values[index])}</p></div>`).join("")}</section>`).join("");
  return `<figure class="krishna-shakti-comparison" aria-label="অন্তরঙ্গা, তটস্থা ও বহিরঙ্গা শক্তির তুলনামূলক চিত্র"><div class="energy-comparison-keys"><span>${header.map(renderInline).join(" · ")}</span></div><div class="energy-comparison-columns">${columns}</div></figure>`;
}

function renderRasaGopigitaJourney() {
  const steps = [
    ["১০.২৯", "বংশীধ্বনি", "শরৎপূর্ণিমার রাতে কৃষ্ণের আহ্বান"],
    ["১০.২৯", "গোপীদের আগমন", "কৃষ্ণের সঙ্গে প্রেমময় সংলাপ"],
    ["১০.২৯", "রাসলীলার সূচনা", "সান্নিধ্যের আনন্দ"],
    ["১০.৩০", "অন্তর্ধান", "আনন্দের পর বিরহ"],
    ["১০.৩০–৩১", "অনুসন্ধান ও গোপীগীত", "স্মরণ, প্রার্থনা ও আত্মনিবেদন"],
    ["১০.৩২", "পুনরাবির্ভাব", "কৃষ্ণের সঙ্গে পুনর্মিলন"],
    ["১০.৩৩", "রাসনৃত্য", "লীলা ও শ্রবণের মাহাত্ম্য"],
  ];
  const items = steps.map(([reference, title, detail], index) => `<li><span class="rasa-journey-number">${toBengaliDigits(index + 1)}</span><span class="rasa-journey-reference">${reference}</span><strong>${title}</strong><p>${detail}</p></li>`).join("");
  return `<figure class="rasa-gopigita-journey" aria-label="রাসলীলা ও গোপীগীতের ঘটনাপ্রবাহ"><div class="rasa-journey-heading"><span>ঘটনার ধারাবাহিকতা</span><strong>বিরহের পথে প্রেমের প্রকাশ</strong></div><ol>${items}</ol><figcaption>শ্রীমদ্ভাগবত ১০.২৯–৩৩-এর প্রধান ঘটনাগুলি ক্রমানুসারে সাজানো হয়েছে।</figcaption></figure>`;
}

function renderGitagovindaArc() {
  const stages = [
    ["০১–০৩", "প্রেমের সূচনা", "বসন্তের আবহ, রাধার অভিমান ও কৃষ্ণের অনুতাপ"],
    ["০৪–০৬", "সখীর সংবাদ", "বিরহের কথা, অপেক্ষা ও রাধার দ্বিধা"],
    ["০৭–০৮", "মান ও অভিযোগ", "কৃষ্ণের বিলম্বে রাধার অভিমান প্রকাশ"],
    ["০৯–১০", "মানভঞ্জনের পথ", "সখীর উপদেশ ও কৃষ্ণের অনুনয়"],
    ["১১–১২", "অভিসার ও মিলন", "পুনর্মিলন এবং প্রেমের পূর্ণতা"],
  ];
  const items = stages.map(([sarga, title, detail]) => `<li><span>${sarga} সর্গ</span><strong>${title}</strong><p>${detail}</p></li>`).join("");
  return `<figure class="gitagovinda-arc" aria-label="গীতগোবিন্দের বারোটি সর্গে রাধাকৃষ্ণের প্রেমকাহিনির ধারা"><div class="gitagovinda-arc-heading"><span>বারো সর্গের কাহিনিপথ</span><strong>আকর্ষণ → বিরহ → মধ্যস্থতা → পুনর্মিলন</strong></div><ol>${items}</ol><figcaption>সর্গগুলির বিষয়বস্তু মূল প্রবন্ধের তালিকা ও বর্ণনার ভিত্তিতে কয়েকটি পর্যায়ে দেখানো হয়েছে।</figcaption></figure>`;
}

function renderSeriesFlowMap(className, ariaLabel, heading, steps, caption) {
  const items = steps.map(([title, detail], index) => `<li><span>${toBengaliDigits(index + 1)}</span><strong>${title}</strong><p>${detail}</p></li>`).join("");
  return `<figure class="series-flow-map ${className}" aria-label="${ariaLabel}"><div class="series-map-heading">${heading}</div><ol>${items}</ol><figcaption>${caption}</figcaption></figure>`;
}

function renderKapilaMindPath() {
  return `<figure class="kapila-mind-map" aria-label="চিত্তের অভিমুখ থেকে বন্ধন বা মুক্তির পথ"><div class="kapila-map-heading"><span>কপিলদেবের উপদেশে চিত্তের অভিমুখ</span><strong>একই মন · দুই গতি</strong></div><div class="kapila-mind-outcomes"><section><span>প্রকৃতির গুণে আসক্ত</span><b aria-hidden="true">↓</b><strong>বন্ধন</strong></section><section><span>পরমপুরুষে নিবিষ্ট</span><b aria-hidden="true">↓</b><strong>মুক্তির পথ</strong></section></div><div class="kapila-bhakti-path"><span>সাধুসঙ্গ</span><b aria-hidden="true">→</b><span>ভগবৎকথা</span><b aria-hidden="true">→</b><span>শ্রদ্ধা</span><b aria-hidden="true">→</b><span>রতি</span><b aria-hidden="true">→</b><strong>ভক্তি</strong></div><figcaption>শ্রীমদ্ভাগবত ৩.২৫.১৫ ও ৩.২৫.২৫-এর শিক্ষাকে একসঙ্গে দেখানো হয়েছে।</figcaption></figure>`;
}

function renderAhaitukiBhaktiPath() {
  return renderSeriesFlowMap("ahaituki-bhakti-map", "অহৈতুকী ভক্তির স্বরূপ ও ফল", "অহৈতুকী ভক্তির মর্ম", [
    ["কোনো স্বার্থের প্রত্যাশা নেই", "ভগবানের প্রতি ভালোবাসাই নিজের আনন্দ"],
    ["ভক্তি অপ্রতিহত", "প্রতিকূলতাতেও ভক্তির ধারা থেমে যায় না"],
    ["আত্মা সুপ্রসন্ন", "ভাগবতের বর্ণিত অন্তরের পরিতৃপ্তি"],
  ], "শ্রীমদ্ভাগবত ১.২.৬-এর মূল ভাব ধরে তৈরি পাঠ-সহায়ক মানচিত্র।");
}

function renderPuranjanCityMap() {
  const entries = [
    ["পুরঞ্জন", "জীবাত্মা"],
    ["নয়-দ্বারবিশিষ্ট নগরী", "মানবদেহ"],
    ["সুন্দরী যুবতী", "বুদ্ধি"],
    ["দশজন সঙ্গী", "পাঁচ জ্ঞানেন্দ্রিয় ও পাঁচ কর্মেন্দ্রিয়"],
    ["পাঁচ-ফণাবিশিষ্ট সর্প", "পঞ্চপ্রাণ"],
    ["অবিজ্ঞাত বন্ধু", "পরমাত্মা"],
  ];
  const items = entries.map(([symbol, meaning]) => `<div><dt>${symbol}</dt><dd>${meaning}</dd></div>`).join("");
  return `<figure class="puranjan-city-map" aria-label="পুরঞ্জন উপাখ্যানের নগরী ও চরিত্রগুলির রূপক অর্থ"><div class="series-map-heading">নগরী ও চরিত্রের রূপক-সম্পর্ক</div><dl>${items}</dl><figcaption>শ্রীমদ্ভাগবত ৪.২৫–২৯-এ নারদ মুনির ব্যাখ্যা অনুযায়ী সাজানো হয়েছে।</figcaption></figure>`;
}

function renderDhruvaJourney() {
  return renderSeriesFlowMap("dhruva-journey-map", "ধ্রুব মহারাজের ভক্তির পথে যাত্রা", "ধ্রুবের আকাঙ্ক্ষার রূপান্তর", [
    ["অপমান ও আকাঙ্ক্ষা", "রাজপ্রাসাদের আঘাত থেকে লক্ষ্য স্থির"],
    ["সুনীতির উপদেশ", "প্রতিশোধের বদলে ভগবানের আশ্রয়"],
    ["নারদের দীক্ষা", "গুরু-নির্দেশে সাধনার পথ"],
    ["মধুবনে তপস্যা", "একাগ্র সাধনা ও স্মরণ"],
    ["ভগবানের দর্শন", "প্রার্থিত বস্তুর চেয়েও মহত্তর প্রাপ্তি"],
    ["দিব্য পরিণতি", "ধ্রুবলোক ও ভক্তিতে প্রতিষ্ঠা"],
  ], "ধ্রুব মহারাজের কাহিনির প্রধান বাঁকগুলি পর্বের বর্ণনাক্রমে সাজানো হয়েছে।");
}

function renderAmbarishaStoryline() {
  return renderSeriesFlowMap("ambarisha-story-map", "অম্বরীষ ও দুর্বাসার উপাখ্যানের ঘটনাক্রম", "ব্রতসংকট থেকে ক্ষমা ও শরণাগতি", [
    ["একাদশী ও দ্বাদশী", "ব্রত ও অতিথিসেবার ধর্মসংকট"],
    ["দুর্বাসার ক্রোধ", "কৃত্যা সৃষ্টি করে আক্রমণ"],
    ["সুদর্শনের আবির্ভাব", "ভক্তরক্ষা; দুর্বাসার পলায়ন"],
    ["দেবতাদের কাছে আশ্রয়", "ব্রহ্মা ও শিবের পর নারায়ণের শরণ"],
    ["ভক্তের কাছে প্রত্যাবর্তন", "অম্বরীষের ক্ষমা ও আতিথ্য"],
  ], "উপাখ্যানের ঘটনাগুলি শ্রীমদ্ভাগবত নবম স্কন্ধ, চতুর্থ ও পঞ্চম অধ্যায় অনুসারে দেখানো হয়েছে।");
}

function renderUddhavaTeachingPath() {
  return renderSeriesFlowMap("uddhava-teaching-map", "উদ্ধবগীতার প্রধান শিক্ষার ধারাবাহিকতা", "উদ্ধবের প্রশ্ন থেকে আত্মসমর্পণ", [
    ["বিচ্ছেদের প্রশ্ন", "কৃষ্ণের বিদায়ের সময় উদ্ধবের জিজ্ঞাসা"],
    ["প্রকৃতি থেকে শিক্ষা", "অবধূত ব্রাহ্মণের চব্বিশ গুরু"],
    ["গুরু ও সাধুসঙ্গ", "আত্মজ্ঞান ও ভক্তির পথনির্দেশ"],
    ["জ্ঞান ও বৈরাগ্য", "আসক্তির প্রকৃতি বুঝে অন্তরের স্বাধীনতা"],
    ["স্মরণ ও সমর্পণ", "সমস্ত কর্ম ভগবানের উদ্দেশ্যে নিবেদন"],
  ], "উদ্ধবগীতার আলোচিত অধ্যায়গুলির বিষয়ক্রম থেকে তৈরি পাঠ-সহায়ক মানচিত্র।");
}

function renderRadhaKrishnaGauraMap() {
  return `<figure class="radha-gaura-map" aria-label="রাধাকৃষ্ণের এক তত্ত্ব, দুই রূপ এবং শ্রীচৈতন্যরূপে প্রকাশ"><div class="radha-gaura-unity">এক তত্ত্ব</div><div class="radha-gaura-pair"><section><h4>শ্রীকৃষ্ণ</h4><p>প্রেমের পরম বিষয়</p></section><section><h4>শ্রীমতী রাধারাণী</h4><p>প্রেমের সর্বোচ্চ আশ্রয়</p></section></div><div class="radha-gaura-connector">প্রেমলীলায় দুই রূপ · রাধাভাব ও রাধাকান্তি</div><div class="radha-gaura-result"><span>একীভূত প্রকাশ</span><strong>শ্রীচৈতন্য মহাপ্রভু</strong><small>রাধাভাবদ্যুতিসুবলিত কৃষ্ণ</small></div><figcaption>রাধা ও কৃষ্ণ তত্ত্বত অভিন্ন, কিন্তু প্রেমলীলার জন্য দুই রূপে প্রকাশিত—এটাই গৌড়ীয় বৈষ্ণব সিদ্ধান্ত।</figcaption></figure>`;
}

function renderRadhaDesiresChart() {
  const desires = [
    "প্রথম আকাঙ্ক্ষা: রাধার প্রেমের মহিমা কী?",
    "দ্বিতীয় আকাঙ্ক্ষা: রাধার চোখে কৃষ্ণ কত মধুর?",
    "তৃতীয় আকাঙ্ক্ষা: কৃষ্ণকে ভালোবেসে রাধা কী আনন্দ পান?",
  ];
  return `<figure class="radha-desires-chart" aria-label="রাধার প্রেম আস্বাদনে কৃষ্ণের তিনটি অন্তরঙ্গ আকাঙ্ক্ষা"><ol>${desires.map((desire, index) => `<li><span>${toBengaliDigits(index + 1)}</span><p>${desire}</p></li>`).join("")}</ol><figcaption>এই তিনটি আকাঙ্ক্ষা গৌড়ীয় বৈষ্ণব দর্শনে শ্রীচৈতন্য মহাপ্রভুর আবির্ভাবের অন্তরঙ্গ কারণ হিসেবে ব্যাখ্যাত।</figcaption></figure>`;
}

function renderMahaprabhuPurposeMap() {
  return `<figure class="mahaprabhu-purpose-map" aria-label="মহাপ্রভুর আবির্ভাবের অন্তরঙ্গ ও বহিরঙ্গ কারণ"><div class="purpose-map-center">শ্রীচৈতন্য মহাপ্রভুর আবির্ভাব</div><div class="purpose-map-branches"><section><span>অন্তরঙ্গ কারণ</span><p>রাধারাণীর প্রেমের মাহাত্ম্য এবং তাঁর প্রেমানুভূতি আস্বাদন</p></section><section><span>বহিরঙ্গ কারণ</span><p>কলিযুগে নামসংকীর্তন ও কৃষ্ণপ্রেমের প্রচার</p></section></div><figcaption>এই দুই কারণ পরস্পরবিরোধী নয়; মহাপ্রভুর লীলায় উভয় উদ্দেশ্য প্রকাশিত হয়েছে।</figcaption></figure>`;
}

function renderRamanandaPath() {
  const steps = ["বর্ণাশ্রমধর্ম", "কর্মার্পণ", "জ্ঞানমিশ্র ভক্তি", "শুদ্ধভক্তি", "প্রেমভক্তি", "দাস্য · সখ্য · বাৎসল্য · মাধুর্যরস", "রাধারাণীর প্রেমের মাহাত্ম্য"];
  return `<figure class="ramananda-path" aria-label="রায় রামানন্দের আলোচনায় সাধনা ও প্রেমতত্ত্বের ক্রম"><ol>${steps.map((step, index) => `<li><span>${toBengaliDigits(index + 1)}</span><strong>${step}</strong></li>`).join("")}</ol><figcaption>রায় রামানন্দ ধীরে ধীরে বিভিন্ন স্তরের সাধনা ও সাধ্যের কথা আলোচনা করেন।</figcaption></figure>`;
}

function renderRadhaSummary(header, body, renderInline) {
  const entries = body.map(([subject, decision], index) => `<li><span>${toBengaliDigits(index + 1)}</span><div><dt>${renderInline(subject)}</dt><dd>${renderInline(decision)}</dd></div></li>`).join("");
  return `<figure class="radha-summary-chart" aria-label="রাধারাণী ও মহাপ্রভু সম্পর্কে গৌড়ীয় বৈষ্ণব সিদ্ধান্ত"><p>${header.map(renderInline).join(" · ")}</p><ol>${entries}</ol><figcaption>এই সারণির প্রতিটি বক্তব্য গৌড়ীয় বৈষ্ণব ধর্মতত্ত্বের আলোকে বোঝা উচিত।</figcaption></figure>`;
}

function renderStoryRows(skandha) {
  let currentGroup = "";
  return skandha.stories.map(story => {
    const group = story.group && story.group !== currentGroup
      ? `<tr class="story-group-row"><th colspan="3">${escapeHtml(story.group)}</th></tr>`
      : "";
    currentGroup = story.group || currentGroup;
    const depthMark = story.detailKey ? `<span class="depth-mark curated" aria-hidden="true" title="বিস্তারিত গল্প">◇</span>` : "";
    return `${group}<tr id="${story.id}" class="story-row" data-story-row="${story.id}"><td data-label="ঘটনা ও অধ্যায়"><button class="story-open story-title-button" type="button" data-story="${story.id}" aria-label="বিস্তারিত গল্প পড়ুন: ${escapeHtml(story.fullTitle)}">${depthMark}${escapeHtml(story.fullTitle)}</button></td><td data-label="কী ঘটেছিল"><button class="story-open story-summary-button" type="button" data-story="${story.id}" aria-label="বিস্তারিত গল্প পড়ুন: ${escapeHtml(story.fullTitle)}">${escapeHtml(story.whatHappened)}</button></td><td data-label="কী শিখলাম">${escapeHtml(story.lesson)}</td></tr>`;
  }).join("");
}

function renderStoryChapterRows(skandha) {
  return skandha.stories.map(story => `<li data-story-row="${story.id}"><button type="button" class="chapter-story story-open" data-story="${story.id}" aria-label="বিস্তারিত গল্প পড়ুন: ${escapeHtml(story.fullTitle)}"><span>${story.detailKey ? `<span class="depth-mark curated" aria-hidden="true" title="বিস্তারিত গল্প">◇</span>` : ""}${escapeHtml(story.chapter)} — ${escapeHtml(story.title)}</span><small>${escapeHtml(story.whatHappened)}</small></button></li>`).join("");
}

function renderDetailedLessonContent(lesson) {
  return formatDetailedLessonContent(markdownToHtml(lesson.content, lesson.id).html);
}

function formatDetailedLessonContent(html) {
  return html
    .replace(/<p><strong>গদ্যের সারার্থ:<\/strong>/g, `<p class="lesson-summary"><strong>গদ্যের সারার্থ:</strong>`)
    .replace(/<p><strong>শিক্ষা:<\/strong>/g, `<p class="lesson-teaching"><strong>শিক্ষা:</strong>`)
    .replace(/<p><strong>আমাদের জীবনে:<\/strong>/g, `<p class="lesson-application"><strong>আমাদের জীবনে:</strong>`)
    .replace(/<p><strong>ব্যাখ্যা:<\/strong>/g, `<p class="lesson-explanation"><strong>ব্যাখ্যা:</strong>`);
}

function detailedLessonReference(lesson) {
  const bengali = value => String(value).replace(/[0-9]/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
  return `স্কন্ধ ${bengali(lesson.skandha)} · অধ্যায় ${bengali(lesson.chapter)} · শ্লোক ${bengali(lesson.verses)}`;
}

function renderDetailedLessonCard(lesson) {
  const reference = detailedLessonReference(lesson);
  const articlePath = `articles/${lesson.id}.html`;
  return `<article class="lesson-entry" id="${lesson.id}" data-lesson-entry><a class="lesson-open article-link" href="${articlePath}" aria-label="স্বতন্ত্র পাঠ খুলুন: ${escapeHtml(lesson.title)}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">বিশদ পাঠ · ${escapeHtml(lesson.category)}</span><strong class="lesson-card-title">${escapeHtml(lesson.title)}</strong><span class="lesson-card-reference">${escapeHtml(reference)}</span><span class="lesson-card-voices"><span><b>বক্তা</b> ${escapeHtml(lesson.speaker)}</span><span><b>শ্রোতা</b> ${escapeHtml(lesson.listener)}</span></span><span class="lesson-card-teaching"><b>এক বাক্যে শিক্ষা</b> ${escapeHtml(lesson.oneLineLesson)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderChotushlokiCard() {
  const summary = inline(chotushlokiArticle.deck, true);
  const reference = "শ্রীমদ্ভাগবত ২.৯.৩৩–৩৬ · চারটি মূল শ্লোক";
  return `<article class="lesson-entry" id="chotushloki-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${chotushlokiArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ২</span><strong class="lesson-card-title">${inline(chotushlokiArticle.title, true)}</strong><span class="lesson-card-reference">${reference}</span><span class="lesson-card-teaching">${summary}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderKrishnaVishnuCard() {
  return `<article class="lesson-entry" id="krishna-vishnu-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${krishnaVishnuArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ৩</span><strong class="lesson-card-title">${inline(krishnaVishnuArticle.title, true)}</strong><span class="lesson-card-reference">${inline(krishnaVishnuArticle.metadata[0] || "", true)}</span><span class="lesson-card-teaching">${inline(krishnaVishnuArticle.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderChoturdoshBhobanCard() {
  return `<article class="lesson-entry" id="choturdosh-bhoban-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${choturdoshBhobanArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ৪</span><strong class="lesson-card-title">${inline(choturdoshBhobanArticle.title, true)}</strong><span class="lesson-card-reference">চতুর্দশ ভুবন · যুগচক্র · মন্বন্তর · প্রলয়</span><span class="lesson-card-teaching">${inline(choturdoshBhobanArticle.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderShibtottoCard() {
  return `<article class="lesson-entry" id="shibtotto-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${shibtottoArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ৫</span><strong class="lesson-card-title">${inline(shibtottoArticle.title, true)}</strong><span class="lesson-card-reference">ব্রহ্মা · শিবতত্ত্ব · দুর্গাশক্তি · মহামায়া ও যোগমায়া</span><span class="lesson-card-teaching">${inline(shibtottoArticle.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderKrishnaShaktiCard() {
  return `<article class="lesson-entry" id="krishna-shakti-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${krishnaShaktiArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ৬</span><strong class="lesson-card-title">${inline(krishnaShaktiArticle.title, true)}</strong><span class="lesson-card-reference">অন্তরঙ্গা · তটস্থা · বহিরঙ্গা · সন্ধিনী · সম্বিৎ · হ্লাদিনী</span><span class="lesson-card-teaching">${inline(krishnaShaktiArticle.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderRadhaTattvaCard() {
  return `<article class="lesson-entry" id="radha-tattva-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${radhaTattvaArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ৭</span><strong class="lesson-card-title">${inline(radhaTattvaArticle.title, true)}</strong><span class="lesson-card-reference">রাধাতত্ত্ব · মহাভাব · শ্রীচৈতন্য মহাপ্রভু · নামসংকীর্তন</span><span class="lesson-card-teaching">${inline(radhaTattvaArticle.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderRasaGopigitaCard() {
  return `<article class="lesson-entry" id="rasa-gopigita-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${rasaGopigitaArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ৮</span><strong class="lesson-card-title">${inline(rasaGopigitaArticle.title, true)}</strong><span class="lesson-card-reference">পঞ্চরস · অষ্টসখী · রাসলীলা · গোপীগীত</span><span class="lesson-card-teaching">${inline(rasaGopigitaArticle.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderGitagovindaCard() {
  return `<article class="lesson-entry" id="gitagovinda-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${gitagovindaArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ৯</span><strong class="lesson-card-title">${inline(gitagovindaArticle.title, true)}</strong><span class="lesson-card-reference">জয়দেব · ১২টি সর্গ · রাধার মান · প্রেমের পুনর্মিলন</span><span class="lesson-card-teaching">${inline(gitagovindaArticle.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderSeriesArticleCard(article, articlePath, partNumber, reference) {
  const teaching = article.deck || "";
  return `<article class="lesson-entry" id="porbo${partNumber}-article-entry" data-lesson-entry><a class="lesson-open article-link" href="${articlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">ধারাবাহিক পাঠ · পর্ব ${toBengaliDigits(partNumber)}</span><strong class="lesson-card-title">${inline(article.title, true)}</strong><span class="lesson-card-reference">${reference}</span>${teaching ? `<span class="lesson-card-teaching">${inline(teaching, true)}</span>` : ""}</span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
}

function renderDetailedLessons() {
  const articleCard = `<article class="lesson-entry" id="${vishnuArticle.entryId}" data-lesson-entry><a class="lesson-open article-link" href="${vishnuArticle.articlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">সচিত্র ধারাবাহিক পাঠ</span><strong class="lesson-card-title">${escapeHtml(vishnuArticle.title)}</strong><span class="lesson-card-reference">৮টি পর্ব · সৃষ্টি ও সময়চক্র · শিব ও শক্তিতত্ত্ব</span><span class="lesson-card-teaching">কৃষ্ণ, নারায়ণ ও তিন বিষ্ণুর সম্পর্ক থেকে চতুর্দশ ভুবন, যুগ–মন্বন্তর–কল্প, সদাশিব ও রুদ্র—সারণি ও ছবিসহ বিস্তৃত আলোচনা।</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article>`;
  const detailedLessonCards = detailedLessons.map(renderDetailedLessonCard).join("");
  // Keep the numbered reading series first, followed by thematic essays; story-specific lessons remain last.
  const cards = [renderChotushlokiCard(), renderKrishnaVishnuCard(), renderChoturdoshBhobanCard(), renderShibtottoCard(), renderKrishnaShaktiCard(), renderRadhaTattvaCard(), renderRasaGopigitaCard(), renderGitagovindaCard(), renderSeriesArticleCard(porbo10Article, porbo10ArticlePath, 10, "তৃতীয় স্কন্ধ · কপিলদেব ও দেবহূতি · মন, সাধুসঙ্গ ও ভক্তি"), renderSeriesArticleCard(porbo11Article, porbo11ArticlePath, 11, "অহৈতুকী ভক্তি · নিষ্কাম প্রেম · আত্মার প্রসন্নতা"), renderSeriesArticleCard(porbo12Article, porbo12ArticlePath, 12, "চতুর্থ স্কন্ধ · পুরঞ্জন উপাখ্যান · মন, ইন্দ্রিয় ও আত্মস্মরণ"), renderSeriesArticleCard(porbo13Article, porbo13ArticlePath, 13, "চতুর্থ স্কন্ধ · ধ্রুব মহারাজ · ভক্তির রূপান্তর"), renderSeriesArticleCard(porbo14Article, porbo14ArticlePath, 14, "নবম স্কন্ধ · অম্বরীষ ও দুর্বাসা · ভক্তি, ক্ষমা ও শরণাগতি"), renderSeriesArticleCard(porbo15Article, porbo15ArticlePath, 15, "একাদশ স্কন্ধ · চব্বিশ গুরু · জ্ঞান, বৈরাগ্য ও ভক্তি"), articleCard, detailedLessonCards].join("");
  return `<header class="detailed-lessons-header"><p><span aria-hidden="true">◆</span> পূর্ণাঙ্গ অধ্যয়ন</p><h2 id="detailed-lessons-title">বিশদ পাঠ</h2><p>নির্বাচিত প্রসঙ্গের বিস্তৃত পাঠ, ব্যাখ্যা ও জীবনে প্রয়োগ—একটি ক্রমবর্ধমান পাঠাগার।</p></header><section class="detailed-lessons" aria-labelledby="lesson-index-title"><div class="section-rule"><span>পাঠাগার</span></div><h3 id="lesson-index-title">সকল বিশদ পাঠ</h3><label class="lesson-search-label"><span class="sr-only">বিশদ পাঠ খুঁজুন</span><input id="lesson-search" type="search" placeholder="শিরোনাম, বক্তা বা বিষয় খুঁজুন..." autocomplete="off"></label><div class="lesson-list">${cards}</div><p class="lesson-empty" hidden>এই শব্দে কোনো বিশদ পাঠ পাওয়া যায়নি।</p></section>`;
}

function renderStandaloneChotushlokiArticle() {
  const prefix = "chotushloki";
  const renderedArticle = markdownToHtml(chotushlokiArticle.body, prefix, { preserveSource: true });
  const tocItems = renderedArticle.nav.filter(item => item.level === 2).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const metadata = chotushlokiArticle.metadata.map(line => `<p>${inline(line, true)}</p>`).join("");
  const title = inline(chotushlokiArticle.title, true);
  const deck = inline(chotushlokiArticle.deck, true);
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(chotushlokiArticle.deck)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">বিশদ পাঠ · পর্ব ২</p><h1>${title}</h1><p class="article-deck">${deck}</p><div class="article-meta-lines">${metadata}</div></header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${renderedArticle.html}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরে যান</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();</script></body></html>`;
}

function renderStandaloneKrishnaVishnuArticle() {
  const prefix = "krishnavishnu";
  const renderedArticle = markdownToHtml(krishnaVishnuArticle.body, prefix, { preserveSource: true });
  const tocItems = renderedArticle.nav.filter(item => item.level === 2).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const metadata = krishnaVishnuArticle.metadata.map(line => `<p>${inline(line, true)}</p>`).join("");
  const title = inline(krishnaVishnuArticle.title, true);
  const deck = inline(krishnaVishnuArticle.deck, true);
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(krishnaVishnuArticle.deck)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">বিশদ পাঠ · পর্ব ৩</p><h1>${title}</h1><p class="article-deck">${deck}</p><div class="article-meta-lines">${metadata}</div></header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${renderedArticle.html}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরে যান</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();</script></body></html>`;
}

function renderStandaloneChoturdoshBhobanArticle() {
  const prefix = "porbo4";
  const renderedArticle = markdownToHtml(choturdoshBhobanArticle.body, prefix, { preserveSource: true });
  const tocItems = renderedArticle.nav.filter(item => item.level === 2).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const metadata = choturdoshBhobanArticle.metadata.map(line => `<p>${inline(line, true)}</p>`).join("");
  const title = inline(choturdoshBhobanArticle.title, true);
  const deck = inline(choturdoshBhobanArticle.deck, true);
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(choturdoshBhobanArticle.deck)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">বিশদ পাঠ · পর্ব ৪</p><h1>${title}</h1><p class="article-deck">${deck}</p><div class="article-meta-lines">${metadata}</div></header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${renderedArticle.html}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরে যান</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();</script></body></html>`;
}

function renderStandaloneShibtottoArticle() {
  const prefix = "shibtotto";
  const renderedArticle = markdownToHtml(shibtottoArticle.body, prefix, { preserveSource: true });
  const tocItems = renderedArticle.nav.filter(item => item.level === 2).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const metadata = shibtottoArticle.metadata.map(line => `<p>${inline(line, true)}</p>`).join("");
  const title = inline(shibtottoArticle.title, true);
  const deck = inline(shibtottoArticle.deck, true);
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(shibtottoArticle.deck)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">বিশদ পাঠ · পর্ব ৫</p><h1>${title}</h1><p class="article-deck">${deck}</p><div class="article-meta-lines">${metadata}</div></header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${renderedArticle.html}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরে যান</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();</script></body></html>`;
}

function renderStandaloneKrishnaShaktiArticle() {
  const prefix = "krishnashakti";
  const renderedArticle = markdownToHtml(krishnaShaktiArticle.body, prefix, { preserveSource: true });
  const tocItems = renderedArticle.nav.filter(item => item.level === 2).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const metadata = krishnaShaktiArticle.metadata.map(line => `<p>${inline(line, true)}</p>`).join("");
  const title = inline(krishnaShaktiArticle.title, true);
  const deck = inline(krishnaShaktiArticle.deck, true);
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(krishnaShaktiArticle.deck)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">বিশদ পাঠ · পর্ব ৬</p><h1>${title}</h1><p class="article-deck">${deck}</p><div class="article-meta-lines">${metadata}</div></header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${renderedArticle.html}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরে যান</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();</script></body></html>`;
}

function renderStandaloneRadhaTattvaArticle() {
  const prefix = "radha";
  const renderedArticle = markdownToHtml(radhaTattvaArticle.body, prefix, { preserveSource: true });
  const tocItems = renderedArticle.nav.filter(item => item.level === 2).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const metadata = radhaTattvaArticle.metadata.map(line => `<p>${inline(line, true)}</p>`).join("");
  const title = inline(radhaTattvaArticle.title, true);
  const deck = inline(radhaTattvaArticle.deck, true);
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(radhaTattvaArticle.deck)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">বিশদ পাঠ · পর্ব ৭</p><h1>${title}</h1><p class="article-deck">${deck}</p><div class="article-meta-lines">${metadata}</div></header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${renderedArticle.html}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরে যান</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();</script></body></html>`;
}

function renderStandaloneSeriesArticle(article, prefix, partNumber) {
  const renderedArticle = markdownToHtml(article.body, prefix, { preserveSource: true });
  const tocItems = renderedArticle.nav.filter(item => prefix === "porbo11" ? item.level === 3 : item.level === 2).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return prefix === "shikha1"
      ? `<a href="#${item.id}"><span class="toc-number">${number}</span><span class="toc-title">${inline(title, true)}</span></a>`
      : `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const metadata = article.metadata.map(line => `<p>${inline(line, true)}</p>`).join("");
  const title = inline(article.title, true);
  const deck = inline(article.deck, true);
  const deckHtml = article.deck ? `<p class="article-deck">${deck}</p>` : "";
  const metadataHtml = metadata ? `<div class="article-meta-lines">${metadata}</div>` : "";
  const returnLabel = prefix === "shikha1" ? "শিক্ষায় ফিরুন" : "বিশদ পাঠে ফিরুন";
  const returnTarget = prefix === "shikha1" ? "#shikha-title" : "#detailed-lessons-title";
  const eyebrow = prefix === "shikha1" ? "শিক্ষা · শিক্ষাপর্ব ১" : `বিশদ পাঠ · পর্ব ${toBengaliDigits(partNumber)}`;
  const tocInitialization = prefix === "shikha1" ? `const tocDetails=document.querySelector('.article-toc details');if(tocDetails)tocDetails.open=!matchMedia('(max-width: 1000px)').matches;` : "";
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(article.deck || article.title)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css${prefix === "shikha1" ? "?v=shikha-20261128" : ""}"></head>
<body class="series-article series-article-${prefix}"><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html${returnTarget}">← ${returnLabel}</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html${returnTarget}">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${deckHtml}${metadataHtml}</header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details${prefix === "shikha1" ? "" : " open"}><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${renderedArticle.html}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html${returnTarget}">← ${returnLabel}</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();${tocInitialization}</script></body></html>`;
}

function renderStandaloneDetailedLessonArticle(lesson) {
  const prefix = lesson.id;
  const rendered = markdownToHtml(lesson.content, prefix, { preserveSource: true });
  const tocItems = rendered.nav.filter(item => item.level <= 3).map(item => {
    const numbered = item.title.match(/^([০-৯]+\.)\s*(.*)$/u);
    const number = numbered ? inline(numbered[1], true) : "·";
    const title = numbered ? numbered[2] : item.title;
    return `<a href="#${item.id}"><span>${number}</span>${inline(title, true)}</a>`;
  }).join("");
  const reference = detailedLessonReference(lesson);
  const title = escapeHtml(lesson.title);
  const deck = inline(lesson.oneLineLesson, true);
  const articlePath = `articles/${lesson.id}.html`;
  const metadata = [
    `<p><strong>গ্রন্থ ও স্থান:</strong> ${escapeHtml(lesson.scripture)} · ${escapeHtml(reference)}</p>`,
    `<p><strong>বক্তা:</strong> ${escapeHtml(lesson.speaker)} · <strong>শ্রোতা:</strong> ${escapeHtml(lesson.listener)}</p>`,
    lesson.sourcePages ? `<p><strong>পাঠের সূত্র:</strong> ${escapeHtml(lesson.sourcePages)}</p>` : "",
  ].filter(Boolean).join("");
  return `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="${escapeHtml(lesson.oneLineLesson)}"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<header class="article-hero"><p class="eyebrow">বিশদ পাঠ · ${escapeHtml(lesson.category)}</p><h1>${title}</h1><p class="article-deck">${deck}</p><div class="article-meta-lines">${metadata}</div></header>
<main class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${tocItems}</nav></details></aside><article id="article"><div class="article-part">${formatDetailedLessonContent(rendered.html)}</div><footer class="article-end"><p>এই পাঠটি শেষ করেছেন?</p><a href="../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title">← বিশদ পাঠে ফিরে যান</a></footer></article></main>
<script>const progress=document.querySelector('.reading-progress');function updateProgress(){const root=document.documentElement;const available=root.scrollHeight-root.clientHeight;progress.style.width=(available>0?root.scrollTop/available*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});updateProgress();</script></body></html>`;
}

function renderStoryModule() {
  const overview = storyIntegration.skandhas.map(skandha => `<li><button type="button" data-select-skandha="${skandha.number}"><span>${escapeHtml(skandha.ordinal)} স্কন্ধ</span><strong>${escapeHtml(skandha.titleBn)}</strong><small>${escapeHtml(skandha.chapterCountBn)}টি অধ্যায় · ${escapeHtml(skandha.themeBn)}</small></button></li>`).join("");
  const panels = storyIntegration.skandhas.map((skandha, index) => `<section class="skandha-story-panel" id="stories-skandha-${skandha.number}" data-skandha-panel="${skandha.number}" ${index ? "hidden" : ""}><header class="skandha-header"><p>${escapeHtml(skandha.chapterCountBn)}টি অধ্যায়</p><h3>${escapeHtml(skandha.ordinal)} স্কন্ধ — ${escapeHtml(skandha.titleBn)}</h3><p><strong>মূল ভাব:</strong> ${escapeHtml(skandha.themeBn)}</p><p class="memory-line"><strong>এক বাক্যের শিক্ষা:</strong> ${escapeHtml(skandha.memoryLineBn)}</p></header><div class="story-view" data-view="story"><div class="story-table-wrap"><table class="story-table"><thead><tr><th>ঘটনা ও অধ্যায়</th><th>কী ঘটেছিল</th><th>কী শিখলাম</th></tr></thead><tbody>${renderStoryRows(skandha)}</tbody></table></div></div><div class="chapter-view" data-view="chapter" hidden><ol>${renderStoryChapterRows(skandha)}</ol></div><p class="story-empty" hidden>এই শব্দে কোনো গল্প পাওয়া যায়নি।</p></section>`).join("");
  return `<header class="story-page-header"><p class="story-kicker">পড়ুন • বুঝুন • মনে রাখুন • জীবনে প্রয়োগ করুন</p><h2 id="stories-title">শ্রীমদ্ভাগবত — গল্প ও শিক্ষা</h2><p>১২টি স্কন্ধের প্রধান ঘটনা, তাদের মূল শিক্ষা এবং বিস্তারিত গল্প—এক জায়গায়।</p></header><section class="skandha-overview" aria-labelledby="overview-title"><div class="section-rule"><span>১২ স্কন্ধ এক নজরে</span></div><h3 id="overview-title">স্কন্ধ নির্বাচন করুন</h3><ol>${overview}</ol></section><div class="story-toolbar"><div class="story-view-toggle" role="group" aria-label="গল্প দেখার ধরন"><button class="active" type="button" data-story-view="story" aria-pressed="true">গল্প অনুযায়ী</button><button type="button" data-story-view="chapter" aria-pressed="false">অধ্যায় অনুযায়ী</button></div><label class="story-search-label"><span class="sr-only">গল্প খুঁজুন</span><input id="story-search" type="search" placeholder="গল্প, চরিত্র বা অধ্যায় খুঁজুন..." autocomplete="off"></label></div>${panels}<dialog class="story-dialog" id="story-dialog" aria-labelledby="story-dialog-title"><div class="story-dialog-inner"><button class="story-dialog-close" type="button" aria-label="বন্ধ করুন">বন্ধ করুন</button><p class="story-dialog-reference"><span>স্কন্ধ ও অধ্যায়</span><strong id="story-dialog-reference"></strong></p><h3 id="story-dialog-title"></h3><p class="story-dialog-note">গল্পের সারাংশ ও শিক্ষামূলক ব্যাখ্যা; মূল শ্লোকের বিকল্প নয়।</p><div id="story-dialog-content"></div><div class="story-source"><h4>মূল গ্রন্থে ফিরে যান</h4><p id="story-source-links"></p></div></div></dialog>`;
}

const rendered = chapters.map(chapter => chapter.storyModule
  ? { ...chapter, html: renderStoryModule(), nav: storyIntegration.skandhas.map(item => ({ id: `stories-skandha-${item.number}`, title: `${item.ordinal} স্কন্ধ` })), storyModule: true }
  : { ...chapter, ...markdownToHtml(chapter.markdown, chapter.renderPrefix || chapter.id, { preserveSource: chapter.renderPrefix === "porichoy" }) });
rendered.push({
  id: "detailed-lessons",
  title: "বিশদ পাঠ",
  html: renderDetailedLessons(),
  nav: [
    { id: "chotushloki-article-entry", title: chotushlokiArticle.title },
    { id: "krishna-vishnu-article-entry", title: krishnaVishnuArticle.title },
    { id: "choturdosh-bhoban-article-entry", title: choturdoshBhobanArticle.title },
    { id: "shibtotto-article-entry", title: shibtottoArticle.title },
    { id: "krishna-shakti-article-entry", title: krishnaShaktiArticle.title },
    { id: "radha-tattva-article-entry", title: radhaTattvaArticle.title },
    { id: "rasa-gopigita-article-entry", title: rasaGopigitaArticle.title },
    { id: "gitagovinda-article-entry", title: gitagovindaArticle.title },
    { id: "porbo10-article-entry", title: porbo10Article.title },
    { id: "porbo11-article-entry", title: porbo11Article.title },
    { id: "porbo12-article-entry", title: porbo12Article.title },
    { id: "porbo13-article-entry", title: porbo13Article.title },
    { id: "porbo14-article-entry", title: porbo14Article.title },
    { id: "porbo15-article-entry", title: porbo15Article.title },
    { id: vishnuArticle.entryId, title: vishnuArticle.title },
    ...detailedLessons.map(lesson => ({ id: lesson.id, title: lesson.title })),
  ],
  detailedLessonModule: true,
});
const shikhaIndex = rendered.length;
rendered.push({
  id: "shikha",
  title: "জীবনদর্শন",
  html: `<div class="life-philosophy-page"><header class="life-philosophy-header"><p class="life-philosophy-kicker">প্রাচীন প্রজ্ঞা · আধুনিক জীবন · অন্তরের বিকাশ</p><h2 id="shikha-title">জীবনদর্শন</h2><p class="life-philosophy-subtitle"><strong>শ্রীমদ্ভাগবতের আলোয় মানুষের জীবন</strong></p><p class="life-philosophy-deck">প্রাচীন প্রজ্ঞা, আধুনিক জীবন ও অন্তরের বিকাশ</p><div class="life-philosophy-intro"><p>শ্রীমদ্ভাগবত কেবল ভক্তির গ্রন্থ নয়, মানুষের মন, সম্পর্ক, আকাঙ্ক্ষা, কর্তব্য ও জীবনের গভীর অর্থ উপলব্ধি করারও এক অনন্য উৎস। এই বিভাগে আমরা ভাগবতের প্রজ্ঞার আলোকে নিজেদের জীবনকে আরও সুন্দর, শান্ত ও অর্থপূর্ণ করে তোলার পথ অনুসন্ধান করব।</p></div></header><section class="detailed-lessons" aria-labelledby="shikha-index-title"><div class="section-rule"><span>পাঠাগার</span></div><h3 id="shikha-index-title">জীবনদর্শনের পাঠ</h3><div class="lesson-list"><article class="lesson-entry" id="shikha-porbo-1"><a class="lesson-open article-link" href="${shikha1ArticlePath}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">শিক্ষাপর্ব ১</span><strong class="lesson-card-title">${inline(shikha1Article.title, true)}</strong><span class="lesson-card-reference">${inline(shikha1Article.deck, true)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন →</span></a></article></div></section></div>`,
  nav: [{ id: "shikha-porbo-1", title: shikha1Article.title }],
});
const tabOrder = rendered.map((_, index) => index);
const detailedLessonsTabIndex = rendered.findIndex(item => item.id === "detailed-lessons");
tabOrder.splice(tabOrder.indexOf(detailedLessonsTabIndex), 1);
tabOrder.splice(1, 0, detailedLessonsTabIndex);
tabOrder.splice(tabOrder.indexOf(shikhaIndex), 1);
tabOrder.splice(tabOrder.indexOf(detailedLessonsTabIndex) + 1, 0, shikhaIndex);

const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="বাংলায় শ্রীমদ্ভাগবত মহাপুরাণের পরিচয়, ২৫টি শ্লোক, প্রধান কথোপকথন, চরিত্র, সময়রেখা, গল্প ও শিক্ষা।">
<meta name="theme-color" content="#f8f6f1">
<meta property="og:title" content="শ্রীমদ্ভাগবত মহাপুরাণ — বাংলা জ্ঞানমানচিত্র">
<meta property="og:description" content="শ্লোক, কথোপকথন, চরিত্র, সময়রেখা, গল্প ও শিক্ষার একটি বাংলা editorial পাঠসংস্করণ।">
<title>শ্রীমদ্ভাগবত মহাপুরাণ — বাংলা জ্ঞানমানচিত্র</title>
<style>
@font-face{font-family:"Noto Serif Bengali";src:url("assets/fonts/NotoSerifBengali-400.ttf") format("truetype");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Noto Serif Bengali";src:url("assets/fonts/NotoSerifBengali-500.ttf") format("truetype");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"Noto Serif Bengali";src:url("assets/fonts/NotoSerifBengali-600.ttf") format("truetype");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"Noto Serif Bengali";src:url("assets/fonts/NotoSerifBengali-700.ttf") format("truetype");font-weight:700;font-style:normal;font-display:swap}
:root{--bg:#071018;--panel:#0d1822;--panel2:#12222e;--text:#edf3f5;--muted:#a8b7bf;--gold:#e5b85d;--line:#253844;--glow:rgba(229,184,93,.12);--radius:18px}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--text);background:radial-gradient(circle at 85% -10%,#26364a 0,#071018 36%) fixed;font-family:"Noto Sans Bengali","Nirmala UI","Vrinda",system-ui,sans-serif;line-height:1.75}.hero{padding:42px clamp(20px,6vw,90px) 30px;border-bottom:1px solid var(--line);background:linear-gradient(135deg,rgba(229,184,93,.09),transparent 48%)}.eyebrow{color:var(--gold);font-size:.85rem;letter-spacing:.08em}.hero h1{font-size:clamp(2.2rem,5vw,4.8rem);line-height:1.08;margin:.25rem 0}.hero p{max-width:920px;color:var(--muted);font-size:1.06rem}.tabs{position:sticky;top:0;z-index:50;display:flex;gap:8px;overflow:auto;padding:10px 4vw;background:rgba(7,16,24,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}button,input{font:inherit}.tab{white-space:nowrap;border:1px solid var(--line);background:var(--panel);color:var(--muted);padding:9px 15px;border-radius:999px;cursor:pointer}.tab.active{color:#17120a;background:linear-gradient(135deg,var(--gold),#f5d18d);border-color:transparent;font-weight:800}.page{display:none}.page.active{display:grid;grid-template-columns:285px minmax(0,1fr);max-width:1540px;margin:auto}.side{position:sticky;top:64px;height:calc(100vh - 64px);overflow:auto;padding:20px 16px;border-right:1px solid var(--line);background:rgba(9,18,27,.58)}.side-title{color:var(--gold);font-size:.86rem;margin:6px 10px 10px}.search{width:100%;margin-bottom:12px;padding:10px 12px;border:1px solid var(--line);border-radius:11px;background:#09131c;color:#fff}.side a{display:block;color:var(--muted);text-decoration:none;padding:7px 10px;border-radius:9px;font-size:.93rem}.side a:hover{color:var(--text);background:var(--panel2)}main{min-width:0;padding:36px clamp(22px,5vw,74px) 90px}.content{max-width:1040px}.content h2,.content h3,.content h4{scroll-margin-top:82px;line-height:1.28}.content h2{font-size:clamp(1.8rem,3vw,2.7rem);margin:0 0 22px;color:#fff}.content h3{font-size:clamp(1.35rem,2.3vw,2rem);margin:56px 0 13px;padding-top:8px;color:#fff}.content h4{font-size:1.25rem;margin:36px 0 10px;color:#f1d18f}.content p{color:var(--muted);margin:12px 0}.content strong{color:#fff}.content code{color:#f3d69b;background:rgba(229,184,93,.08);padding:2px 6px;border-radius:6px}.content hr{height:1px;border:0;background:linear-gradient(90deg,transparent,var(--line),transparent);margin:44px 0}.content blockquote{margin:22px 0;padding:16px 20px;border-left:3px solid var(--gold);border-radius:0 14px 14px 0;background:var(--glow);color:#f7edd9;font-size:1.08rem}.content ul{padding-left:1.35rem;color:var(--muted)}.content li{margin:8px 0}.diagram-wrap{margin:22px 0;border:1px solid var(--line);border-radius:var(--radius);background:linear-gradient(145deg,#0f1d27,#09131b);overflow:auto;box-shadow:0 18px 45px rgba(0,0,0,.2)}.diagram-label{position:sticky;left:0;width:max-content;padding:8px 14px;color:var(--gold);font-size:.78rem;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:#13232e}.diagram{margin:0;padding:24px;min-width:max-content;color:#f8e2b2;font:500 1rem/1.65 "Noto Sans Bengali","Nirmala UI",monospace}.diagram code{padding:0;background:none;color:inherit}.table-wrap{margin:24px 0;overflow:auto;border:1px solid var(--line);border-radius:var(--radius)}table{width:100%;min-width:780px;border-collapse:collapse;background:rgba(9,18,27,.75)}th,td{text-align:left;vertical-align:top;padding:14px 16px;border-bottom:1px solid var(--line)}th{color:var(--gold);background:#152632}td{color:var(--muted)}tr:last-child td{border-bottom:0}.hidden-by-search{display:none!important}.source-note{margin-bottom:28px;padding:14px 16px;border:1px dashed #705c32;border-radius:14px;background:rgba(229,184,93,.05);color:#d9c9a7}footer{padding:30px;text-align:center;color:#748690;border-top:1px solid var(--line)}
.prompt-wrap{border-color:#685934;background:linear-gradient(145deg,rgba(229,184,93,.1),#0b151d)}.prompt-wrap .diagram{color:#fff}
/* বাংলা সাহিত্যপত্রিকার মতো editorial reading theme */
:root{--bg:#f8f6f1;--panel:#fff;--panel2:#f2eee6;--text:#171717;--muted:#343434;--gold:#a8320c;--line:#dedbd4;--glow:#fff7ee;--radius:8px}body{color:var(--text);background:#f8f6f1;font-family:"Noto Serif Bengali","Nirmala UI",serif;font-size:17px;line-height:1.95}.hero{padding:42px clamp(22px,6vw,88px) 34px;background:#fff;border-bottom:1px solid var(--line)}.eyebrow{color:#a8320c;font-size:.78rem;letter-spacing:.04em}.hero h1{max-width:900px;font-size:clamp(2.25rem,4vw,3.8rem);font-weight:600;line-height:1.22;margin:.35rem 0;color:#151515}.hero p{max-width:820px;color:#555;font-size:1rem;line-height:1.85}.hero code{font-family:inherit;color:#8f2b0c;background:none}.tabs{padding:0 clamp(18px,5vw,72px);gap:30px;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);box-shadow:none}.tab{padding:15px 1px 11px;border:0;border-bottom:3px solid transparent;border-radius:0;background:transparent;color:#585858;font-size:.96rem}.tab:hover{color:#a8320c}.tab.active{color:#a8320c;background:transparent;border-bottom-color:#a8320c;font-weight:600}.page.active{grid-template-columns:235px minmax(0,1fr);max-width:1320px;background:#fff}.side{top:54px;height:calc(100vh - 54px);padding:26px 18px;background:#fbfaf7;border-right:1px solid var(--line)}.side-title{color:#a8320c;font-size:.78rem;font-weight:600;letter-spacing:.04em}.search{padding:9px 10px;border:1px solid #d8d4cb;border-radius:4px;background:#fff;color:#222;font-size:.84rem}.side a{padding:6px 9px;border-radius:3px;color:#595959;font-size:.83rem;line-height:1.55}.side a:hover{color:#a8320c;background:#f1ede5}main{padding:45px clamp(28px,6vw,86px) 100px;background:#fff}.content{max-width:860px;margin:0 auto}.content h2,.content h3,.content h4{font-family:"Noto Serif Bengali","Nirmala UI",serif;font-weight:500;letter-spacing:-.015em}.content h2{font-size:clamp(2rem,3.2vw,2.8rem);color:#9c2d09;margin:0 0 24px}.content h3{font-size:clamp(1.55rem,2.4vw,2.15rem);color:#9c2d09;margin:62px 0 16px;padding-top:4px}.content h4{font-size:1.28rem;color:#222;margin:40px 0 12px}.content p{color:#282828;margin:14px 0;font-size:1.08rem;line-height:2}.content strong{color:#111;font-weight:600}.content code{font-family:inherit;color:#87300f;background:#fbf2e8;padding:1px 5px;border-radius:3px}.content hr{margin:54px 0;background:linear-gradient(90deg,#ddd8ce,transparent)}.content blockquote{position:relative;margin:34px 0;padding:42px 46px 30px 60px;border:1px solid #e2ded6;border-left:1px solid #e2ded6;border-radius:8px;background:#fbfaf7;color:#07547a;font-size:1.2rem;line-height:1.9}.content blockquote:before{content:"“";position:absolute;left:24px;top:-6px;color:#d17b35;font-family:Georgia,serif;font-size:5.5rem;font-weight:700;line-height:1}.content ul{color:#292929}.content li{margin:10px 0}.diagram-wrap{margin:30px 0;border:1px solid #ddd8ce;border-radius:6px;background:#fbfaf7;box-shadow:none}.prompt-wrap{border-color:#eadbc8;background:#fffaf3}.diagram-label{padding:7px 13px;color:#a8320c;border-color:#ddd8ce;background:#f4efe7;font-size:.72rem}.diagram{padding:25px 28px;color:#37322c;font:500 1rem/1.75 "Noto Serif Bengali","Nirmala UI",serif}.prompt-wrap .diagram{color:#333}.table-wrap{margin:30px 0;border:1px solid #ddd8ce;border-radius:6px}table{background:#fff}th,td{padding:14px 16px;border-bottom:1px solid #e5e1da}th{color:#8f2b0c;background:#f4efe7;font-weight:600}td{color:#303030}.source-note{margin-bottom:36px;padding:12px 15px;border:0;border-left:3px solid #c56d31;border-radius:0;background:#fff8ef;color:#65594d;font-size:.86rem}footer{padding:34px;color:#777;background:#f8f6f1;border-top:1px solid var(--line)}
.skip-link{position:fixed;left:16px;top:10px;z-index:1000;padding:9px 13px;color:#fff;background:#7d260b;border-radius:3px;transform:translateY(-150%);transition:transform .15s}.skip-link:focus{transform:translateY(0)}.tab:focus-visible,.side a:focus-visible,.search:focus-visible,.mobile-toc summary:focus-visible{outline:3px solid #245775;outline-offset:3px}.side a.active{color:#9c2d09;background:#f1ede5;font-weight:600;border-left:2px solid #a8320c}.mobile-toc{display:none}.mobile-toc summary{cursor:pointer;color:#9c2d09;font-weight:600;list-style:none}.mobile-toc summary::-webkit-details-marker{display:none}.mobile-toc summary:after{content:"＋";margin-left:8px}.mobile-toc[open] summary:after{content:"−"}.mobile-toc-links{display:grid;grid-template-columns:1fr;margin-top:10px;max-height:52vh;overflow:auto}.mobile-toc-links a{white-space:normal!important}.main-content:focus{outline:none}
.editorial-map{margin:40px 0;padding:30px clamp(20px,4vw,44px);border-top:1px solid #d6cdbf;border-bottom:1px solid #d6cdbf;background:linear-gradient(90deg,#fff 0,#fcfaf5 12%,#fcfaf5 88%,#fff 100%)}.editorial-map figcaption{margin-bottom:30px;text-align:center}.editorial-map figcaption strong{display:block;color:#9c2d09;font-size:1.35rem;font-weight:500}.editorial-map figcaption span{display:block;margin-top:3px;color:#74695e;font-size:.8rem}.map-node{position:relative;min-width:150px;padding:10px 14px;text-align:center;background:#fff;border-bottom:2px solid #bc6a3f}.map-node strong{display:block;color:#28221d;font-size:1rem;font-weight:600}.map-node small{display:block;margin-top:2px;color:#766c62;font-size:.7rem}.map-node.speaker{border-bottom-color:#9c2d09}.map-node.listener{border-bottom-color:#c79255}.map-node.divine{border-bottom-color:#245775}.map-node.divine strong{color:#245775}.map-node.root-node{border:1px solid #d8cbb9;border-bottom:3px solid #9c2d09;background:#fffdf8}.map-chain{display:flex;flex-direction:column;align-items:center;max-width:360px;margin:0 auto}.map-chain.compact{margin-bottom:12px}.map-arrow{display:block;height:31px;color:#a84b26;font-size:1.35rem;line-height:31px;text-align:center}.dialogue-pair{display:grid;grid-template-columns:minmax(170px,1fr) minmax(100px,150px) minmax(170px,1fr);align-items:center;gap:14px;max-width:720px;margin:0 auto}.relation-line{display:flex;align-items:center;color:#9c2d09}.relation-line:before,.relation-line:after{content:"";flex:1;border-top:1px solid #b8704d}.relation-line span{padding:0 8px;font-size:.72rem}.relation-line b{font-size:1rem}.nested-label{position:relative;width:max-content;margin:36px auto 22px;padding:5px 12px;color:#685d51;background:#f5f0e8;font-size:.72rem}.nested-label:before{content:"";position:absolute;left:50%;bottom:100%;height:36px;border-left:1px dashed #b7a896}.branch-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.branch-card{position:relative;padding:15px 14px;background:#fff;border-top:2px solid #bc6a3f;text-align:center}.branch-card:before{content:"";position:absolute;left:50%;bottom:100%;height:22px;border-left:1px dashed #c8b9a6}.branch-card b{display:block;color:#3a3027;font-size:.88rem}.branch-card span{display:block;margin-top:7px;color:#70665b;font-size:.73rem}.branch-card.divine{border-top-color:#245775}.branch-card.divine b{color:#245775}.map-legend{display:flex;justify-content:center;flex-wrap:wrap;gap:16px;margin-top:24px;color:#756b61;font-size:.68rem}.map-legend i{display:inline-block;width:18px;margin-right:5px;border-top:2px solid}.legend-terracotta{border-color:#bc6a3f!important}.legend-blue{border-color:#245775!important}.family-map{display:flex;flex-direction:column;align-items:center}.family-map figcaption{width:100%}.family-split{position:relative;display:grid;grid-template-columns:repeat(2,minmax(190px,1fr));gap:80px;width:min(680px,100%);margin-top:42px;padding-top:24px}.family-split:before{content:"";position:absolute;left:25%;right:25%;top:0;border-top:1px solid #bca98f}.family-split:after{content:"";position:absolute;left:50%;top:-42px;height:42px;border-left:1px solid #bca98f}.family-branch{position:relative;display:flex;flex-direction:column;align-items:center}.family-branch:before{content:"";position:absolute;left:50%;top:-24px;height:24px;border-left:1px solid #bca98f}.family-split.three{grid-template-columns:repeat(3,minmax(140px,1fr));gap:25px}.family-split.three:before{left:16.66%;right:16.66%}.siblings{grid-template-columns:repeat(2,minmax(180px,1fr));gap:26px;margin-top:0}.cosmos-level{display:flex;justify-content:center;align-items:center}.level-three{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:30px;padding-top:25px}.level-three:before{content:"";position:absolute;left:16.66%;right:16.66%;top:0;border-top:1px solid #bca98f}.level-three>div{position:relative}.level-three>div:before{content:"";position:absolute;left:50%;bottom:100%;height:25px;border-left:1px solid #bca98f}.map-note{max-width:680px;margin:28px auto 0!important;text-align:center;color:#6e6459!important;font-size:.78rem!important;line-height:1.7!important}.diagram-source{margin-top:26px;border-top:1px dotted #d2c7b8;padding-top:12px;color:#776c60;font-size:.72rem}.diagram-source summary{width:max-content;margin:auto;cursor:pointer;color:#8e3215}.diagram-source pre{overflow:auto;padding:18px;background:#f7f3ec;color:#494037;font-family:"Noto Serif Bengali","Nirmala UI",serif;line-height:1.6}.text-map>pre{overflow:auto;color:#40372d;font-family:"Noto Serif Bengali","Nirmala UI",serif}.editorial-map :focus-visible{outline:3px solid #245775;outline-offset:3px}
/* compact editorial rhythm */
.hero{padding-top:30px;padding-bottom:24px}.tabs{gap:26px}.tab{padding-top:12px;padding-bottom:9px}main{padding-top:34px;padding-bottom:72px}.content{max-width:960px}.content h2{font-size:clamp(1.7rem,2.5vw,2.2rem);margin-bottom:18px}.content h3{font-size:clamp(1.35rem,2vw,1.72rem);margin-top:42px;margin-bottom:12px}.content h4{font-size:1.12rem;margin-top:28px}.content p{font-size:1.02rem;line-height:1.85;margin:10px 0}.content hr{margin:38px 0}.content blockquote{margin:25px 0;padding:34px 38px 24px 52px;font-size:1.08rem;line-height:1.8}.editorial-map{margin:30px 0;padding-top:24px;padding-bottom:24px}.editorial-map figcaption{margin-bottom:22px}
/* ২৫টি শ্লোকের অভিন্ন editorial structure */
.verse-collection{margin-top:24px}.verse-entry{display:grid;grid-template-columns:72px minmax(0,1fr);gap:26px;padding:8px 0 44px;margin-bottom:38px;border-bottom:1px solid #ded8cf;scroll-margin-top:72px}.verse-rail{padding-top:2px;text-align:right;border-right:1px solid #d9cfc1;padding-right:16px}.verse-rail span{display:block;color:#a8320c;font-size:1.35rem;font-weight:600;line-height:1}.verse-rail small{display:block;margin-top:8px;color:#73695f;font-size:.72rem;white-space:nowrap}.verse-header{display:flex;align-items:baseline;justify-content:space-between;gap:18px;margin-bottom:14px}.verse-header h3{margin:0;padding:0;color:#8f2b0c;font-size:1.5rem}.verse-header h3:after{display:none}.verse-reference{flex:none;color:#766b60;font-size:.75rem}.verse-context{display:grid;grid-template-columns:1fr 1fr 2fr;gap:0;margin:0 0 18px;border-top:1px solid #e2dcd3;border-bottom:1px solid #e2dcd3}.verse-context>div{padding:9px 13px;border-right:1px solid #e2dcd3}.verse-context>div:first-child{padding-left:0}.verse-context>div:last-child{border-right:0}.verse-context dt{color:#9b3a17;font-size:.78rem;font-weight:600;letter-spacing:.025em}.verse-context dd{margin:3px 0 0;color:#4e463e;font-size:.9rem;line-height:1.5}.verse-text{padding:22px 28px;margin-bottom:18px;border-top:2px solid #bd6e43;background:#fbf8f2;color:#17556f;font-size:1.18rem;line-height:1.9}.verse-text span{display:block}.verse-explanation>p{margin:8px 0;font-size:.98rem;line-height:1.8}.verse-explanation>p strong:first-child{color:#8f2b0c;font-size:.9rem;font-weight:600}.verse-explanation .quote{display:none}
/* গল্প ও শিক্ষা — একই editorial design system-এর সম্প্রসারণ */
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.story-side-nav{display:grid;gap:2px}.story-side-nav button{width:100%;padding:8px 9px;border:0;border-left:2px solid transparent;background:transparent;color:#595959;text-align:left;cursor:pointer;font-size:.82rem;line-height:1.45}.story-side-nav button:hover,.story-side-nav button.active{color:#9c2d09;background:#f1ede5;border-left-color:#a8320c}.story-side-nav button:focus-visible,.story-open:focus-visible,.story-view-toggle button:focus-visible,.skandha-overview button:focus-visible,.story-dialog-close:focus-visible{outline:3px solid #245775;outline-offset:2px}.story-page-header{padding-bottom:20px;border-bottom:1px solid #ded8cf}.story-page-header .story-kicker{margin:0 0 4px;color:#a8320c;font-size:.8rem;letter-spacing:.025em}.story-page-header h2{margin-bottom:10px}.story-page-header>p:last-child{margin:0;color:#514a43;font-size:1rem}.section-rule{display:flex;align-items:center;gap:12px;margin-top:30px;color:#9c2d09;font-size:.75rem;font-weight:600;letter-spacing:.04em}.section-rule:after{content:"";flex:1;border-top:1px solid #d8d0c5}.skandha-overview h3{margin:8px 0 10px;color:#222;font-size:1.15rem}.skandha-overview ol{display:grid;grid-template-columns:1fr 1fr;gap:0 28px;margin:0;padding:0;list-style:none;border-top:1px solid #ded8cf}.skandha-overview li{border-bottom:1px solid #e5e0d8}.skandha-overview button{display:grid;grid-template-columns:74px 1fr;grid-template-areas:"number title" "number meta";width:100%;padding:12px 4px;border:0;background:transparent;text-align:left;cursor:pointer}.skandha-overview button:hover strong{color:#9c2d09}.skandha-overview button>span{grid-area:number;color:#a8320c;font-size:.82rem}.skandha-overview button>strong{grid-area:title;color:#25211d;font-size:.94rem;font-weight:600}.skandha-overview button>small{grid-area:meta;margin-top:2px;color:#766d64;font-size:.7rem;line-height:1.45}.story-toolbar{position:sticky;top:54px;z-index:8;display:flex;align-items:center;justify-content:space-between;gap:18px;margin:30px 0 0;padding:10px 0;background:rgba(255,255,255,.97);border-bottom:1px solid #ded8cf}.story-view-toggle{display:flex;gap:18px}.story-view-toggle button{padding:5px 0;border:0;border-bottom:2px solid transparent;background:transparent;color:#666;cursor:pointer;font-size:.8rem}.story-view-toggle button.active{color:#9c2d09;border-bottom-color:#a8320c;font-weight:600}.story-search-label{width:min(330px,46%)}#story-search{width:100%;padding:7px 9px;border:1px solid #d8d4cb;border-radius:3px;background:#fff;color:#222;font-size:.78rem}.skandha-story-panel{scroll-margin-top:116px}.skandha-header{padding:25px 0 12px}.skandha-header>p:first-child{margin:0;color:#9c2d09;font-size:.75rem}.content .skandha-header h3{margin:2px 0 5px;padding:0;color:#8f2b0c;font-size:1.55rem}.skandha-header>p{margin:4px 0;color:#4d463e;font-size:.9rem;line-height:1.65}.skandha-header .memory-line{margin-top:9px;padding-left:12px;border-left:2px solid #c87845;color:#2e2924}.story-table-wrap{border-top:2px solid #b9683d;border-bottom:1px solid #ded8cf}.story-table{min-width:0;table-layout:fixed;font-size:.88rem;line-height:1.65}.story-table th,.story-table td{padding:12px 13px}.story-table thead th:nth-child(1){width:28%}.story-table thead th:nth-child(2){width:40%}.story-table thead th:nth-child(3){width:32%}.story-table .story-group-row th{padding:15px 13px 7px;color:#245775;background:#fff;border-bottom:1px solid #d8e0e3;font-size:.82rem}.story-open{font-family:inherit}.story-title-button,.story-summary-button{display:block;width:100%;padding:0;border:0;background:none;color:inherit;text-align:left;cursor:pointer;line-height:inherit}.story-title-button{color:#8f2b0c;font-weight:600}.story-summary-button{text-decoration:underline;text-decoration-color:#d8b8a8;text-underline-offset:3px}.story-title-button:hover,.story-summary-button:hover{color:#07547a}.chapter-view ol{margin:0;padding:0;list-style:none;border-top:2px solid #b9683d}.chapter-view li{border-bottom:1px solid #ded8cf}.chapter-story{display:block;width:100%;padding:13px 6px;border:0;background:#fff;text-align:left;cursor:pointer}.chapter-story>span{display:block;color:#8f2b0c;font-size:.95rem;font-weight:600}.chapter-story>small{display:block;margin-top:4px;color:#4d463e;font-size:.8rem;line-height:1.65}.chapter-story:hover{background:#fcfaf6}.story-empty{padding:30px 0;color:#6d6258!important;text-align:center}.story-dialog{width:min(780px,calc(100% - 32px));max-height:min(86vh,900px);padding:0;border:1px solid #d8d0c5;border-radius:6px;background:#fff;color:#222;box-shadow:0 28px 80px rgba(42,31,23,.25)}.story-dialog::backdrop{background:rgba(35,28,23,.48);backdrop-filter:blur(2px)}.story-dialog-inner{position:relative;padding:38px clamp(24px,6vw,58px) 46px}.story-dialog-close{position:sticky;top:0;z-index:2;float:right;margin:-22px -38px 8px 16px;padding:7px 10px;border:1px solid #d8d0c5;border-radius:3px;background:#fff;color:#8f2b0c;cursor:pointer;font-size:.76rem}.story-dialog-reference{margin:0 0 7px;color:#6e655c;font-size:.78rem}.story-dialog-reference span{margin-right:8px;color:#9c2d09}.story-dialog h3{clear:none;margin:0 0 12px;color:#8f2b0c;font-size:1.7rem;font-weight:500;line-height:1.35}.story-dialog-note{margin:0 0 25px;padding:8px 11px;border-left:2px solid #c87845;background:#fff8ef;color:#675d54;font-size:.76rem;line-height:1.55}.story-detail-section{margin:24px 0}.story-detail-section h4,.story-source h4{margin:0 0 5px;color:#9c2d09;font-size:.86rem;font-weight:600}.story-detail-section p,.story-source p{margin:0;color:#302b27;font-size:1rem;line-height:1.85}.story-detail-section.memory{padding:13px 15px;background:#f8f4ed;border-top:1px solid #ded5c9}.story-source{margin-top:28px;padding-top:18px;border-top:1px solid #ded8cf}.story-source a{color:#07547a;text-underline-offset:3px}.story-source a+a:before{content:" · ";color:#81766b}.story-dialog[open]{animation:story-dialog-in .16s ease-out}@keyframes story-dialog-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.depth-mark{display:inline-block;margin-right:6px;color:#b86133;font-family:Georgia,serif;font-size:.95em;line-height:1}.lesson-open:focus-visible,.lesson-dialog-close:focus-visible,#lesson-search:focus-visible{outline:3px solid #245775;outline-offset:2px}.detailed-lessons{padding-top:0}.detailed-lessons-header{padding-bottom:20px;border-bottom:1px solid #ded8cf}.detailed-lessons-header>p:first-child{margin:0;color:#a8320c;font-size:.76rem}.content .detailed-lessons-header h2{margin:2px 0 8px;color:#8f2b0c}.detailed-lessons-header>p:last-child{margin:0;color:#5e554d;font-size:1rem}.content .detailed-lessons>h3{margin:8px 0 12px;padding:0;color:#222;font-size:1.15rem}.lesson-search-label{display:block;width:min(390px,100%);margin:18px 0 8px}#lesson-search{width:100%;padding:8px 10px;border:1px solid #d8d4cb;border-radius:3px;background:#fff;color:#222;font-size:.8rem}.lesson-list{border-top:2px solid #b9683d}.lesson-entry{scroll-margin-top:82px;border-bottom:1px solid #ded8cf}.lesson-open{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:14px;align-items:start;width:100%;padding:20px 8px;border:0;background:#fff;color:#28231f;text-align:left;cursor:pointer}.lesson-open:hover{background:#fcfaf6}.lesson-mark{padding-top:2px;color:#a8320c;font-family:Georgia,serif;font-size:1.05rem}.lesson-card-body{display:grid;gap:3px}.lesson-card-kicker{color:#a8320c;font-size:.69rem;font-weight:600;letter-spacing:.04em}.lesson-card-title{color:#222;font-size:1.12rem;font-weight:600;line-height:1.5}.lesson-card-reference{color:#736960;font-size:.75rem}.lesson-card-voices{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:5px;color:#544d46;font-size:.78rem}.lesson-card-voices b,.lesson-card-teaching b{margin-right:5px;color:#9c2d09;font-weight:600}.lesson-card-teaching{margin-top:8px;color:#2f2a26;font-size:.88rem;line-height:1.7}.lesson-card-arrow{align-self:center;color:#8f2b0c;font-size:.74rem}.lesson-empty{padding:30px 0;color:#6d6258!important;text-align:center}.lesson-dialog{width:min(940px,calc(100% - 32px));max-height:92vh;padding:0;border:1px solid #d8d0c5;border-radius:6px;background:#fff;color:#222;box-shadow:0 28px 80px rgba(42,31,23,.28)}.lesson-dialog::backdrop{background:rgba(35,28,23,.52);backdrop-filter:blur(2px)}.lesson-dialog-shell{position:relative;padding:38px clamp(24px,6vw,70px) 58px}.lesson-dialog-close{position:sticky;top:0;z-index:3;float:right;margin:-22px -48px 10px 18px;padding:7px 10px;border:1px solid #d8d0c5;border-radius:3px;background:#fff;color:#8f2b0c;cursor:pointer;font-size:.76rem}.lesson-reading{max-width:760px;margin:auto}.lesson-reading-header{padding-bottom:24px;border-bottom:1px solid #d8d0c5}.lesson-reading-header>p{margin:0 0 5px;color:#a8320c;font-size:.76rem}.content .lesson-reading-header h3{margin:0 0 17px;padding:0;color:#8f2b0c;font-size:clamp(1.7rem,3vw,2.35rem);line-height:1.4}.lesson-reading-header dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin:0;border-top:1px solid #e4dfd7;border-bottom:1px solid #e4dfd7}.lesson-reading-header dl div{display:grid;grid-template-columns:56px 1fr;gap:8px;padding:7px 9px;border-bottom:1px solid #eee9e1}.lesson-reading-header dl div:nth-last-child(-n+2){border-bottom:0}.lesson-reading-header dt{color:#9c2d09;font-size:.72rem;font-weight:600}.lesson-reading-header dd{margin:0;color:#4a443d;font-size:.78rem}.content .lesson-reading h3{margin:40px 0 11px;padding-top:0;color:#8f2b0c;font-size:1.42rem}.content .lesson-reading h4{margin:28px 0 8px;color:#333;font-size:1.08rem}.content .lesson-reading p{margin:10px 0;color:#2d2925;font-size:1rem;line-height:1.9}.content .lesson-reading blockquote{margin:24px 0;padding:30px 32px 21px 48px;font-size:1.08rem}.content .lesson-reading blockquote:before{left:16px;font-size:4.3rem}.lesson-reading .table-wrap{margin:20px 0}.lesson-reading table{min-width:600px;font-size:.85rem}.lesson-reading th,.lesson-reading td{padding:9px 11px}.lesson-reading ol,.lesson-reading ul{color:#2d2925;font-size:.98rem;line-height:1.85}.lesson-summary,.lesson-teaching,.lesson-application,.lesson-explanation{padding:10px 13px;border-left:2px solid #c87845;background:#fffaf3}.lesson-teaching{border-left-color:#245775;background:#f7fafb}.lesson-dialog[open]{animation:story-dialog-in .16s ease-out}
@media(max-width:850px){body{font-size:16px}.page.active{display:block}.side{position:relative;top:auto;height:auto;display:block;overflow:visible;padding:12px 18px;border-right:0;border-bottom:1px solid var(--line);background:#fbfaf7}.desktop-toc{display:none}.mobile-toc{display:block}.side a{border:0;border-bottom:1px solid #e5e1da;font-size:.82rem}main{padding:32px 20px 68px}.hero{padding:30px 20px 24px}.tabs{gap:22px}.content h3{margin-top:46px}.content p{font-size:1rem;line-height:1.9}.content blockquote{padding:40px 24px 24px 42px;font-size:1.05rem}.content blockquote:before{left:14px;font-size:4.5rem}}
@media(max-width:700px){.editorial-map{margin:30px -4px;padding:24px 14px}.editorial-map figcaption strong{font-size:1.18rem}.dialogue-pair{grid-template-columns:1fr;gap:8px}.relation-line{width:120px;margin:auto;transform:rotate(90deg)}.branch-grid{grid-template-columns:1fr}.branch-card:before{display:none}.family-split,.family-split.three{grid-template-columns:1fr;gap:26px;margin-top:28px;padding-top:0}.family-split:before,.family-split:after,.family-branch:before{display:none}.siblings{grid-template-columns:1fr}.level-three{grid-template-columns:1fr;gap:18px;padding-top:0}.level-three:before,.level-three>div:before{display:none}.map-node{width:min(100%,280px);margin:auto}.map-legend{align-items:flex-start;flex-direction:column}.diagram-source pre{font-size:.72rem}.pandava-map .family-split>div:not(.family-branch){margin-bottom:4px}.verse-entry{display:block;padding-bottom:34px;margin-bottom:30px}.verse-rail{display:flex;align-items:center;gap:9px;margin-bottom:10px;padding:0;border:0;text-align:left}.verse-rail span{font-size:1.08rem}.verse-rail small{margin:0}.verse-header{display:block;margin-bottom:12px}.verse-header h3{font-size:1.35rem}.verse-reference{margin-top:4px}.verse-context{grid-template-columns:1fr 1fr}.verse-context .context-wide{grid-column:1/-1;border-top:1px solid #e2dcd3}.verse-context>div:nth-child(2){border-right:0}.verse-context>div{padding:7px 8px}.verse-text{padding:18px 20px;font-size:1.05rem}}
@media(max-width:700px){.skandha-overview ol{grid-template-columns:1fr}.story-toolbar{top:48px;display:block}.story-view-toggle{margin-bottom:8px}.story-search-label{display:block;width:100%}.story-table,.story-table tbody,.story-table tr,.story-table td{display:block;width:100%}.story-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.story-table .story-group-row{display:block}.story-table .story-group-row th{display:block}.story-table .story-row{padding:13px 0;border-bottom:1px solid #ded8cf}.story-table .story-row td{display:grid;grid-template-columns:100px 1fr;gap:10px;padding:5px 8px;border:0}.story-table .story-row td:before{content:attr(data-label);color:#9c2d09;font-size:.7rem;font-weight:600}.story-table .story-row td>*{min-width:0}.story-title-button,.story-summary-button{font-size:.9rem}.story-dialog,.lesson-dialog{width:100%;max-width:none;max-height:100%;height:100%;border:0;border-radius:0}.story-dialog-inner,.lesson-dialog-shell{min-height:100%;padding:28px 20px 38px}.story-dialog-close,.lesson-dialog-close{margin:-16px 0 8px 12px}.story-dialog h3{font-size:1.45rem}.story-detail-section p{font-size:.95rem}.story-side-nav{grid-template-columns:repeat(3,1fr)}.story-side-nav button{text-align:center;border-left:0;border-bottom:2px solid transparent}.story-side-nav button.active{border-left:0;border-bottom-color:#a8320c}.lesson-open{grid-template-columns:22px minmax(0,1fr);gap:9px;padding:17px 3px}.lesson-card-arrow{display:none}.lesson-card-title{font-size:1.02rem}.lesson-reading-header dl{grid-template-columns:1fr}.lesson-reading-header dl div:nth-last-child(2){border-bottom:1px solid #eee9e1}.content .lesson-reading h3{font-size:1.28rem}.content .lesson-reading p{font-size:.95rem}.lesson-reading table{min-width:520px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.skip-link{transition:none}.story-dialog[open],.lesson-dialog[open]{animation:none}}
@media print{@page{margin:18mm 16mm}body{background:#fff!important;color:#000;font-size:11pt}.skip-link,.tabs,.side{display:none!important}.hero{padding:0 0 8mm;border:0;background:#fff}.eyebrow{font-size:9pt}.hero h1{font-size:26pt}.page{display:none!important}.page.active{display:block!important;max-width:none}.page.active main{padding:0;background:#fff}.content{max-width:none}.content h2,.content h3,.content h4{color:#000;break-after:avoid}.content p,.content li,.content td{color:#111}.content blockquote,.diagram-wrap,.editorial-map,.table-wrap,table,tr{break-inside:avoid;box-shadow:none}.content blockquote{border:1px solid #aaa;color:#111;background:#fff}.diagram-wrap,.editorial-map,.table-wrap{overflow:visible;border-color:#aaa;background:#fff}.diagram{min-width:0;white-space:pre-wrap;color:#111;background:#fff}.diagram-source{display:none}.map-node,.branch-card{background:#fff}table{min-width:0;font-size:9pt}th{color:#000;background:#eee}footer{padding:8mm 0 0;background:#fff;color:#444}}
</style>
<style>.article-link{text-decoration:none}.article-link:hover .lesson-card-title{color:#8f2b0c}</style>
<style>
.life-philosophy-page{max-width:1120px;margin:0 auto}
.life-philosophy-header{margin:18px 0 28px;padding:34px clamp(20px,4vw,54px) 26px;border:1px solid #e2ded6;border-radius:16px;background:#fcfaf5}
.life-philosophy-kicker{margin:0 0 8px!important;color:#a8320c!important;font-size:.78rem!important;letter-spacing:.025em}
.content .life-philosophy-header h2{margin:0;color:#28231f;font-size:clamp(1.7rem,3vw,2.25rem);line-height:1.4;text-align:center}
.life-philosophy-subtitle{margin:4px 0 0!important;color:#554b42!important;font-size:1.12rem!important;text-align:center}
.life-philosophy-deck{margin:2px 0 0!important;color:#74695e!important;font-size:.95rem!important;text-align:center}
.life-philosophy-intro{max-width:980px;margin:20px auto 0;padding-top:16px;border-top:1px solid #e2ded6}
.life-philosophy-intro p{margin:0!important;color:#37312b;font-size:1rem;line-height:1.85}
.life-philosophy-page .detailed-lessons{padding:0 clamp(0px,1vw,12px)}
.life-philosophy-page .lesson-list{display:grid;gap:11px;border:0}
.life-philosophy-page .lesson-entry{overflow:hidden;border:1px solid #e2ded6;border-radius:13px;background:#fff}
.life-philosophy-page .lesson-open{padding:14px 17px}
.life-philosophy-page .lesson-card-kicker{font-size:.75rem;letter-spacing:0}
.life-philosophy-page .lesson-card-title{font-size:1.08rem}
@media(max-width:850px){.life-philosophy-header{margin:10px 0 22px;padding:26px 20px 21px}.life-philosophy-subtitle{font-size:1.02rem!important}.life-philosophy-intro{margin-top:16px;padding-top:13px}.life-philosophy-page .detailed-lessons{padding:0}.life-philosophy-page .lesson-open{padding:13px 12px}}
</style>
<style>
.content[data-content="0"]{max-width:50rem}
.content .intro-heading{
  margin:2.2rem 0 .85rem;padding:.5rem .8rem;
  border-inline-start:3px solid #a8320c;background:#faf4ec;
  color:#763014;font-size:clamp(1.05rem,1rem + .45vw,1.32rem);line-height:1.55;
}
.content .intro-heading#intro-section-97t35y{
  border-inline-start-color:#637753;background:#f2f5ee;color:#3f5134;
}
.content .intro-heading#intro-section-1gvwds3{
  border-inline-start-color:#497285;background:#edf3f5;color:#234b5e;
}
.content .intro-lead{
  margin:0 0 1.25rem;padding:clamp(.9rem,2.5vw,1.35rem);
  border-block:1px solid #e3d5c6;background:#fcfaf5;font-size:1.08rem;
}
.content .intro-note,.content .intro-verse{
  margin:1rem 0;padding:.75rem clamp(.8rem,2.5vw,1.2rem);
  border:1px solid #e4d7c8;border-radius:5px;background:#fcf8f1;
}
.content .intro-question{border-color:#cddce2;background:#f1f6f8;color:#234b5e}
.content .intro-question strong,.content .intro-verse strong{color:inherit}
.content .intro-verse{border:0;border-inline-start:2px solid #497285;background:#f7f9fa;color:#234b5e}
.intro-verse em{font-size:.84rem;font-style:normal}
.content[data-content="0"] > h2:first-child{
  margin:0 0 .35rem;padding:0 0 1rem;border-bottom:1px solid #ddd2c2;
  color:#8f2b0c;font-size:clamp(2rem,4vw,3rem);line-height:1.3;
}
.content[data-content="0"] > h4:first-of-type{
  margin:.55rem 0 1.35rem;color:#6c6256;font-size:clamp(1.12rem,1rem + .6vw,1.45rem);font-weight:500;line-height:1.55;
}
.content[data-content="0"] .porichoy-meta{
  display:table;max-width:100%;margin:.45rem 0!important;padding:.34rem .72rem;
  border-inline-start:2px solid #bd6b40;background:#f5f0e8;color:#665c52!important;font-size:.88rem;line-height:1.65;
}
.content[data-content="0"] .porichoy-meta strong{color:#923713}
.content[data-content="0"] h3{
  margin:2.4rem 0 .9rem;padding:.58rem .85rem;border-inline-start:3px solid #a8320c;
  background:#faf4ec;color:#763014;font-size:clamp(1.32rem,1.1rem + .65vw,1.7rem);line-height:1.55;
}
.content[data-content="0"] h4{
  margin:1.8rem 0 .65rem;padding-bottom:.35rem;border-bottom:1px solid #e9dfd2;
  color:#315e63;font-size:1.15rem;line-height:1.55;
}
.content[data-content="0"] .table-wrap{border-color:#ded2c2;border-radius:5px;background:#fffdf9;box-shadow:0 8px 24px rgba(74,49,31,.06)}
.content[data-content="0"] .table-wrap table{min-width:700px;background:transparent}
.content[data-content="0"] .table-wrap th{color:#763014;background:#f3ece1}
.content[data-content="0"] .table-wrap td{color:#34302c}
.content[data-content="0"] ol.bn-numbered-list{list-style-type:bengali-numerals}
/* পরিচয়: একটানা প্রবন্ধে পাঠের ছন্দ ও বিষয়ভিত্তিক দৃশ্যভেদ */
.content[data-content="0"] .porichoy-chapter-heading{
  display:grid;grid-template-columns:2.15rem minmax(0,1fr);align-items:start;gap:.65rem;
  margin:2.25rem 0 .85rem;padding:.25rem 0 .6rem;border:0;border-bottom:1px solid #e2d7c9;
  background:transparent;color:#763014;font-size:clamp(1.25rem,1.08rem + .52vw,1.55rem);line-height:1.5;
}
.content[data-content="0"] .porichoy-plain-heading{display:block;grid-template-columns:none;}
.content[data-content="0"] .porichoy-section-number{
  display:inline-grid;place-items:center;min-height:1.8rem;margin-top:.12rem;padding:0 .35rem;
  border-radius:3px;background:#f4e9db;color:#a8320c;font-size:.82em;font-weight:600;
}
.content[data-content="0"] .porichoy-subheading{
  margin:1.45rem 0 .55rem;padding:0 0 0 .7rem;border:0;border-inline-start:2px solid #8ba4a2;
  background:transparent;color:#315e63;font-size:1.05rem;font-weight:600;line-height:1.55;
}
.content[data-content="0"] .porichoy-reflection-heading{border-inline-start-color:#bd6b40;color:#8a3718}
.content[data-content="0"] p.porichoy-question{
  margin:1.25rem 0 .35rem;padding:.55rem .8rem;border-inline-start:3px solid #bd6b40;
  border-radius:0 4px 4px 0;background:#fbf5ec;color:#713516;font-size:1.02em;
}
.content[data-content="0"] p.porichoy-question + p{margin-top:.25rem;padding-inline-start:.9rem;border-inline-start:1px solid #e4d7c8}
.content[data-content="0"] p.porichoy-flow-step{margin:1rem 0 .35rem;padding:.6rem .8rem;border:1px solid #d8e1e2;border-radius:4px;background:#f4f8f8;color:#244f60}
.content[data-content="0"] p.porichoy-definition{margin:.4rem 0;padding:.5rem .8rem;border-bottom:1px solid #e9e2d9;background:#fcfaf6}
.content[data-content="0"] .porichoy-definition strong{color:#8f3d1d}
.content[data-content="0"] blockquote.porichoy-scripture-quote{
  margin:1.1rem 0 1.3rem;padding:1rem clamp(1rem,3vw,1.5rem);border:1px solid #d5e0e2;
  border-inline-start:3px solid #497285;border-radius:4px;background:#f4f8f8;color:#17556f;
}
.content[data-content="0"] blockquote.porichoy-scripture-quote::before{display:none}
.content[data-content="0"] p.porichoy-thesis{margin:1.4rem 0;padding:1rem 1.15rem;border-inline-start:3px solid #497285;background:#f1f6f7;color:#234b5e;font-size:1.08em;font-weight:500}
.content[data-content="0"] p.editorial-flow-paragraph{margin:.72rem 0 1rem;line-height:1.9}
.content[data-content="0"] ol.porichoy-takeaways{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem 1rem;margin:1rem 0 1.5rem;padding:0;list-style:none;counter-reset:porichoy-takeaway}
.content[data-content="0"] ol.porichoy-takeaways li{position:relative;min-height:3.1rem;margin:0;padding:.72rem .85rem .72rem 2.8rem;border:1px solid #e6ddd1;border-radius:4px;background:#fcfaf6;counter-increment:porichoy-takeaway}
.content[data-content="0"] ol.porichoy-takeaways li::before{content:counter(porichoy-takeaway,"bengali-numerals");position:absolute;inset-inline-start:.75rem;top:.68rem;color:#a8320c;font-weight:600}
@media(max-width:640px){
  .content[data-content="0"] .porichoy-chapter-heading{grid-template-columns:1.8rem minmax(0,1fr);gap:.5rem;margin-top:1.8rem;font-size:1.22rem}
  .content[data-content="0"] ol.porichoy-takeaways{grid-template-columns:1fr;gap:.4rem}
}
@counter-style bengali-numerals{system:numeric;symbols:"০" "১" "২" "৩" "৪" "৫" "৬" "৭" "৮" "৯";suffix:". "}
@media print{
  .content .intro-lead,.content .intro-note,.content .intro-verse{background:#fff;break-inside:avoid}
  .content .intro-heading{background:#fff}
  .content[data-content="0"] h3,.content[data-content="0"] h4{break-after:avoid;background:#fff}
}
</style>
<style>
.content .skandha-stop{margin-top:2.4rem;padding-top:.8rem;border-top:1px solid var(--line)}
.skandha-stop span{display:block;margin-bottom:.3rem;color:#8f2b0c;font-size:.78rem;font-weight:600}
.skandha-links a{color:#713009;text-underline-offset:.2em;text-decoration-color:#bc9b85}
.skandha-links a:focus-visible{outline:3px solid #245775;outline-offset:3px}
.content .skandha-index{margin:1.25rem 0 2rem;padding-block:.75rem;border-block:1px solid var(--line)}
.content .skandha-index p{margin:0 0 .5rem;color:#8f2b0c;font-weight:600}
.content .skandha-index ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:0 1rem;margin:0;padding:0;list-style:none}
.content .skandha-index li{margin:0}
.skandha-index a{display:flex;gap:.75rem;align-items:baseline;padding:.32rem 0;font-size:.9rem}
.skandha-index a span{flex:none;font-size:.75rem;color:#65564b}
.skandha-step{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.75rem;margin-block:1.1rem .4rem;font-size:.88rem}
.skandha-step a:last-child{margin-inline-start:auto}
/* চরিত্র ও সময়রেখা — সাইটের ইট-লাল, কাগজ-সাদা ও নীলচে-সবুজ editorial palette */
#page-3 .side-title,#page-3 .mobile-toc summary{color:#a8320c}
#page-3 .side a:hover,#page-3 .side a.active{color:#9c2d09;background:#f1ede5;border-left-color:#a8320c}
#page-3 .content[data-content="3"]{--timeline-rust:#a8320c;--timeline-paper:#fcfaf5;--timeline-warm:#f4efe7;--timeline-blue:#245775;--timeline-line:#ddd8ce;--timeline-ink:#282828}
#page-3 .content[data-content="3"] h2{padding:.25rem .55rem;border-inline-start:2px solid var(--timeline-rust);border-radius:0;background:var(--timeline-paper);color:#9c2d09}
#page-3 .content[data-content="3"] h3{color:#9c2d09}
#page-3 .content[data-content="3"] h4{color:var(--timeline-blue)}
#page-3 .content[data-content="3"] p,#page-3 .content[data-content="3"] li{color:var(--timeline-ink)}
#page-3 .content[data-content="3"] strong{color:#111}
#page-3 .content[data-content="3"] blockquote{border-color:#e2ded6;background:#fbfaf7;color:#07547a}
#page-3 .content[data-content="3"] blockquote:before{color:#d17b35}
#page-3 .content[data-content="3"] .editorial-map{border:0;border-block:1px solid #d6cdbf;border-radius:0;background:linear-gradient(90deg,#fff 0,#fcfaf5 12%,#fcfaf5 88%,#fff 100%);box-shadow:none}
#page-3 .content[data-content="3"] .editorial-map figcaption strong{color:#9c2d09}
#page-3 .content[data-content="3"] .editorial-map figcaption span{color:#74695e}
#page-3 .content[data-content="3"] .map-node{border:0;border-bottom:2px solid #bc6a3f;border-radius:0;background:#fff;box-shadow:none}
#page-3 .content[data-content="3"] .map-node strong{color:#28221d}
#page-3 .content[data-content="3"] .map-node small{color:#766c62}
#page-3 .content[data-content="3"] .map-node.root-node{border:1px solid #d8cbb9;border-bottom:3px solid #a8320c;border-radius:3px;background:#fffdf8}
#page-3 .content[data-content="3"] .map-node.divine{border-bottom-color:var(--timeline-blue);background:#f7f9fa}
#page-3 .content[data-content="3"] .map-node.divine strong{color:var(--timeline-blue)}
#page-3 .content[data-content="3"] .map-arrow{color:#a84b26}
#page-3 .content[data-content="3"] .branch-card{border:0;border-top:2px solid #bc6a3f;border-radius:0;background:#fff}
#page-3 .content[data-content="3"] .branch-card:nth-child(2n){border-top-color:#c79255;background:#fffdf8}
#page-3 .content[data-content="3"] .branch-card.divine{border-top-color:var(--timeline-blue);background:#f7f9fa}
#page-3 .content[data-content="3"] .nested-label{border-radius:2px;background:#f5f0e8;color:#685d51}
#page-3 .content[data-content="3"] .map-note{color:#6e6459!important}
#page-3 .content[data-content="3"] .table-wrap{border-color:#ddd8ce;border-radius:5px;box-shadow:none}
#page-3 .content[data-content="3"] table{background:#fff}
#page-3 .content[data-content="3"] th{color:#8f2b0c;background:#f4efe7;border-color:#ddd8ce}
#page-3 .content[data-content="3"] td{color:#303030;border-color:#e5e1da}
#page-3 .content[data-content="3"] tbody tr:nth-child(even){background:#fbfaf7}
#page-3 .content[data-content="3"] tbody tr:hover{background:#fff8ef}
#page-3 .content[data-content="3"] .diagram-source{border-color:#d2c7b8}
#page-3 .content[data-content="3"] .diagram-source summary{color:#8e3215}
@media(max-width:700px){#page-3 .content[data-content="3"] h2{padding:.22rem .45rem}#page-3 .content[data-content="3"] .editorial-map{background:#fcfaf5}}
@media print{#page-3 .content[data-content="3"] h2,#page-3 .content[data-content="3"] .editorial-map,#page-3 .content[data-content="3"] .branch-card,#page-3 .content[data-content="3"] tbody tr:nth-child(even){background:#fff;box-shadow:none}}
/* সব ট্যাবের editorial map — desktop সম্পর্ক অক্ষুণ্ণ রেখে ছোট পর্দায় পরিষ্কার vertical flow */
.editorial-map{min-width:0;max-width:100%}
.editorial-map .map-node,.editorial-map .branch-card{min-width:0;overflow-wrap:anywhere}
.editorial-map .text-map>pre,.editorial-map .diagram-source pre{max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain;-webkit-overflow-scrolling:touch}
@media(max-width:700px){
  .editorial-map{margin:24px 0;padding:20px 12px}
  .editorial-map figcaption{margin-bottom:18px}
  .editorial-map .map-node{width:min(100%,28rem);min-width:0;margin-inline:auto;padding:10px 12px}
  .editorial-map .map-node small{font-size:.78rem}
  .editorial-map .map-chain{width:min(100%,28rem);max-width:100%}
  .editorial-map .dialogue-pair{grid-template-columns:minmax(0,1fr);width:min(100%,28rem);max-width:100%;gap:0}
  .editorial-map .dialogue-pair>div{min-width:0}
  .editorial-map .relation-line{width:100%;max-width:9rem;margin:0 auto;flex-direction:column;gap:0;transform:none}
  .editorial-map .relation-line:before,.editorial-map .relation-line:after{width:0;height:9px;flex:none;border:0;border-left:1px solid #b8704d}
  .editorial-map .relation-line span{padding:2px 7px;background:#fcfaf5;font-size:.8rem;line-height:1.4}
  .editorial-map .relation-line b{font-size:0;line-height:1}
  .editorial-map .relation-line b:after{content:"↓";font-size:1rem}
  .editorial-map .nested-label{max-width:100%;margin:22px auto 10px;white-space:normal;text-align:center}
  .editorial-map .nested-label:before{height:18px}
  .editorial-map .branch-grid{grid-template-columns:minmax(0,1fr);gap:8px}
  .editorial-map .branch-grid:before{content:"↓";display:block;grid-column:1;text-align:center;color:#a84b26;line-height:1.4}
  .editorial-map .branch-card{padding:11px 13px;border:1px solid #e2ded6;border-left:2px solid #bc6a3f;background:#fcfaf5;text-align:left}
  .editorial-map .branch-card:nth-child(2n){border-top:1px solid #e2ded6;background:#fcfaf5}
  .editorial-map .branch-card.divine{border-left-color:#245775;background:#f7f9fa}
  .editorial-map .branch-card:before{display:none}
  .editorial-map .branch-card b{font-size:.95rem}
  .editorial-map .branch-card span{display:inline-block;margin:5px 10px 0 0;font-size:.82rem}
  .editorial-map.family-map{align-items:stretch}
  .editorial-map.family-map>.map-node{align-self:center}
  .editorial-map .family-split,.editorial-map .family-split.three{grid-template-columns:minmax(0,1fr);width:100%;gap:8px;margin-top:12px;padding-top:0}
  .editorial-map .family-split:before{content:"↓";position:static;left:auto;right:auto;top:auto;display:block;grid-column:1;width:auto;height:auto;border:0;text-align:center;color:#a84b26;line-height:1.4}
  .editorial-map .family-split:after,.editorial-map .family-branch:before{display:none}
  .editorial-map .family-branch{min-width:0;align-items:stretch;padding:8px 0 8px 12px;border-left:2px solid #c79255}
  .editorial-map .family-branch>.map-node{width:100%;max-width:28rem}
  .editorial-map .siblings{grid-template-columns:minmax(0,1fr);gap:0}
  .editorial-map .siblings:before{content:"↓";display:block;grid-column:1;text-align:center;color:#a84b26;line-height:1.4}
  .editorial-map .cosmos-level.level-two{flex-direction:column;gap:0}
  .editorial-map .level-three{grid-template-columns:minmax(0,1fr);gap:8px;margin-top:12px;padding-top:0}
  .editorial-map .level-three:before{content:"↓";position:static;left:auto;right:auto;top:auto;display:block;grid-column:1;width:auto;height:auto;border:0;text-align:center;color:#a84b26;line-height:1.4}
  .editorial-map .level-three>div:before{display:none}
  .editorial-map .level-three>div{min-width:0;padding:8px 0 8px 12px;border-left:2px solid #c79255}
  .editorial-map .map-legend{gap:8px;margin-top:16px;font-size:.8rem}
  .editorial-map .map-arrow{height:25px;line-height:25px}
  .editorial-map .text-map>pre,.editorial-map .diagram-source pre{max-width:100%;padding:14px 10px;font-size:.78rem}
  #page-3 .content[data-content="3"] .editorial-map .branch-card{border:1px solid #e2ded6;border-left:2px solid #bc6a3f;border-top:1px solid #e2ded6;background:#fcfaf5}
  #page-3 .content[data-content="3"] .editorial-map .branch-card.divine{border-left-color:#245775;background:#f7f9fa}
}
/* স্থানিক মানচিত্র: মোবাইলে desktop বিন্যাস fit করে দেখায় */
.diagram-preview{width:100%;min-width:0}
.diagram-canvas{width:100%;transform-origin:top left}
.diagram-canvas.family-map{display:flex;flex-direction:column;align-items:center}
.diagram-expand{display:none}
.diagram-viewer{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#f8f6f1;color:#28221d}
.diagram-viewer::backdrop{background:rgba(35,28,23,.55)}
.diagram-viewer-shell{display:grid;grid-template-rows:auto minmax(0,1fr);width:100%;height:100%}
.diagram-viewer-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-bottom:1px solid #ddd8ce;background:#fff}
.diagram-viewer-title{margin:0;color:#8f2b0c;font-size:1rem;font-weight:600}
.diagram-viewer-controls{display:flex;align-items:center;gap:6px}
.diagram-viewer-controls button{min-width:42px;min-height:42px;padding:7px 10px;border:1px solid #d8d0c5;border-radius:4px;background:#fff;color:#713009;cursor:pointer;font:inherit}
.diagram-viewer-controls button:hover{background:#f4efe7}
.diagram-viewer-controls button:focus-visible,.diagram-expand:focus-visible{outline:3px solid #245775;outline-offset:2px}
.diagram-viewer-viewport{position:relative;min-width:0;min-height:0;overflow:hidden;overscroll-behavior:contain;touch-action:none;background:#fcfaf5;cursor:grab}
.diagram-viewer-viewport:active{cursor:grabbing}
.diagram-viewer-stage{position:absolute;inset:0}
.diagram-viewer-stage>.diagram-canvas{position:absolute;top:0;left:0;transform-origin:top left}
@media(max-width:700px){
  .diagram-expand{display:flex;align-items:center;justify-content:center;width:max-content;min-height:40px;margin:0 auto 12px;padding:6px 11px;border:1px solid #d8cbb9;border-radius:3px;background:#fffdf8;color:#8f2b0c;font-size:.82rem;cursor:pointer}
  .diagram-preview{overflow:hidden}
  .diagram-canvas{width:720px}
  .diagram-canvas .map-node{width:auto;min-width:150px;margin:0}
  .diagram-canvas .map-chain .map-node{width:100%;max-width:360px}
  .diagram-canvas .dialogue-pair{grid-template-columns:minmax(170px,1fr) minmax(100px,150px) minmax(170px,1fr);gap:14px;width:100%;max-width:720px;margin-inline:auto}
  .diagram-canvas .dialogue-pair>div{min-width:0}
  .diagram-canvas .dialogue-pair>div .map-node{width:100%;margin:0}
  .diagram-canvas .dialogue-pair.siblings{grid-template-columns:repeat(2,minmax(180px,1fr));gap:26px}
  .diagram-canvas .relation-line{width:auto;max-width:none;margin:0;flex-direction:row;transform:none}
  .diagram-canvas .relation-line:before,.diagram-canvas .relation-line:after{width:auto;height:auto;flex:1;border:0;border-top:1px solid #b8704d}
  .diagram-canvas .relation-line span{padding:0 8px;background:transparent;font-size:.72rem}
  .diagram-canvas .relation-line b{font-size:1rem}
  .diagram-canvas .relation-line b:after{content:none}
  .diagram-canvas .nested-label{width:max-content;max-width:100%;margin:36px auto 22px;white-space:nowrap;text-align:center}
  .diagram-canvas .nested-label:before{height:36px}
  .diagram-canvas .branch-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .diagram-canvas .branch-card{padding:15px 14px;border:0;border-top:2px solid #bc6a3f;background:#fff;text-align:center}
  .diagram-canvas .branch-card:nth-child(2n){border-top:2px solid #c79255;background:#fffdf8}
  .diagram-canvas .branch-card.divine{border-top:2px solid #245775;background:#f7f9fa}
  .diagram-canvas .branch-card:before{display:block}
  .diagram-canvas .branch-card b{font-size:.88rem}
  .diagram-canvas .branch-card span{display:block;margin:7px 0 0;font-size:.73rem}
  .diagram-canvas .map-legend{align-items:center;flex-direction:row;justify-content:center;gap:16px;margin-top:24px;font-size:.68rem}
  .diagram-canvas .map-arrow{height:31px;line-height:31px}
  .diagram-canvas.family-map{align-items:center;justify-content:flex-start}
  .diagram-canvas.family-map>.map-node{align-self:center}
  .diagram-canvas .family-split,.diagram-canvas .family-split.three{grid-template-columns:repeat(2,minmax(190px,1fr));width:min(680px,100%);gap:80px;margin-top:42px;padding-top:24px}
  .diagram-canvas .family-split:before{content:"";position:absolute;left:25%;right:25%;top:0;display:block;width:auto;height:auto;border-top:1px solid #bca98f;border-left:0;text-align:initial;color:inherit;line-height:normal}
  .diagram-canvas .family-split:after{content:"";position:absolute;left:50%;top:-42px;display:block;height:42px;border-left:1px solid #bca98f}
  .diagram-canvas .family-branch{min-width:0;align-items:center;padding:0;border:0}
  .diagram-canvas .family-branch:before{display:block;top:-24px;height:24px;border-left:1px solid #bca98f}
  .diagram-canvas .family-branch>.map-node{width:auto;max-width:none}
  .diagram-canvas .family-split.three{grid-template-columns:repeat(3,minmax(140px,1fr));gap:25px}
  .diagram-canvas .family-split.three:before{left:16.66%;right:16.66%}
  .diagram-canvas .siblings{margin-top:0}
  .diagram-canvas .cosmos-level{display:flex;justify-content:center;align-items:center}
  .diagram-canvas .cosmos-level.level-two{flex-direction:row;gap:0}
  .diagram-canvas .level-three{grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:30px;padding-top:25px}
  .diagram-canvas .level-three:before{content:"";position:absolute;left:16.66%;right:16.66%;top:0;display:block;width:auto;height:auto;border-top:1px solid #bca98f;border-left:0;text-align:initial;color:inherit;line-height:normal}
  .diagram-canvas .level-three>div{min-width:0;padding:0;border:0}
  .diagram-canvas .level-three>div:before{display:block;left:50%;bottom:100%;height:25px;border-left:1px solid #bca98f}
  .diagram-canvas .map-note{max-width:680px;margin:28px auto 0!important}
  .diagram-viewer-toolbar{align-items:center;flex-wrap:wrap;padding:8px;gap:6px}
  .diagram-viewer-title{flex:1 0 100%;text-align:center;font-size:.84rem}
  .diagram-viewer-controls{justify-content:center;width:100%;gap:4px}
  .diagram-viewer-controls button{min-width:38px;min-height:40px;padding:6px 8px;font-size:.82rem}
}
@media print{.skandha-links{display:none}}
</style>
</head>
<body>
<a class="skip-link" id="skip-link" href="#main-0">মূল লেখায় যান</a>
<header class="hero"><div class="eyebrow">শ্রবণ • কীর্তন • স্মরণ • ভক্তি</div><h1>শ্রীমদ্ভাগবত মহাপুরাণ</h1></header>
<nav class="tabs" id="tabs" role="tablist" aria-label="প্রধান বিভাগ">${tabOrder.map((pageIndex,position)=>`<button class="tab ${position===0?"active":""}" id="tab-${pageIndex}" role="tab" aria-selected="${position===0}" aria-controls="page-${pageIndex}" tabindex="${position===0?0:-1}" data-tab="${pageIndex}">${rendered[pageIndex].title}</button>`).join("")}</nav>
<div id="pages">${rendered.map((x,i)=>`<section class="page ${i===0?"active":""}" id="page-${i}" role="tabpanel" aria-labelledby="tab-${i}" ${i===0?"":"hidden"}><aside class="side" aria-label="এই বিভাগের সূচি">${x.storyModule?`<div data-story-skandha-nav><div class="side-title">১২ স্কন্ধ</div><nav class="story-side-nav" aria-label="স্কন্ধ নির্বাচন">${storyIntegration.skandhas.map((item,index)=>`<button type="button" class="${index===0?"active":""}" data-select-skandha="${item.number}" aria-pressed="${index===0}">${item.ordinal} স্কন্ধ</button>`).join("")}</nav></div>`:`<div class="desktop-toc"><div class="side-title">এই বিভাগের সূচি</div><input class="search" type="search" aria-label="এই বিভাগে খুঁজুন" placeholder="এই বিভাগে খুঁজুন…" data-search="${i}">${x.nav.map(n=>`<a href="#${n.id}">${n.title}</a>`).join("")}</div><details class="mobile-toc"><summary>এই বিভাগের সূচি</summary><div class="mobile-toc-links"><input class="search" type="search" aria-label="এই বিভাগে খুঁজুন" placeholder="এই বিভাগে খুঁজুন…" data-search="${i}">${x.nav.map(n=>`<a href="#${n.id}">${n.title}</a>`).join("")}</div></details>`}</aside><main class="main-content" id="main-${i}" tabindex="-1"><article class="content" data-content="${i}">${x.html}</article></main></section>`).join("")}</div>
<dialog id="diagram-viewer" class="diagram-viewer" aria-labelledby="diagram-viewer-title" data-diagram-viewer><div class="diagram-viewer-shell"><header class="diagram-viewer-toolbar"><h2 id="diagram-viewer-title" class="diagram-viewer-title">কথোপকথনের প্রধান স্থাপত্য</h2><div class="diagram-viewer-controls"><button type="button" data-map-zoom-out aria-label="চিত্র ছোট করুন">−</button><button type="button" data-map-zoom-in aria-label="চিত্র বড় করুন">+</button><button type="button" data-map-fit>পুরো চিত্র</button><button type="button" data-map-close aria-label="চিত্র বন্ধ করুন">বন্ধ</button></div></header><div class="diagram-viewer-viewport" data-map-viewport tabindex="0" aria-label="চিত্র টেনে সরান বা দুই আঙুলে বড়-ছোট করুন"><div class="diagram-viewer-stage" data-map-stage></div></div></div></dialog>
<footer>॥ ওঁ নমো ভগবতে বাসুদেবায় ॥<br>ঘটনার কালক্রম ও কথনের কালক্রম ইচ্ছাকৃতভাবে আলাদা রাখা হয়েছে।</footer>
<script>
const storyData=${JSON.stringify(storyIntegration).replace(/</g, "\\u003c")};
const tabs=[...document.querySelectorAll('[role="tab"]')];
const pages=[...document.querySelectorAll('[role="tabpanel"]')];
const skipLink=document.getElementById('skip-link');
let tocObserver;

function activateTab(index,{focus=false,scrollTop=false}={}){
  tabs.forEach(tab=>{
    const active=Number(tab.dataset.tab)===index;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
  });
  pages.forEach((page,i)=>{
    const active=i===index;
    page.classList.toggle('active',active);
    page.hidden=!active;
  });
  skipLink.href='#main-'+index;
  if(focus)tabs.find(tab=>Number(tab.dataset.tab)===index)?.focus();
  if(scrollTop)window.scrollTo({top:document.querySelector('.tabs').offsetTop,behavior:'smooth'});
  requestAnimationFrame(()=>{observeActivePage();updateDiagramPreviews()});
}

function pageIndexFor(element){return pages.findIndex(page=>page.contains(element))}

function openHash(scroll=true){
  const id=decodeURIComponent(location.hash.slice(1));
  if(!id)return false;
  const target=document.getElementById(id);
  if(!target)return false;
  const index=pageIndexFor(target);
  if(index>=0)activateTab(index);
  const storyPanel=target.closest('[data-skandha-panel]');
  if(storyPanel)selectStorySkandha(Number(storyPanel.dataset.skandhaPanel),false);
  if(id.startsWith('story-s'))requestAnimationFrame(()=>openStory(id,true));
  if(scroll)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  return true;
}

tabs.forEach((button,orderIndex)=>{
  button.addEventListener('click',()=>activateTab(Number(button.dataset.tab),{scrollTop:true}));
  button.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(orderIndex+1)%tabs.length;
    if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(orderIndex-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next===undefined)return;
    event.preventDefault();
    activateTab(Number(tabs[next].dataset.tab),{focus:true,scrollTop:true});
  });
});

const mapViewer=document.querySelector('[data-diagram-viewer]');
const mapViewport=mapViewer?.querySelector('[data-map-viewport]');
const mapStage=mapViewer?.querySelector('[data-map-stage]');
const mapViewerTitle=mapViewer?.querySelector('.diagram-viewer-title');
let mapCanvas=null,mapPreview=null,mapExpandButton=null;
let mapReturnMarker=null,mapReturnFocus=null,mapReturnScrollY=0,mapSavedCanvasStyle=null,mapSavedPreviewStyle=null;
let mapZoom=1,mapFitZoom=1,mapPanX=0,mapPanY=0,mapPointers=new Map(),mapDragStart=null,mapPinchStart=null;

function updateDiagramPreviews(){
  if(mapViewer?.open)return;
  const compact=window.matchMedia('(max-width:700px)').matches;
  document.querySelectorAll('[data-map-canvas]').forEach(canvas=>{
    const preview=canvas.closest('[data-map-preview]');
    if(!preview)return;
    if(compact){
      const naturalWidth=canvas.offsetWidth||720;
      const scale=Math.min(1,preview.clientWidth/naturalWidth);
      canvas.style.transformOrigin='top left';
      canvas.style.transform='scale('+scale+')';
      preview.style.height=(canvas.offsetHeight*scale)+'px';
    }else{
      canvas.style.transform='';
      canvas.style.transformOrigin='';
      preview.style.height='';
    }
  });
}

function applyMapTransform(){
  if(!mapCanvas)return;
  mapCanvas.style.transformOrigin='top left';
  mapCanvas.style.transform='translate('+mapPanX+'px,'+mapPanY+'px) scale('+mapZoom+')';
}

function fitNarrationMap(){
  if(!mapViewport||!mapCanvas)return;
  const width=mapCanvas.offsetWidth,height=mapCanvas.offsetHeight;
  if(!width||!height)return;
  mapFitZoom=Math.min(mapViewport.clientWidth/width,mapViewport.clientHeight/height,1);
  mapZoom=mapFitZoom;
  mapPanX=(mapViewport.clientWidth-width*mapZoom)/2;
  mapPanY=(mapViewport.clientHeight-height*mapZoom)/2;
  applyMapTransform();
}

function zoomNarrationMap(nextZoom,anchorX=mapViewport.clientWidth/2,anchorY=mapViewport.clientHeight/2){
  const bounded=Math.max(mapFitZoom,Math.min(4,nextZoom));
  const ratio=bounded/mapZoom;
  mapPanX=anchorX-(anchorX-mapPanX)*ratio;
  mapPanY=anchorY-(anchorY-mapPanY)*ratio;
  mapZoom=bounded;
  applyMapTransform();
}

if(mapViewer&&mapViewport&&mapStage){
  const resizeObserver=new ResizeObserver(updateDiagramPreviews);
  document.querySelectorAll('[data-map-preview]').forEach(preview=>resizeObserver.observe(preview));
  window.addEventListener('resize',()=>{
    if(mapViewer.open)fitNarrationMap();
    else updateDiagramPreviews();
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-open-diagram-viewer]');
    if(!button)return;
    mapExpandButton=button;
    const figure=button.closest('.responsive-diagram');
    mapCanvas=figure?.querySelector('[data-map-canvas]');
    mapPreview=figure?.querySelector('[data-map-preview]');
    if(!mapCanvas||!mapPreview)return;
    updateDiagramPreviews();
    mapReturnFocus=button;
    mapReturnScrollY=window.scrollY;
    mapSavedCanvasStyle=mapCanvas.getAttribute('style');
    mapSavedPreviewStyle=mapPreview.getAttribute('style');
    if(mapViewerTitle)mapViewerTitle.textContent=figure.querySelector('figcaption strong')?.textContent||'চিত্র দেখুন';
    mapReturnMarker=document.createComment('মানচিত্রের আগের অবস্থান');
    mapCanvas.parentNode.insertBefore(mapReturnMarker,mapCanvas);
    mapCanvas.style.width=mapCanvas.offsetWidth+'px';
    mapCanvas.style.transform='none';
    mapStage.append(mapCanvas);
    mapViewer.showModal();
    requestAnimationFrame(()=>{fitNarrationMap();mapViewer.querySelector('[data-map-close]').focus()});
  });
  mapViewer.querySelector('[data-map-close]').addEventListener('click',()=>mapViewer.close());
  mapViewer.querySelector('[data-map-fit]').addEventListener('click',fitNarrationMap);
  mapViewer.querySelector('[data-map-zoom-in]').addEventListener('click',()=>zoomNarrationMap(mapZoom*1.25));
  mapViewer.querySelector('[data-map-zoom-out]').addEventListener('click',()=>zoomNarrationMap(mapZoom/1.25));
  mapViewer.addEventListener('click',event=>{if(event.target===mapViewer)mapViewer.close()});
  mapViewer.addEventListener('close',()=>{
    if(!mapCanvas)return;
    if(mapReturnMarker?.parentNode)mapReturnMarker.parentNode.insertBefore(mapCanvas,mapReturnMarker);
    mapReturnMarker?.remove();
    if(mapSavedCanvasStyle===null)mapCanvas.removeAttribute('style');else mapCanvas.setAttribute('style',mapSavedCanvasStyle);
    if(mapSavedPreviewStyle===null)mapPreview.removeAttribute('style');else mapPreview.setAttribute('style',mapSavedPreviewStyle);
    mapPointers.clear();mapDragStart=null;mapPinchStart=null;
    requestAnimationFrame(()=>{
      updateDiagramPreviews();
      if(mapReturnFocus?.isConnected)mapReturnFocus.focus({preventScroll:true});
      window.scrollTo(0,mapReturnScrollY);
    });
  });

  function pointInMapViewport(event){
    const rect=mapViewport.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  }
  function beginMapPinch(){
    const [first,second]=[...mapPointers.values()];
    const middle={x:(first.x+second.x)/2,y:(first.y+second.y)/2};
    mapPinchStart={distance:Math.max(1,Math.hypot(second.x-first.x,second.y-first.y)),zoom:mapZoom,worldX:(middle.x-mapPanX)/mapZoom,worldY:(middle.y-mapPanY)/mapZoom};
  }
  mapViewport.addEventListener('pointerdown',event=>{
    event.preventDefault();
    mapViewport.setPointerCapture(event.pointerId);
    mapPointers.set(event.pointerId,pointInMapViewport(event));
    if(mapPointers.size===1){const point=mapPointers.get(event.pointerId);mapDragStart={x:point.x,y:point.y,panX:mapPanX,panY:mapPanY}}
    if(mapPointers.size===2)beginMapPinch();
  });
  mapViewport.addEventListener('pointermove',event=>{
    if(!mapPointers.has(event.pointerId))return;
    mapPointers.set(event.pointerId,pointInMapViewport(event));
    if(mapPointers.size>=2&&mapPinchStart){
      const [first,second]=[...mapPointers.values()];
      const middle={x:(first.x+second.x)/2,y:(first.y+second.y)/2};
      mapZoom=Math.max(mapFitZoom,Math.min(4,mapPinchStart.zoom*Math.hypot(second.x-first.x,second.y-first.y)/mapPinchStart.distance));
      mapPanX=middle.x-mapPinchStart.worldX*mapZoom;
      mapPanY=middle.y-mapPinchStart.worldY*mapZoom;
      applyMapTransform();
    }else if(mapPointers.size===1&&mapDragStart){
      const point=mapPointers.get(event.pointerId);
      mapPanX=mapDragStart.panX+point.x-mapDragStart.x;
      mapPanY=mapDragStart.panY+point.y-mapDragStart.y;
      applyMapTransform();
    }
  });
  const endMapPointer=event=>{
    mapPointers.delete(event.pointerId);
    mapPinchStart=null;
    mapDragStart=null;
    if(mapPointers.size===1){const [id,point]=[...mapPointers.entries()][0];mapDragStart={id,x:point.x,y:point.y,panX:mapPanX,panY:mapPanY}}
  };
  mapViewport.addEventListener('pointerup',endMapPointer);
  mapViewport.addEventListener('pointercancel',endMapPointer);
  mapViewport.addEventListener('lostpointercapture',endMapPointer);
}

function setActiveToc(id){
  document.querySelectorAll('.side a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+id));
}

function observeActivePage(){
  if(tocObserver)tocObserver.disconnect();
  const page=document.querySelector('.page.active');
  if(!page)return;
  const headings=[...page.querySelectorAll('.content h2[id],.content h3[id],.content h4[id]')];
  if(!headings.length||!('IntersectionObserver' in window))return;
  tocObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(visible[0])setActiveToc(visible[0].target.id);
  },{rootMargin:'-12% 0px -72% 0px',threshold:0});
  headings.forEach(heading=>tocObserver.observe(heading));
}

document.querySelectorAll('.side a').forEach(link=>link.addEventListener('click',()=>{
  const details=link.closest('details');
  if(details)details.open=false;
}));

document.querySelectorAll('[data-search]').forEach(input=>input.addEventListener('input',()=>{
  const page=input.closest('.page');
  const q=input.value.trim().toLocaleLowerCase('bn');
  page.querySelectorAll('[data-search]').forEach(peer=>{if(peer!==input)peer.value=input.value});
  const children=[...page.querySelector('.content').children];
  children.forEach(el=>el.classList.remove('hidden-by-search'));
  if(!q)return;
  children.forEach(el=>el.classList.toggle('hidden-by-search',el.classList.contains('skandha-links')||!el.innerText.toLocaleLowerCase('bn').includes(q)));
  children.forEach((el,i)=>{
    if(el.classList.contains('hidden-by-search'))return;
    for(let j=i-1;j>=0;j--){
      if(/^H[2-4]$/.test(children[j].tagName)){children[j].classList.remove('hidden-by-search');break}
    }
  });
}));

const allStories=storyData.skandhas.flatMap(skandha=>skandha.stories);
const storiesById=new Map(allStories.map(story=>[story.id,story]));
const detailsByKey=new Map(storyData.details.map(detail=>[detail.detailKey,detail]));
const storySearch=document.getElementById('story-search');
const storyDialog=document.getElementById('story-dialog');
const lessonSearch=document.getElementById('lesson-search');
let activeStorySkandha=1;
let activeStoryView='story';
let storyReturnFocus=null;

function selectStorySkandha(number,scroll=true){
  activeStorySkandha=number;
  document.querySelectorAll('[data-skandha-panel]').forEach(panel=>{panel.hidden=Number(panel.dataset.skandhaPanel)!==number});
  document.querySelectorAll('[data-select-skandha]').forEach(button=>{
    const active=Number(button.dataset.selectSkandha)===number;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  filterStories();
  const panel=document.querySelector('[data-skandha-panel="'+number+'"]');
  if(panel){
    history.replaceState(null,'','#stories-skandha-'+number);
    if(scroll)panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
}

function setStoryView(view){
  activeStoryView=view;
  document.querySelectorAll('[data-story-view]').forEach(button=>{
    const active=button.dataset.storyView===view;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-skandha-panel]').forEach(panel=>{
    panel.querySelectorAll('[data-view]').forEach(section=>{section.hidden=section.dataset.view!==view});
  });
  filterStories();
}

function normalizeSearch(value){return value.trim().replace(/\\s+/g,' ').toLocaleLowerCase('bn')}

function filterStories(){
  const query=normalizeSearch(storySearch?storySearch.value:'');
  const skandha=storyData.skandhas.find(item=>item.number===activeStorySkandha);
  const panel=document.querySelector('[data-skandha-panel="'+activeStorySkandha+'"]');
  if(!skandha||!panel)return;
  let visibleCount=0;
  skandha.stories.forEach(story=>{
    const haystack=normalizeSearch([story.title,story.chapter,story.whatHappened,story.lesson,skandha.ordinal+' স্কন্ধ',skandha.titleBn,skandha.themeBn].join(' '));
    const visible=!query||haystack.includes(query);
    if(visible)visibleCount++;
    panel.querySelectorAll('[data-story-row="'+story.id+'"]').forEach(row=>{row.hidden=!visible});
  });
  panel.querySelectorAll('.story-group-row').forEach(group=>{
    let next=group.nextElementSibling;
    let hasVisible=false;
    while(next&&!next.classList.contains('story-group-row')){if(!next.hidden)hasVisible=true;next=next.nextElementSibling}
    group.hidden=!hasVisible;
  });
  panel.querySelector('.story-empty').hidden=visibleCount>0;
}

function appendStorySection(parent,title,text,className){
  const section=document.createElement('section');
  section.className='story-detail-section'+(className?' '+className:'');
  const heading=document.createElement('h4');
  heading.textContent=title;
  const paragraph=document.createElement('p');
  paragraph.textContent=text;
  section.append(heading,paragraph);
  parent.append(section);
}

function bengaliDigits(value){return String(value).replace(/[0-9]/g,digit=>'০১২৩৪৫৬৭৮৯'[Number(digit)])}
function asciiDigits(value){return String(value).replace(/[০-৯]/g,digit=>String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))}

function renderSourceLinks(story){
  const container=document.getElementById('story-source-links');
  container.replaceChildren();
  const chapterPart=story.chapter.replace(/^[০-৯]+\\./,'');
  const chapters=[];
  chapterPart.split(',').forEach(part=>{
    const range=asciiDigits(part.trim()).split('–').map(Number);
    if(range.length===2&&Number.isFinite(range[0])&&Number.isFinite(range[1])&&range[1]>=range[0]&&range[1]-range[0]<30){
      for(let chapter=range[0];chapter<=range[1];chapter++)chapters.push(chapter);
    }else if(Number.isFinite(range[0]))chapters.push(range[0]);
  });
  const unique=[...new Set(chapters)];
  if(!unique.length){
    const link=document.createElement('a');link.href='https://vedabase.io/en/library/sb/';link.target='_blank';link.rel='noopener';link.textContent='শ্রীমদ্ভাগবত মূল সূচি';container.append(link);return;
  }
  unique.forEach(chapter=>{
    const link=document.createElement('a');
    link.href='https://vedabase.io/en/library/sb/'+story.skandha+'/'+chapter+'/';
    link.target='_blank';link.rel='noopener';
    link.textContent=bengaliDigits(story.skandha)+'.'+bengaliDigits(chapter);
    container.append(link);
  });
}

function openStory(id,updateHash=true){
  const story=storiesById.get(id);
  if(!story||!storyDialog)return;
  selectStorySkandha(story.skandha,false);
  storyReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  document.getElementById('story-dialog-title').textContent=story.title;
  document.getElementById('story-dialog-reference').textContent=story.chapter;
  const content=document.getElementById('story-dialog-content');
  content.replaceChildren();
  const detail=story.detailKey?detailsByKey.get(story.detailKey):null;
  if(detail){
    appendStorySection(content,'গল্পের পটভূমি',detail.background);
    appendStorySection(content,'ঘটনাটি বিস্তারিত',detail.narrative);
    appendStorySection(content,'মূল শিক্ষা',detail.takeaway);
    appendStorySection(content,'মনে রাখার সূত্র',detail.memoryHook,'memory');
  }else{
    appendStorySection(content,'ঘটনাটি বিস্তারিত',story.whatHappened);
    appendStorySection(content,'মূল শিক্ষা',story.lesson);
  }
  renderSourceLinks(story);
  if(updateHash)history.replaceState(null,'','#'+story.id);
  if(!storyDialog.open)storyDialog.showModal();
  storyDialog.querySelector('.story-dialog-close').focus();
}

function filterLessons(){
  const query=normalizeSearch(lessonSearch?lessonSearch.value:'');
  let visibleCount=0;
  document.querySelectorAll('[data-lesson-entry]').forEach(entry=>{
    const visible=!query||normalizeSearch(entry.innerText).includes(query);
    entry.hidden=!visible;
    if(visible)visibleCount++;
  });
  const empty=document.querySelector('.lesson-empty');
  if(empty)empty.hidden=visibleCount>0;
}

document.querySelectorAll('[data-select-skandha]').forEach(button=>button.addEventListener('click',()=>selectStorySkandha(Number(button.dataset.selectSkandha))));
document.querySelectorAll('[data-story-view]').forEach(button=>button.addEventListener('click',()=>setStoryView(button.dataset.storyView)));
document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-story]');
  if(opener)openStory(opener.dataset.story);
});
if(storySearch)storySearch.addEventListener('input',filterStories);
if(lessonSearch)lessonSearch.addEventListener('input',filterLessons);
if(storyDialog){
  storyDialog.querySelector('.story-dialog-close').addEventListener('click',()=>storyDialog.close());
  storyDialog.addEventListener('click',event=>{if(event.target===storyDialog)storyDialog.close()});
  storyDialog.addEventListener('close',()=>{
    history.replaceState(null,'','#stories-skandha-'+activeStorySkandha);
    if(storyReturnFocus&&document.contains(storyReturnFocus))storyReturnFocus.focus();
  });
}
window.addEventListener('hashchange',()=>openHash(true));
if(!openHash(false))activateTab(0);
else requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'start'}));
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "srimad_bhagavatam_bengali_explorer.html"), html, "utf8");
const chotushlokiHtml = renderStandaloneChotushlokiArticle();
fs.writeFileSync(path.join(__dirname, chotushlokiArticlePath), chotushlokiHtml, "utf8");
const krishnaVishnuHtml = renderStandaloneKrishnaVishnuArticle();
fs.writeFileSync(path.join(__dirname, krishnaVishnuArticlePath), krishnaVishnuHtml, "utf8");
const choturdoshBhobanHtml = renderStandaloneChoturdoshBhobanArticle();
fs.writeFileSync(path.join(__dirname, choturdoshBhobanArticlePath), choturdoshBhobanHtml, "utf8");
const shibtottoHtml = renderStandaloneShibtottoArticle();
fs.writeFileSync(path.join(__dirname, shibtottoArticlePath), shibtottoHtml, "utf8");
const krishnaShaktiHtml = renderStandaloneKrishnaShaktiArticle();
fs.writeFileSync(path.join(__dirname, krishnaShaktiArticlePath), krishnaShaktiHtml, "utf8");
const radhaTattvaHtml = renderStandaloneRadhaTattvaArticle();
fs.writeFileSync(path.join(__dirname, radhaTattvaArticlePath), radhaTattvaHtml, "utf8");
const rasaGopigitaHtml = renderStandaloneSeriesArticle(rasaGopigitaArticle, "porbo8", 8);
fs.writeFileSync(path.join(__dirname, rasaGopigitaArticlePath), rasaGopigitaHtml, "utf8");
const gitagovindaHtml = renderStandaloneSeriesArticle(gitagovindaArticle, "porbo9", 9);
fs.writeFileSync(path.join(__dirname, gitagovindaArticlePath), gitagovindaHtml, "utf8");
const porbo10Html = renderStandaloneSeriesArticle(porbo10Article, "porbo10", 10);
fs.writeFileSync(path.join(__dirname, porbo10ArticlePath), porbo10Html, "utf8");
const porbo11Html = renderStandaloneSeriesArticle(porbo11Article, "porbo11", 11);
fs.writeFileSync(path.join(__dirname, porbo11ArticlePath), porbo11Html, "utf8");
const porbo12Html = renderStandaloneSeriesArticle(porbo12Article, "porbo12", 12);
fs.writeFileSync(path.join(__dirname, porbo12ArticlePath), porbo12Html, "utf8");
const porbo13Html = renderStandaloneSeriesArticle(porbo13Article, "porbo13", 13);
fs.writeFileSync(path.join(__dirname, porbo13ArticlePath), porbo13Html, "utf8");
const porbo14Html = renderStandaloneSeriesArticle(porbo14Article, "porbo14", 14);
fs.writeFileSync(path.join(__dirname, porbo14ArticlePath), porbo14Html, "utf8");
const porbo15Html = renderStandaloneSeriesArticle(porbo15Article, "porbo15", 15);
fs.writeFileSync(path.join(__dirname, porbo15ArticlePath), porbo15Html, "utf8");
const shikha1Html = renderStandaloneSeriesArticle(shikha1Article, "shikha1", 1);
fs.writeFileSync(path.join(__dirname, shikha1ArticlePath), shikha1Html, "utf8");
const detailedLessonArticles = detailedLessons.map(lesson => {
  const articlePath = `articles/${lesson.id}.html`;
  const articleHtml = renderStandaloneDetailedLessonArticle(lesson);
  fs.writeFileSync(path.join(__dirname, articlePath), articleHtml, "utf8");
  return { path: articlePath, bytes: Buffer.byteLength(articleHtml) };
});
console.log(JSON.stringify({ chapters: rendered.length, detailedLessons: detailedLessons.length, standaloneArticles: [vishnuArticle.articlePath, chotushlokiArticlePath, krishnaVishnuArticlePath, choturdoshBhobanArticlePath, shibtottoArticlePath, krishnaShaktiArticlePath, radhaTattvaArticlePath, rasaGopigitaArticlePath, gitagovindaArticlePath, porbo10ArticlePath, porbo11ArticlePath, porbo12ArticlePath, porbo13ArticlePath, porbo14ArticlePath, porbo15ArticlePath, shikha1ArticlePath, ...detailedLessonArticles.map(article => article.path)], sourceCharacters: chapters.reduce((n,x)=>n+x.markdown.length,0) + chotushlokiMarkdown.length + krishnaVishnuMarkdown.length + choturdoshBhobanMarkdown.length + shibtottoMarkdown.length + krishnaShaktiMarkdown.length + radhaTattvaMarkdown.length + rasaGopigitaMarkdown.length + gitagovindaMarkdown.length + porbo10Markdown.length + porbo11Markdown.length + porbo12Markdown.length + porbo13Markdown.length + porbo14Markdown.length + porbo15Markdown.length + shikha1Markdown.length, outputBytes: Buffer.byteLength(html), shikha1Bytes: Buffer.byteLength(shikha1Html), detailedLessonArticles }, null, 2));
