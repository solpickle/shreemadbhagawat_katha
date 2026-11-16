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
const primaryTabOrder = [...html.matchAll(/<button class="tab [^"]*" id="tab-\d+"[^>]*>([^<]+)<\/button>/g)].map(match => match[1]);
assert(primaryTabOrder[0] === "পরিচয়" && primaryTabOrder[1] === "বিশদ পাঠ", "বিশদ পাঠ must follow পরিচয় in the primary tab order");

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
const chotushlokiPath = 'articles/chotushloki-bhagavat.html';
assert(html.includes(`href="${chotushlokiPath}"`), 'চতুঃশ্লোকী standalone article link is missing from the library');
const chotushloki = fs.readFileSync(chotushlokiPath, 'utf8');
assert(chotushloki.includes('<html lang="bn">'), 'চতুঃশ্লোকী article must use Bengali document language');
assert(chotushloki.includes('পর্ব ২: চতুঃশ্লোকী ভাগবত'), 'চতুঃশ্লোকী article title is missing');
assert(chotushloki.includes('ব্রহ্মার জিজ্ঞাসা, ভগবানের উপদেশ এবং সৃষ্টি, মায়া ও পরমসত্যের রহস্য'), 'চতুঃশ্লোকী article deck is missing');
assert(chotushloki.includes('শ্রীমদ্ভাগবত ২.৯.৩৩–৩৬'), 'চতুঃশ্লোকী scripture reference is missing');
assert(!/class="porichoy-[^"]+"/.test(chotushloki), 'Porichoy-only classes leaked into the standalone article');
for (const verse of ['অহমেবাসমেবাগ্রে', 'ঋতেঽর্থং যৎ প্রতীয়েত', 'যথা মহান্তি ভূতানি', 'এতাবদেব জিজ্ঞাস্যং']) {
  assert(chotushloki.includes(verse), `A Chatuḥśloki verse is missing: ${verse}`);
}
assert(chotushloki.includes('../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title'), 'চতুঃশ্লোকী return link is missing');
const chotushlokiIds = [...chotushloki.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert(new Set(chotushlokiIds).size === chotushlokiIds.length, 'Duplicate চতুঃশ্লোকী article anchor IDs');
const chotushlokiToc = chotushloki.match(/<aside class="article-toc"[\s\S]*?<nav>([\s\S]*?)<\/nav>/);
assert(chotushlokiToc && (chotushlokiToc[1].match(/<a href="#chotushloki-section-/g) || []).length === 17, 'চতুঃশ্লোকী article table of contents is incomplete');
const chotushlokiLinks = [...chotushloki.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
chotushlokiLinks.forEach(link => {
  if (/^https?:/.test(link)) return;
  if (link.startsWith('#')) {
    if (link.length > 1) assert(chotushlokiIds.includes(link.slice(1)), `চতুঃশ্লোকী article anchor target missing: ${link}`);
    return;
  }
  const file = decodeURIComponent(link.split('#')[0]);
  assert(fs.existsSync(path.resolve(path.dirname(chotushlokiPath), file)), `চতুঃশ্লোকী article asset or return target missing: ${link}`);
});
const chotushlokiScript = chotushloki.match(/<script>([\s\S]*?)<\/script>/);
assert(chotushlokiScript, 'চতুঃশ্লোকী reading progress script is missing');
new Function(chotushlokiScript[1]);
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
const quizCards = (article.match(/class="quiz-card"/g) || []).length;
const quizAnswers = (article.match(/data-correct="true"/g) || []).length;
assert(quizCards === 5, `Expected 5 article quiz cards, found ${quizCards}`);
assert(quizAnswers === 5, `Expected exactly one correct answer per quiz card, found ${quizAnswers}`);
const figureContexts = (article.match(/class="figure-context"/g) || []).length;
assert(figureContexts === 9, `Expected 9 repaired figure captions, found ${figureContexts}`);
assert(!/<(?:h[2-4]|p)[^>]*>\d+\./.test(article), 'Arabic display numbering remains in article headings or paragraphs');
const articleCss = fs.readFileSync('assets/article.css', 'utf8');
assert(articleCss.includes('@counter-style bengali-numerals'), 'Bengali ordered-list numbering style is missing');
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
  chotushlokiArticle: { anchors: chotushlokiIds.length, verses: 4, links: 'valid' },
  standaloneArticle: { parts: 8, illustrations: articleImages, quizCards, repairedCaptions: figureContexts, numbering: 'Bengali', links: 'valid' },
}, null, 2));
