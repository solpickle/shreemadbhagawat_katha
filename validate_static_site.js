const fs = require("fs");

const htmlPath = "srimad_bhagavatam_bengali_explorer.html";
const html = fs.readFileSync(htmlPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.startsWith("<!DOCTYPE html>"), "Main HTML document is missing its doctype");
assert(html.includes('<html lang="bn">'), "Bengali document language is missing");
assert(html.includes(">গল্প ও শিক্ষা</button>"), "গল্প ও শিক্ষা tab is missing");
assert((html.match(/<button class="tab [^"]*" id="tab-/g) || []).length === 5, "Expected five primary tabs");

const embeddedMatch = html.match(/const storyData=([\s\S]*?);\r?\nconst tabs=/);
assert(embeddedMatch, "Embedded story data is missing");
const storyData = JSON.parse(embeddedMatch[1]);
assert(storyData.skandhas.length === 12, `Expected 12 skandhas, found ${storyData.skandhas.length}`);
assert(storyData.storyCount === 110, `Expected 110 stories, found ${storyData.storyCount}`);
assert(storyData.details.length === 23, `Expected 23 expanded cards, found ${storyData.details.length}`);

const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
assert(scriptMatch, "Generated browser script is missing");
new Function(scriptMatch[1]);

const requiredFonts = [400, 500, 600, 700].map(weight => `assets/fonts/NotoSerifBengali-${weight}.ttf`);
requiredFonts.forEach(font => assert(fs.existsSync(font), `Required font is missing: ${font}`));

console.log(JSON.stringify({
  html: htmlPath,
  tabs: 5,
  skandhas: storyData.skandhas.length,
  stories: storyData.storyCount,
  expandedCards: storyData.details.length,
  browserScriptSyntax: "valid",
  fonts: requiredFonts.length,
}, null, 2));
