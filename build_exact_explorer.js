const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "raw_conversation.md"), "utf8").replace(/\r\n/g, "\n");
const integrationSource = fs.readFileSync(path.join(__dirname, "..", "BHAGAVATAM_CODEX_INTEGRATION.md"), "utf8").replace(/\r\n/g, "\n");

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
    markdown: between(
      "অবশ্যই। **শ্রীমদ্ভাগবত মহাপুরাণ**",
      "\n---\n\n\n```\nShreemad Bhagawat er"
    ),
  },
  {
    id: "shlokas",
    title: "২৫ শ্লোক",
    markdown: between(
      "এই ২৫টি শ্লোক কোনো শাস্ত্রীয় বা আনুষ্ঠানিক শ্রেষ্ঠ তালিকা নয়",
      "\n----\n\n```\nThanks. There are so many"
    ),
  },
  {
    id: "conversations",
    title: "কথোপকথন ও ১২ স্কন্ধ",
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

function inline(text) {
  return escapeHtml(withoutEmoji(text))
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function diagramNode(title, meta = "", type = "") {
  return `<div class="map-node ${type}"><strong>${escapeHtml(title)}</strong>${meta ? `<small>${escapeHtml(meta)}</small>` : ""}</div>`;
}

function sourceFallback(code) {
  return `<details class="diagram-source"><summary>মূল text diagram দেখুন</summary><pre><code>${escapeHtml(code)}</code></pre></details>`;
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
  if (code.startsWith("শৌনকাদি ঋষি")) return chainDiagram([["শৌনকাদি ঋষি","প্রশ্ন করেন"],["সূত গোস্বামী","বলেন"],["শুকদেব ↔ পরীক্ষিৎ","মূল সংবাদ"],["আরও প্রাচীন কথোপকথন","nested narration"]],"ভাগবতের কথন-স্তর","একটি সংবাদের ভিতরে আরও প্রাচীন সংবাদ",code);

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
  const introRendered = markdownToHtml(introText, `${prefix}-intro`);
  const studyRendered = studyText ? markdownToHtml(studyText, `${prefix}-study`) : { html: "", nav: [] };
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
    const explanation = markdownToHtml(remaining, `${prefix}-note-${index}`).html;
    const id = `${prefix}-verse-${reference.replace(/\./g, "-") || index}`;
    const context = verseContext[reference] || ["বর্ণনাকারী", "শ্রোতা", "প্রসঙ্গটি যাচাইাধীন।"];
    nav.push({ id, title: `${bengaliNumber(index)} · ${title}` });
    entries.push(`<article class="verse-entry" id="${id}"><aside class="verse-rail"><span>${bengaliNumber(index)}</span><small>${reference}</small></aside><div class="verse-body"><header class="verse-header"><h3>${escapeHtml(title)}</h3><div class="verse-reference">শ্রীমদ্ভাগবত ${reference}</div></header><dl class="verse-context"><div><dt>বক্তা</dt><dd>${escapeHtml(context[0])}</dd></div><div><dt>শ্রোতা/উদ্দেশ্য</dt><dd>${escapeHtml(context[1])}</dd></div><div class="context-wide"><dt>প্রসঙ্গ</dt><dd>${escapeHtml(context[2])}</dd></div></dl><div class="verse-text" aria-label="মূল শ্লোক">${verseLines.map(line => `<span>${escapeHtml(line)}</span>`).join("")}</div><div class="verse-explanation">${explanation}</div></div></article>`);
  }
  return { html: `${introRendered.html}<div class="verse-collection">${entries.join("")}</div>${studyRendered.html}`, nav: [...nav, ...studyRendered.nav] };
}

function markdownToHtml(markdown, prefix) {
  if (prefix === "shlokas") return renderShlokaChapter(markdown, prefix);
  const lines = markdown.split("\n");
  const out = [];
  const nav = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      const isDiagram = language === "text";
      out.push(isDiagram ? renderDiagram(code.join("\n")) : `<div class="diagram-wrap prompt-wrap"><div class="diagram-label">মূল প্রশ্ন বা বক্তব্য</div><pre class="diagram"><code>${escapeHtml(code.join("\n"))}</code></pre></div>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 4);
      const headingText = withoutEmoji(heading[2]);
      const clean = headingText.replace(/\*\*/g, "").trim();
      const id = slugify(clean, prefix);
      if (heading[1].length <= 3) nav.push({ id, title: clean });
      out.push(`<h${level} id="${id}">${inline(headingText)}</h${level}>`);
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
      out.push(`<div class="table-wrap"><table><thead><tr>${header.map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && (lines[i].startsWith(">") || !lines[i].trim())) {
        if (lines[i].startsWith(">")) quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${inline(quote.join("\n")).replace(/\n/g, "<br>")}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      out.push(`<ul>${items.map(x => `<li>${inline(x)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      out.push(`<ol>${items.map(x => `<li>${inline(x)}</li>`).join("")}</ol>`);
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
      !lines[i].startsWith(">") && !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i]) &&
      !/^\s*---+\s*$/.test(lines[i]) && !lines[i].trim().startsWith("|")
    ) {
      paragraph.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${inline(paragraph.join("\n")).replace(/\n/g, "<br>")}</p>`);
  }

  return { html: out.join("\n"), nav };
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
  return markdownToHtml(lesson.content, lesson.id).html
    .replace(/<p><strong>গদ্যের সারার্থ:<\/strong>/g, `<p class="lesson-summary"><strong>গদ্যের সারার্থ:</strong>`)
    .replace(/<p><strong>শিক্ষা:<\/strong>/g, `<p class="lesson-teaching"><strong>শিক্ষা:</strong>`)
    .replace(/<p><strong>আমাদের জীবনে:<\/strong>/g, `<p class="lesson-application"><strong>আমাদের জীবনে:</strong>`)
    .replace(/<p><strong>ব্যাখ্যা:<\/strong>/g, `<p class="lesson-explanation"><strong>ব্যাখ্যা:</strong>`);
}

function renderDetailedLessons() {
  const cards = detailedLessons.map(lesson => {
    const reference = `স্কন্ধ ${String(lesson.skandha).replace(/[0-9]/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)])} · অধ্যায় ${String(lesson.chapter).replace(/[0-9]/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)])} · শ্লোক ${String(lesson.verses).replace(/[0-9]/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)])}`;
    return `<article class="lesson-entry" id="${lesson.id}" data-lesson-entry><button class="lesson-open" type="button" data-lesson="${lesson.id}" aria-label="বিশদ পাঠ খুলুন: ${escapeHtml(lesson.title)}"><span class="lesson-mark" aria-hidden="true">◆</span><span class="lesson-card-body"><span class="lesson-card-kicker">বিশদ পাঠ</span><strong class="lesson-card-title">${escapeHtml(lesson.title)}</strong><span class="lesson-card-reference">${escapeHtml(reference)}</span><span class="lesson-card-voices"><span><b>বক্তা</b> ${escapeHtml(lesson.speaker)}</span><span><b>শ্রোতা</b> ${escapeHtml(lesson.listener)}</span></span><span class="lesson-card-teaching"><b>এক বাক্যে শিক্ষা</b> ${escapeHtml(lesson.oneLineLesson)}</span></span><span class="lesson-card-arrow" aria-hidden="true">পড়ুন</span></button><template id="template-${lesson.id}"><article class="lesson-reading"><header class="lesson-reading-header"><p><span aria-hidden="true">◆</span> বিশদ পাঠ</p><h3>${escapeHtml(lesson.title)}</h3><dl><div><dt>গ্রন্থ</dt><dd>${escapeHtml(lesson.scripture)}</dd></div><div><dt>স্থান</dt><dd>${escapeHtml(reference)}</dd></div><div><dt>বক্তা</dt><dd>${escapeHtml(lesson.speaker)}</dd></div><div><dt>শ্রোতা</dt><dd>${escapeHtml(lesson.listener)}</dd></div></dl></header>${renderDetailedLessonContent(lesson)}</article></template></article>`;
  }).join("");
  return `<section class="detailed-lessons" id="detailed-lessons-title" data-story-mode-panel="lessons" aria-labelledby="detailed-lessons-heading" hidden><header class="detailed-lessons-header"><p><span aria-hidden="true">◆</span> পূর্ণাঙ্গ অধ্যয়ন</p><h3 id="detailed-lessons-heading">বিশদ পাঠ</h3><p>নির্বাচিত প্রসঙ্গের বিস্তৃত পাঠ, ব্যাখ্যা ও জীবনে প্রয়োগ।</p></header><label class="lesson-search-label"><span class="sr-only">বিশদ পাঠ খুঁজুন</span><input id="lesson-search" type="search" placeholder="শিরোনাম, বক্তা বা বিষয় খুঁজুন..." autocomplete="off"></label><div class="lesson-list">${cards}</div><p class="lesson-empty" hidden>এই শব্দে কোনো বিশদ পাঠ পাওয়া যায়নি।</p></section><dialog class="lesson-dialog" id="lesson-dialog" aria-label="বিশদ পাঠ"><div class="lesson-dialog-shell"><button class="lesson-dialog-close" type="button" aria-label="বিশদ পাঠ বন্ধ করুন">বন্ধ করুন</button><div id="lesson-dialog-content"></div></div></dialog>`;
}

function renderStoryModule() {
  const overview = storyIntegration.skandhas.map(skandha => `<li><button type="button" data-select-skandha="${skandha.number}"><span>${escapeHtml(skandha.ordinal)} স্কন্ধ</span><strong>${escapeHtml(skandha.titleBn)}</strong><small>${escapeHtml(skandha.chapterCountBn)}টি অধ্যায় · ${escapeHtml(skandha.themeBn)}</small></button></li>`).join("");
  const panels = storyIntegration.skandhas.map((skandha, index) => `<section class="skandha-story-panel" id="stories-skandha-${skandha.number}" data-skandha-panel="${skandha.number}" ${index ? "hidden" : ""}><header class="skandha-header"><p>${escapeHtml(skandha.chapterCountBn)}টি অধ্যায়</p><h3>${escapeHtml(skandha.ordinal)} স্কন্ধ — ${escapeHtml(skandha.titleBn)}</h3><p><strong>মূল ভাব:</strong> ${escapeHtml(skandha.themeBn)}</p><p class="memory-line"><strong>এক বাক্যের শিক্ষা:</strong> ${escapeHtml(skandha.memoryLineBn)}</p></header><div class="story-view" data-view="story"><div class="story-table-wrap"><table class="story-table"><thead><tr><th>ঘটনা ও অধ্যায়</th><th>কী ঘটেছিল</th><th>কী শিখলাম</th></tr></thead><tbody>${renderStoryRows(skandha)}</tbody></table></div></div><div class="chapter-view" data-view="chapter" hidden><ol>${renderStoryChapterRows(skandha)}</ol></div><p class="story-empty" hidden>এই শব্দে কোনো গল্প পাওয়া যায়নি।</p></section>`).join("");
  return `<header class="story-page-header"><p class="story-kicker">পড়ুন • বুঝুন • মনে রাখুন • জীবনে প্রয়োগ করুন</p><h2 id="stories-title">শ্রীমদ্ভাগবত — গল্প ও শিক্ষা</h2><p>১২টি স্কন্ধের প্রধান ঘটনা, তাদের মূল শিক্ষা এবং বিস্তারিত গল্প—এক জায়গায়।</p></header><nav class="story-section-tabs" aria-label="গল্প ও শিক্ষার ধরন"><button class="active" type="button" data-story-mode="stories" aria-pressed="true">স্কন্ধভিত্তিক গল্প</button><button type="button" data-story-mode="lessons" aria-pressed="false"><span aria-hidden="true">◆</span> বিশদ পাঠ</button></nav><section data-story-mode-panel="stories"><section class="skandha-overview" aria-labelledby="overview-title"><div class="section-rule"><span>১২ স্কন্ধ এক নজরে</span></div><h3 id="overview-title">স্কন্ধ নির্বাচন করুন</h3><ol>${overview}</ol></section><div class="story-toolbar"><div class="story-view-toggle" role="group" aria-label="গল্প দেখার ধরন"><button class="active" type="button" data-story-view="story" aria-pressed="true">গল্প অনুযায়ী</button><button type="button" data-story-view="chapter" aria-pressed="false">অধ্যায় অনুযায়ী</button></div><label class="story-search-label"><span class="sr-only">গল্প খুঁজুন</span><input id="story-search" type="search" placeholder="গল্প, চরিত্র বা অধ্যায় খুঁজুন..." autocomplete="off"></label></div>${panels}</section>${renderDetailedLessons()}<dialog class="story-dialog" id="story-dialog" aria-labelledby="story-dialog-title"><div class="story-dialog-inner"><button class="story-dialog-close" type="button" aria-label="বন্ধ করুন">বন্ধ করুন</button><p class="story-dialog-reference"><span>স্কন্ধ ও অধ্যায়</span><strong id="story-dialog-reference"></strong></p><h3 id="story-dialog-title"></h3><p class="story-dialog-note">গল্পের সারাংশ ও শিক্ষামূলক ব্যাখ্যা; মূল শ্লোকের বিকল্প নয়।</p><div id="story-dialog-content"></div><div class="story-source"><h4>মূল গ্রন্থে ফিরে যান</h4><p id="story-source-links"></p></div></div></dialog>`;
}

const rendered = chapters.map(chapter => chapter.storyModule
  ? { ...chapter, html: renderStoryModule(), nav: storyIntegration.skandhas.map(item => ({ id: `stories-skandha-${item.number}`, title: `${item.ordinal} স্কন্ধ` })), storyModule: true }
  : { ...chapter, ...markdownToHtml(chapter.markdown, chapter.id) });

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
.depth-mark{display:inline-block;margin-right:6px;color:#b86133;font-family:Georgia,serif;font-size:.95em;line-height:1}.story-section-tabs{display:flex;gap:24px;margin:22px 0 0;border-bottom:1px solid #ded8cf}.story-section-tabs button{padding:9px 1px 8px;border:0;border-bottom:2px solid transparent;background:transparent;color:#625b54;cursor:pointer;font-size:.86rem}.story-section-tabs button.active{color:#9c2d09;border-bottom-color:#a8320c;font-weight:600}.story-section-tabs button span{margin-right:4px;color:#b86133}.story-section-tabs button:focus-visible,.lesson-open:focus-visible,.lesson-dialog-close:focus-visible,#lesson-search:focus-visible{outline:3px solid #245775;outline-offset:2px}.detailed-lessons{padding-top:30px}.detailed-lessons-header{padding-bottom:16px;border-bottom:1px solid #ded8cf}.detailed-lessons-header>p:first-child{margin:0;color:#a8320c;font-size:.76rem}.content .detailed-lessons-header h3{margin:2px 0 4px;padding:0;color:#8f2b0c;font-size:1.65rem}.detailed-lessons-header>p:last-child{margin:0;color:#5e554d;font-size:.9rem}.lesson-search-label{display:block;width:min(390px,100%);margin:18px 0 8px}#lesson-search{width:100%;padding:8px 10px;border:1px solid #d8d4cb;border-radius:3px;background:#fff;color:#222;font-size:.8rem}.lesson-list{border-top:2px solid #b9683d}.lesson-entry{border-bottom:1px solid #ded8cf}.lesson-open{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:14px;align-items:start;width:100%;padding:20px 8px;border:0;background:#fff;color:#28231f;text-align:left;cursor:pointer}.lesson-open:hover{background:#fcfaf6}.lesson-mark{padding-top:2px;color:#a8320c;font-family:Georgia,serif;font-size:1.05rem}.lesson-card-body{display:grid;gap:3px}.lesson-card-kicker{color:#a8320c;font-size:.69rem;font-weight:600;letter-spacing:.04em}.lesson-card-title{color:#222;font-size:1.12rem;font-weight:600;line-height:1.5}.lesson-card-reference{color:#736960;font-size:.75rem}.lesson-card-voices{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:5px;color:#544d46;font-size:.78rem}.lesson-card-voices b,.lesson-card-teaching b{margin-right:5px;color:#9c2d09;font-weight:600}.lesson-card-teaching{margin-top:8px;color:#2f2a26;font-size:.88rem;line-height:1.7}.lesson-card-arrow{align-self:center;color:#8f2b0c;font-size:.74rem}.lesson-empty{padding:30px 0;color:#6d6258!important;text-align:center}.lesson-dialog{width:min(940px,calc(100% - 32px));max-height:92vh;padding:0;border:1px solid #d8d0c5;border-radius:6px;background:#fff;color:#222;box-shadow:0 28px 80px rgba(42,31,23,.28)}.lesson-dialog::backdrop{background:rgba(35,28,23,.52);backdrop-filter:blur(2px)}.lesson-dialog-shell{position:relative;padding:38px clamp(24px,6vw,70px) 58px}.lesson-dialog-close{position:sticky;top:0;z-index:3;float:right;margin:-22px -48px 10px 18px;padding:7px 10px;border:1px solid #d8d0c5;border-radius:3px;background:#fff;color:#8f2b0c;cursor:pointer;font-size:.76rem}.lesson-reading{max-width:760px;margin:auto}.lesson-reading-header{padding-bottom:24px;border-bottom:1px solid #d8d0c5}.lesson-reading-header>p{margin:0 0 5px;color:#a8320c;font-size:.76rem}.content .lesson-reading-header h3{margin:0 0 17px;padding:0;color:#8f2b0c;font-size:clamp(1.7rem,3vw,2.35rem);line-height:1.4}.lesson-reading-header dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin:0;border-top:1px solid #e4dfd7;border-bottom:1px solid #e4dfd7}.lesson-reading-header dl div{display:grid;grid-template-columns:56px 1fr;gap:8px;padding:7px 9px;border-bottom:1px solid #eee9e1}.lesson-reading-header dl div:nth-last-child(-n+2){border-bottom:0}.lesson-reading-header dt{color:#9c2d09;font-size:.72rem;font-weight:600}.lesson-reading-header dd{margin:0;color:#4a443d;font-size:.78rem}.content .lesson-reading h3{margin:40px 0 11px;padding-top:0;color:#8f2b0c;font-size:1.42rem}.content .lesson-reading h4{margin:28px 0 8px;color:#333;font-size:1.08rem}.content .lesson-reading p{margin:10px 0;color:#2d2925;font-size:1rem;line-height:1.9}.content .lesson-reading blockquote{margin:24px 0;padding:30px 32px 21px 48px;font-size:1.08rem}.content .lesson-reading blockquote:before{left:16px;font-size:4.3rem}.lesson-reading .table-wrap{margin:20px 0}.lesson-reading table{min-width:600px;font-size:.85rem}.lesson-reading th,.lesson-reading td{padding:9px 11px}.lesson-reading ol,.lesson-reading ul{color:#2d2925;font-size:.98rem;line-height:1.85}.lesson-summary,.lesson-teaching,.lesson-application,.lesson-explanation{padding:10px 13px;border-left:2px solid #c87845;background:#fffaf3}.lesson-teaching{border-left-color:#245775;background:#f7fafb}.lesson-dialog[open]{animation:story-dialog-in .16s ease-out}
@media(max-width:850px){body{font-size:16px}.page.active{display:block}.side{position:relative;top:auto;height:auto;display:block;overflow:visible;padding:12px 18px;border-right:0;border-bottom:1px solid var(--line);background:#fbfaf7}.desktop-toc{display:none}.mobile-toc{display:block}.side a{border:0;border-bottom:1px solid #e5e1da;font-size:.82rem}main{padding:32px 20px 68px}.hero{padding:30px 20px 24px}.tabs{gap:22px}.content h3{margin-top:46px}.content p{font-size:1rem;line-height:1.9}.content blockquote{padding:40px 24px 24px 42px;font-size:1.05rem}.content blockquote:before{left:14px;font-size:4.5rem}}
@media(max-width:700px){.editorial-map{margin:30px -4px;padding:24px 14px}.editorial-map figcaption strong{font-size:1.18rem}.dialogue-pair{grid-template-columns:1fr;gap:8px}.relation-line{width:120px;margin:auto;transform:rotate(90deg)}.branch-grid{grid-template-columns:1fr}.branch-card:before{display:none}.family-split,.family-split.three{grid-template-columns:1fr;gap:26px;margin-top:28px;padding-top:0}.family-split:before,.family-split:after,.family-branch:before{display:none}.siblings{grid-template-columns:1fr}.level-three{grid-template-columns:1fr;gap:18px;padding-top:0}.level-three:before,.level-three>div:before{display:none}.map-node{width:min(100%,280px);margin:auto}.map-legend{align-items:flex-start;flex-direction:column}.diagram-source pre{font-size:.72rem}.pandava-map .family-split>div:not(.family-branch){margin-bottom:4px}.verse-entry{display:block;padding-bottom:34px;margin-bottom:30px}.verse-rail{display:flex;align-items:center;gap:9px;margin-bottom:10px;padding:0;border:0;text-align:left}.verse-rail span{font-size:1.08rem}.verse-rail small{margin:0}.verse-header{display:block;margin-bottom:12px}.verse-header h3{font-size:1.35rem}.verse-reference{margin-top:4px}.verse-context{grid-template-columns:1fr 1fr}.verse-context .context-wide{grid-column:1/-1;border-top:1px solid #e2dcd3}.verse-context>div:nth-child(2){border-right:0}.verse-context>div{padding:7px 8px}.verse-text{padding:18px 20px;font-size:1.05rem}}
@media(max-width:700px){.skandha-overview ol{grid-template-columns:1fr}.story-toolbar{top:48px;display:block}.story-view-toggle{margin-bottom:8px}.story-search-label{display:block;width:100%}.story-table,.story-table tbody,.story-table tr,.story-table td{display:block;width:100%}.story-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.story-table .story-group-row{display:block}.story-table .story-group-row th{display:block}.story-table .story-row{padding:13px 0;border-bottom:1px solid #ded8cf}.story-table .story-row td{display:grid;grid-template-columns:100px 1fr;gap:10px;padding:5px 8px;border:0}.story-table .story-row td:before{content:attr(data-label);color:#9c2d09;font-size:.7rem;font-weight:600}.story-table .story-row td>*{min-width:0}.story-title-button,.story-summary-button{font-size:.9rem}.story-dialog,.lesson-dialog{width:100%;max-width:none;max-height:100%;height:100%;border:0;border-radius:0}.story-dialog-inner,.lesson-dialog-shell{min-height:100%;padding:28px 20px 38px}.story-dialog-close,.lesson-dialog-close{margin:-16px 0 8px 12px}.story-dialog h3{font-size:1.45rem}.story-detail-section p{font-size:.95rem}.story-side-nav{grid-template-columns:repeat(3,1fr)}.story-side-nav button{text-align:center;border-left:0;border-bottom:2px solid transparent}.story-side-nav button.active{border-left:0;border-bottom-color:#a8320c}.story-section-tabs{gap:18px}.lesson-open{grid-template-columns:22px minmax(0,1fr);gap:9px;padding:17px 3px}.lesson-card-arrow{display:none}.lesson-card-title{font-size:1.02rem}.lesson-reading-header dl{grid-template-columns:1fr}.lesson-reading-header dl div:nth-last-child(2){border-bottom:1px solid #eee9e1}.content .lesson-reading h3{font-size:1.28rem}.content .lesson-reading p{font-size:.95rem}.lesson-reading table{min-width:520px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.skip-link{transition:none}.story-dialog[open],.lesson-dialog[open]{animation:none}}
@media print{@page{margin:18mm 16mm}body{background:#fff!important;color:#000;font-size:11pt}.skip-link,.tabs,.side{display:none!important}.hero{padding:0 0 8mm;border:0;background:#fff}.eyebrow{font-size:9pt}.hero h1{font-size:26pt}.page{display:none!important}.page.active{display:block!important;max-width:none}.page.active main{padding:0;background:#fff}.content{max-width:none}.content h2,.content h3,.content h4{color:#000;break-after:avoid}.content p,.content li,.content td{color:#111}.content blockquote,.diagram-wrap,.editorial-map,.table-wrap,table,tr{break-inside:avoid;box-shadow:none}.content blockquote{border:1px solid #aaa;color:#111;background:#fff}.diagram-wrap,.editorial-map,.table-wrap{overflow:visible;border-color:#aaa;background:#fff}.diagram{min-width:0;white-space:pre-wrap;color:#111;background:#fff}.diagram-source{display:none}.map-node,.branch-card{background:#fff}table{min-width:0;font-size:9pt}th{color:#000;background:#eee}footer{padding:8mm 0 0;background:#fff;color:#444}}
</style>
</head>
<body>
<a class="skip-link" id="skip-link" href="#main-0">মূল লেখায় যান</a>
<header class="hero"><div class="eyebrow">শ্রবণ • কীর্তন • স্মরণ • ভক্তি</div><h1>শ্রীমদ্ভাগবত মহাপুরাণ</h1></header>
<nav class="tabs" id="tabs" role="tablist" aria-label="প্রধান বিভাগ">${rendered.map((x,i)=>`<button class="tab ${i===0?"active":""}" id="tab-${i}" role="tab" aria-selected="${i===0}" aria-controls="page-${i}" tabindex="${i===0?0:-1}" data-tab="${i}">${x.title}</button>`).join("")}</nav>
<div id="pages">${rendered.map((x,i)=>`<section class="page ${i===0?"active":""}" id="page-${i}" role="tabpanel" aria-labelledby="tab-${i}" ${i===0?"":"hidden"}><aside class="side" aria-label="এই বিভাগের সূচি">${x.storyModule?`<div data-story-skandha-nav><div class="side-title">১২ স্কন্ধ</div><nav class="story-side-nav" aria-label="স্কন্ধ নির্বাচন">${storyIntegration.skandhas.map((item,index)=>`<button type="button" class="${index===0?"active":""}" data-select-skandha="${item.number}" aria-pressed="${index===0}">${item.ordinal} স্কন্ধ</button>`).join("")}</nav></div>`:`<div class="desktop-toc"><div class="side-title">এই বিভাগের সূচি</div><input class="search" type="search" aria-label="এই বিভাগে খুঁজুন" placeholder="এই বিভাগে খুঁজুন…" data-search="${i}">${x.nav.map(n=>`<a href="#${n.id}">${n.title}</a>`).join("")}</div><details class="mobile-toc"><summary>এই বিভাগের সূচি</summary><div class="mobile-toc-links"><input class="search" type="search" aria-label="এই বিভাগে খুঁজুন" placeholder="এই বিভাগে খুঁজুন…" data-search="${i}">${x.nav.map(n=>`<a href="#${n.id}">${n.title}</a>`).join("")}</div></details>`}</aside><main class="main-content" id="main-${i}" tabindex="-1"><article class="content" data-content="${i}">${x.html}</article></main></section>`).join("")}</div>
<footer>॥ ওঁ নমো ভগবতে বাসুদেবায় ॥<br>ঘটনার কালক্রম ও কথনের কালক্রম ইচ্ছাকৃতভাবে আলাদা রাখা হয়েছে।</footer>
<script>
const storyData=${JSON.stringify(storyIntegration).replace(/</g, "\\u003c")};
const tabs=[...document.querySelectorAll('[role="tab"]')];
const pages=[...document.querySelectorAll('[role="tabpanel"]')];
const skipLink=document.getElementById('skip-link');
let tocObserver;

function activateTab(index,{focus=false,scrollTop=false}={}){
  tabs.forEach((tab,i)=>{
    const active=i===index;
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
  if(focus)tabs[index].focus();
  if(scrollTop)window.scrollTo({top:document.querySelector('.tabs').offsetTop,behavior:'smooth'});
  requestAnimationFrame(observeActivePage);
}

function pageIndexFor(element){return pages.findIndex(page=>page.contains(element))}

function openHash(scroll=true){
  const id=decodeURIComponent(location.hash.slice(1));
  if(!id)return false;
  const target=document.getElementById(id);
  if(!target)return false;
  const index=pageIndexFor(target);
  if(index>=0)activateTab(index);
  if(id==='detailed-lessons-title'||id.startsWith('lesson-'))setStoryMode('lessons',false);
  const storyPanel=target.closest('[data-skandha-panel]');
  if(storyPanel){setStoryMode('stories',false);selectStorySkandha(Number(storyPanel.dataset.skandhaPanel),false)}
  if(id.startsWith('story-s'))requestAnimationFrame(()=>openStory(id,true));
  if(id.startsWith('lesson-'))requestAnimationFrame(()=>openLesson(id,true));
  if(scroll)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  return true;
}

tabs.forEach((button,i)=>{
  button.addEventListener('click',()=>activateTab(i,{scrollTop:true}));
  button.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%tabs.length;
    if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next===undefined)return;
    event.preventDefault();
    activateTab(next,{focus:true,scrollTop:true});
  });
});

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
  children.forEach(el=>el.classList.toggle('hidden-by-search',!el.innerText.toLocaleLowerCase('bn').includes(q)));
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
const lessonDialog=document.getElementById('lesson-dialog');
let activeStorySkandha=1;
let activeStoryView='story';
let activeStoryMode='stories';
let storyReturnFocus=null;
let lessonReturnFocus=null;

function setStoryMode(mode,updateHash=true){
  activeStoryMode=mode;
  document.querySelectorAll('[data-story-mode]').forEach(button=>{
    const active=button.dataset.storyMode===mode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-story-mode-panel]').forEach(panel=>{panel.hidden=panel.dataset.storyModePanel!==mode});
  document.querySelectorAll('[data-story-skandha-nav]').forEach(nav=>{nav.hidden=mode!=='stories'});
  if(updateHash)history.replaceState(null,'',mode==='lessons'?'#detailed-lessons-title':'#stories-skandha-'+activeStorySkandha);
}

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
  setStoryMode('stories',false);
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

function openLesson(id,updateHash=true){
  const entry=document.getElementById(id);
  const template=document.getElementById('template-'+id);
  if(!entry||!template||!lessonDialog)return;
  setStoryMode('lessons',false);
  lessonReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const content=document.getElementById('lesson-dialog-content');
  content.replaceChildren(template.content.cloneNode(true));
  if(updateHash)history.replaceState(null,'','#'+id);
  if(!lessonDialog.open)lessonDialog.showModal();
  lessonDialog.querySelector('.lesson-dialog-close').focus();
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
document.querySelectorAll('[data-story-mode]').forEach(button=>button.addEventListener('click',()=>setStoryMode(button.dataset.storyMode)));
document.addEventListener('click',event=>{
  const lessonOpener=event.target.closest('[data-lesson]');
  if(lessonOpener){openLesson(lessonOpener.dataset.lesson);return}
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
if(lessonDialog){
  lessonDialog.querySelector('.lesson-dialog-close').addEventListener('click',()=>lessonDialog.close());
  lessonDialog.addEventListener('click',event=>{if(event.target===lessonDialog)lessonDialog.close()});
  lessonDialog.addEventListener('close',()=>{
    history.replaceState(null,'','#detailed-lessons-title');
    if(lessonReturnFocus&&document.contains(lessonReturnFocus))lessonReturnFocus.focus();
  });
}

window.addEventListener('hashchange',()=>openHash(true));
if(!openHash(false))activateTab(0);
else requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'start'}));
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "srimad_bhagavatam_bengali_explorer.html"), html, "utf8");
console.log(JSON.stringify({ chapters: rendered.length, detailedLessons: detailedLessons.length, sourceCharacters: chapters.reduce((n,x)=>n+x.markdown.length,0), outputBytes: Buffer.byteLength(html) }, null, 2));
