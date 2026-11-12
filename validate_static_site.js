const fs = require("fs");
const path = require("path");

const htmlPath = "srimad_bhagavatam_bengali_explorer.html";
const html = fs.readFileSync(htmlPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.startsWith("<!DOCTYPE html>"), "Main HTML document is missing its doctype");
assert(html.includes('<html lang="bn">'), "Bengali document language is missing");
assert(html.includes(">গল্প ও শিক্ষা</button>"), "গল্প ও শিক্ষা tab is missing");
assert(html.includes('data-tab="5">বিশদ পাঠ</button>'), "বিশদ পাঠ primary tab is missing");
assert((html.match(/<button class="tab [^"]*" id="tab-/g) || []).length === 6, "Expected six primary tabs");

const embeddedMatch = html.match(/const storyData=([\s\S]*?);\r?\nconst tabs=/);
assert(embeddedMatch, "Embedded story data is missing");
const storyData = JSON.parse(embeddedMatch[1]);
assert(storyData.skandhas.length === 12, `Expected 12 skandhas, found ${storyData.skandhas.length}`);
assert(storyData.storyCount === 110, `Expected 110 stories, found ${storyData.storyCount}`);
assert(storyData.details.length === 23, `Expected 23 expanded cards, found ${storyData.details.length}`);

const detailedLessons = (html.match(/class="lesson-entry"/g) || []).length;
assert(detailedLessons >= 1, "Expected at least one detailed lesson");
assert(html.includes("ব্রহ্মার প্রার্থনা — কর্ম করব, কিন্তু কর্তার অহংকার যেন না আসে"), "Detailed lesson title is missing");
assert(!html.includes("data-story-mode"), "বিশদ পাঠ must not remain nested under গল্প ও শিক্ষা");
assert(html.includes("◆"), "Detailed-lesson importance mark is missing");
assert(!html.includes("ওয়েবসাইটে সংযোজনের নির্দেশ"), "Implementation instructions leaked into the website");

const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
assert(scriptMatch, "Generated browser script is missing");
new Function(scriptMatch[1]);

const requiredFonts = [400, 500, 600, 700].map(weight => `assets/fonts/NotoSerifBengali-${weight}.ttf`);
requiredFonts.forEach(font => assert(fs.existsSync(font), `Required font is missing: ${font}`));

const articlePath = 'articles/vishnu-cosmology.html';
assert(html.includes(`href="${articlePath}"`), 'Standalone article link is missing from the library');
const article = fs.readFileSync(articlePath, 'utf8');
assert(article.includes('<html lang="bn">'), 'Article must use Bengali document language');
assert((article.match(/class="article-part"/g) || []).length === 8, 'Expected eight complete article parts');
assert(article.includes('../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title'), 'Article return link is missing');
assert(!article.includes('images.openai.com') && !article.includes('google.com/s2/favicons'), 'Chat export image links leaked into the article');
const articleIds = [...article.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert(new Set(articleIds).size === articleIds.length, 'Duplicate article anchor IDs');
const articleLinks = [...article.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
articleLinks.forEach(link => {
  if (/^https?:/.test(link)) return;
  if (link.startsWith('#')) {
    if (link.length > 1) assert(articleIds.includes(link.slice(1)), `Article anchor target missing: ${link}`);
    return;
  }
  const file = decodeURIComponent(link.split('#')[0]);
  assert(fs.existsSync(path.resolve(path.dirname(articlePath), file)), `Article asset or return target missing: ${link}`);
});
const articleImages = (article.match(/<img /g) || []).length;
assert(articleImages === 22, `Expected 22 article illustrations, found ${articleImages}`);
const articleScript = article.match(/<script>([\s\S]*?)<\/script>/);
new Function(articleScript[1]);

console.log(JSON.stringify({
  html: htmlPath,
  tabs: 6,
  skandhas: storyData.skandhas.length,
  stories: storyData.storyCount,
  expandedCards: storyData.details.length,
  detailedLessons,
  browserScriptSyntax: "valid",
  fonts: requiredFonts.length,
  standaloneArticle: { parts: 8, illustrations: articleImages, links: 'valid' },
}, null, 2));
