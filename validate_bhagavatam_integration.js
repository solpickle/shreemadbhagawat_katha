const fs = require("fs");
const path = require("path");

const specification = fs.readFileSync(path.join(__dirname, "..", "BHAGAVATAM_CODEX_INTEGRATION.md"), "utf8").replace(/\r\n/g, "\n");
const html = fs.readFileSync(path.join(__dirname, "srimad_bhagavatam_bengali_explorer.html"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function section(start, end) {
  const from = specification.indexOf(start);
  const to = specification.indexOf(end, from + start.length);
  assert(from >= 0 && to >= 0, `Section boundary missing: ${start}`);
  return specification.slice(from, to);
}

const embeddedMatch = html.match(/const storyData=([\s\S]*?);\r?\nconst tabs=/);
assert(embeddedMatch, "Embedded structured story data not found");
const embedded = JSON.parse(embeddedMatch[1]);

assert(embedded.skandhas.length === 12, `Expected 12 skandhas, found ${embedded.skandhas.length}`);
assert(embedded.storyCount === 110, `Expected 110 stories, found ${embedded.storyCount}`);
assert(embedded.details.length === 23, `Expected 23 expanded cards, found ${embedded.details.length}`);

const sourceRows = [];
let currentSkandha = 0;
for (const line of section("# 5. LOCKED CONTENT", "# 6. LOCKED EXTRA STORY-CARD CONTENT").split("\n")) {
  const heading = line.match(/^##\s+([০-৯]+)(?:ম|য়|র্থ|ষ্ঠ|তম)\s+স্কন্ধ/);
  if (heading) currentSkandha += 1;
  if (!currentSkandha || !line.startsWith("|") || /^\|[-|]+\|$/.test(line) || line.includes("ঘটনা ও অধ্যায়") || line.includes("| আলোচনা |") || line.includes("| মূল শিক্ষা |")) continue;
  const cells = line.replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
  if (cells.length === 2 || cells.length === 3) sourceRows.push({ skandha: currentSkandha, cells });
}

const embeddedRows = embedded.skandhas.flatMap(skandha => skandha.stories.map(story => ({ skandha: skandha.number, cells: story.sourceCells, story })));
assert(sourceRows.length === 110, `Specification row scan found ${sourceRows.length}, expected 110`);
assert(embeddedRows.length === sourceRows.length, "Embedded and source row totals differ");
sourceRows.forEach((row, index) => {
  const actual = embeddedRows[index];
  assert(actual.skandha === row.skandha, `Skandha/order mismatch at source row ${index + 1}`);
  assert(JSON.stringify(actual.cells) === JSON.stringify(row.cells), `Locked text mismatch at source row ${index + 1}`);
  assert(html.includes(`id="${actual.story.id}"`), `Clickable story row missing from HTML: ${actual.story.id}`);
});

const detailSection = section("# 6. LOCKED EXTRA STORY-CARD CONTENT", "# 7. ১২ স্কন্ধের এক-বাক্যের স্মরণসূত্র");
embedded.details.forEach(detail => {
  const heading = `## বিস্তারিত কার্ড: ${detail.title}`;
  assert(detailSection.includes(heading), `Expanded-card heading missing in source: ${detail.title}`);
  [detail.background, detail.narrative, detail.takeaway, detail.memoryHook].forEach(value => {
    assert(detailSection.includes(value), `Expanded-card text mismatch: ${detail.title}`);
  });
});

assert((html.match(/<button class="tab [^"]*" id="tab-/g) || []).length === 5, "Existing tab set was not preserved with one added tab");
assert(html.includes(">গল্প ও শিক্ষা</button>"), "New tab label missing");
assert(html.includes("গল্পের সারাংশ ও শিক্ষামূলক ব্যাখ্যা; মূল শ্লোকের বিকল্প নয়।"), "Required story-card note missing");

const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
assert(scriptMatch, "Generated browser script missing");
new Function(scriptMatch[1]);

console.log(JSON.stringify({
  skandhas: embedded.skandhas.length,
  stories: embedded.storyCount,
  expandedCards: embedded.details.length,
  exactSourceRowsChecked: sourceRows.length,
  browserScriptSyntax: "valid",
  tabs: 5,
}, null, 2));
