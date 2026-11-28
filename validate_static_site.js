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
assert((html.match(/<button class="tab [^"]*" id="tab-/g) || []).length === 7, "Expected seven primary tabs");
const primaryTabOrder = [...html.matchAll(/<button class="tab [^"]*" id="tab-\d+"[^>]*>([^<]+)<\/button>/g)].map(match => match[1]);
assert(primaryTabOrder[0] === "পরিচয়" && primaryTabOrder[1] === "বিশদ পাঠ", "বিশদ পাঠ must follow পরিচয় in the primary tab order");
assert(primaryTabOrder[2] === "জীবনদর্শন", "জীবনদর্শন must follow বিশদ পাঠ in the primary tab order");
assert(html.includes('href="articles/shikha-porbo-1-mon-kapilmuni.html"'), "শিক্ষাপর্ব ১ must open as an independent article");
assert(html.includes('id="shikha-title">জীবনদর্শন</h2>'), "জীবনদর্শন tab heading is missing");
assert(html.includes("শ্রীমদ্ভাগবত কেবল ভক্তির গ্রন্থ নয়, মানুষের মন, সম্পর্ক, আকাঙ্ক্ষা, কর্তব্য ও জীবনের গভীর অর্থ উপলব্ধি করারও এক অনন্য উৎস।"), "জীবনদর্শন introduction is missing");
assert(html.includes("এই বিভাগে আমরা ভাগবতের প্রজ্ঞার আলোকে নিজেদের জীবনকে আরও সুন্দর, শান্ত ও অর্থপূর্ণ করে তোলার পথ অনুসন্ধান করব।"), "জীবনদর্শন introduction is incomplete");

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
assert(!html.includes('id="lesson-dialog"') && !html.includes('data-lesson="'), "Detailed lessons should open as independent articles, not dialogs");
assert(!html.includes("ওয়েবসাইটে সংযোজনের নির্দেশ"), "Implementation instructions leaked into the website");
const lessonList = html.match(/<div class="lesson-list">([\s\S]*?)<\/div><p class="lesson-empty"/);
assert(lessonList, "বিশদ পাঠ list could not be located");
const lessonListLinks = [...lessonList[1].matchAll(/href="(articles\/[^\"]+\.html)"/g)].map(match => match[1]);
const orderIndexes = [
  lessonListLinks.indexOf('articles/chotushloki-bhagavat.html'),
  lessonListLinks.indexOf('articles/krishna-vishnu-tattva.html'),
  lessonListLinks.indexOf('articles/vishnu-cosmology.html'),
  lessonListLinks.findIndex(link => /lesson-s03-c09/.test(link)),
];
assert(orderIndexes.every(index => index >= 0) && orderIndexes.every((index, i) => i === 0 || orderIndexes[i - 1] < index), 'বিশদ পাঠ order must keep Parts 2–3 first, thematic readings next, and Brahma’s lesson last');

const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
assert(scriptMatch, "Generated browser script is missing");
new Function(scriptMatch[1]);

const requiredFonts = [400, 500, 600, 700].map(weight => `assets/fonts/NotoSerifBengali-${weight}.ttf`);
requiredFonts.forEach(font => assert(fs.existsSync(font), `Required font is missing: ${font}`));

const articlePath = 'articles/vishnu-cosmology.html';
assert(html.includes(`href="${articlePath}"`), 'Standalone article link is missing from the library');
const shikhaPath = 'articles/shikha-porbo-1-mon-kapilmuni.html';
assert(html.includes(`href="${shikhaPath}"`), 'শিক্ষাপর্ব ১ independent article link is missing');
const shikha = fs.readFileSync(shikhaPath, 'utf8');
assert(shikha.includes('<body class="series-article series-article-shikha1 series-article-shikha">'), 'শিক্ষাপর্ব ১ must use the editorial standalone article layout');
assert(shikha.includes('class="toc-number"') && shikha.includes('class="toc-title"'), 'শিক্ষাপর্ব ১ contents links need explicit number and title elements');
assert(shikha.includes('#shikha-title'), 'শিক্ষাপর্ব ১ return link must reopen the শিক্ষা tab');
assert(shikha.includes('id="shikha1-section-'), 'শিক্ষাপর্ব ১ section anchors are missing');
assert(shikha.includes('href="../assets/article.css?v=jibondorshon-20261128-2"'), 'শিক্ষাপর্ব ১ must use the shared editorial stylesheet');
const shikhaScript = shikha.match(/<script>([\s\S]*?)<\/script>/);
assert(shikhaScript, 'শিক্ষাপর্ব ১ reading controls are missing');
new Function(shikhaScript[1]);
const shikha2Path = 'articles/shikha-porbo-2-dhruva-jibon.html';
assert(html.includes(`href="${shikha2Path}"`), 'শিক্ষাপর্ব ২ independent article link is missing from জীবনদর্শন');
assert(html.indexOf(`href="${shikhaPath}"`) < html.indexOf(`href="${shikha2Path}"`), 'জীবনদর্শনের পাঠগুলি শিক্ষাপর্ব অনুযায়ী সাজাতে হবে');
const shikha2 = fs.readFileSync(shikha2Path, 'utf8');
assert(shikha2.includes('<body class="series-article series-article-shikha2 series-article-shikha">'), 'শিক্ষাপর্ব ২ must use the shared জীবনদর্শন article layout');
assert(shikha2.includes('শিক্ষাপর্ব ২: অপমান থেকে আত্মোন্নয়ন — ধ্রুবের জীবন'), 'শিক্ষাপর্ব ২ title is missing');
assert(shikha2.includes('class="toc-number"') && shikha2.includes('class="toc-title"'), 'শিক্ষাপর্ব ২ contents links need explicit number and title elements');
assert(shikha2.includes('href="../srimad_bhagavatam_bengali_explorer.html#shikha-title"'), 'শিক্ষাপর্ব ২ return link must reopen জীবনদর্শন');
assert(shikha2.includes('id="shikha2-section-'), 'শিক্ষাপর্ব ২ section anchors are missing');
assert(shikha2.includes('href="../assets/article.css?v=jibondorshon-20261128-2"'), 'শিক্ষাপর্ব ২ must use the shared editorial stylesheet');
const shikha2Script = shikha2.match(/<script>([\s\S]*?)<\/script>/);
assert(shikha2Script, 'শিক্ষাপর্ব ২ reading controls are missing');
new Function(shikha2Script[1]);
const chotushlokiPath = 'articles/chotushloki-bhagavat.html';
assert(html.includes(`href="${chotushlokiPath}"`), 'চতুঃশ্লোকী standalone article link is missing from the library');
const krishnaVishnuPath = 'articles/krishna-vishnu-tattva.html';
assert(html.includes(`href="${krishnaVishnuPath}"`), 'কৃষ্ণ-বিষ্ণুতত্ত্ব standalone article link is missing from the library');
assert(html.includes('ধারাবাহিক পাঠ · পর্ব ৩'), 'পর্ব ৩ article card is missing from বিশদ পাঠ');
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

const krishnaVishnu = fs.readFileSync(krishnaVishnuPath, 'utf8');
assert(krishnaVishnu.includes('<html lang="bn">'), 'কৃষ্ণ-বিষ্ণুতত্ত্ব article must use Bengali document language');
assert(krishnaVishnu.includes('পর্ব ৩: শ্রীকৃষ্ণ থেকে নারায়ণ ও তিন বিষ্ণু'), 'কৃষ্ণ-বিষ্ণুতত্ত্ব article title is missing');
assert(krishnaVishnu.includes('গোলোক বৃন্দাবন থেকে অসংখ্য ব্রহ্মাণ্ড'), 'কৃষ্ণ-বিষ্ণুতত্ত্ব article deck is missing');
assert(krishnaVishnu.includes('../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title'), 'কৃষ্ণ-বিষ্ণুতত্ত্ব return link is missing');
for (const passage of ['কৃষ্ণস্তু ভগবান্ স্বয়ম্', 'যস্যৈকনিশ্বসিতকালমথাবলম্ব্য', 'ঈশ্বরঃ সর্বভূতানাং', 'শ্রীকৃষ্ণ — স্বয়ং ভগবান', 'ক্ষীরোদকশায়ী বিষ্ণু', 'এই বিন্যাস গৌড়ীয় বৈষ্ণব পরম্পরার একটি শিক্ষামূলক সংক্ষিপ্ত রূপ।', 'শাস্ত্রীয় সূত্র ও আরও পাঠ']) {
  assert(krishnaVishnu.includes(passage), `কৃষ্ণ-বিষ্ণুতত্ত্ব article content is missing: ${passage}`);
}
assert((krishnaVishnu.match(/class="krishna-map-node(?:\s|\")/g) || []).length === 9, 'কৃষ্ণ-বিষ্ণুতত্ত্ব expansion map must contain all nine source nodes');
assert((krishnaVishnu.match(/<table>/g) || []).length === 2, 'কৃষ্ণ-বিষ্ণুতত্ত্ব comparison tables are missing');
assert((krishnaVishnu.match(/<blockquote/g) || []).length === 5, 'কৃষ্ণ-বিষ্ণুতত্ত্ব scripture quotations are missing');
const krishnaVishnuIds = [...krishnaVishnu.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert(new Set(krishnaVishnuIds).size === krishnaVishnuIds.length, 'Duplicate কৃষ্ণ-বিষ্ণুতত্ত্ব article anchor IDs');
const krishnaVishnuToc = krishnaVishnu.match(/<aside class="article-toc"[\s\S]*?<nav>([\s\S]*?)<\/nav>/);
assert(krishnaVishnuToc && (krishnaVishnuToc[1].match(/<a href="#krishnavishnu-section-/g) || []).length === 23, 'কৃষ্ণ-বিষ্ণুতত্ত্ব article table of contents is incomplete');
const krishnaVishnuLinks = [...krishnaVishnu.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
krishnaVishnuLinks.forEach(link => {
  if (/^https?:/.test(link)) return;
  if (link.startsWith('#')) {
    if (link.length > 1) assert(krishnaVishnuIds.includes(link.slice(1)), `কৃষ্ণ-বিষ্ণুতত্ত্ব article anchor target missing: ${link}`);
    return;
  }
  const file = decodeURIComponent(link.split('#')[0]);
  assert(fs.existsSync(path.resolve(path.dirname(krishnaVishnuPath), file)), `কৃষ্ণ-বিষ্ণুতত্ত্ব article asset or return target missing: ${link}`);
});
const krishnaVishnuScript = krishnaVishnu.match(/<script>([\s\S]*?)<\/script>/);
assert(krishnaVishnuScript, 'কৃষ্ণ-বিষ্ণুতত্ত্ব reading progress script is missing');
new Function(krishnaVishnuScript[1]);

const brahmaPath = lessonListLinks.find(link => /lesson-s03-c09/.test(link));
assert(brahmaPath, 'ব্রহ্মার প্রার্থনা standalone article link is missing');
const brahma = fs.readFileSync(brahmaPath, 'utf8');
assert(brahma.includes('<html lang="bn">'), 'ব্রহ্মার প্রার্থনা article must use Bengali document language');
assert(brahma.includes('ব্রহ্মার প্রার্থনা — কর্ম করব, কিন্তু কর্তার অহংকার যেন না আসে'), 'ব্রহ্মার প্রার্থনা article title is missing');
assert(brahma.includes('শ্রীমদ্ভাগবত · স্কন্ধ ৩ · অধ্যায় ৯ · শ্লোক ৯–২৫'), 'ব্রহ্মার প্রার্থনা scripture reference is missing');
assert(brahma.includes('গদ্যের সারার্থ') && brahma.includes('আমাদের জীবনে') && brahma.includes('নিজের কাছে তিনটি প্রশ্ন'), 'ব্রহ্মার প্রার্থনা lesson sections are incomplete');
assert(!brahma.includes('ওয়েবসাইটে সংযোজনের নির্দেশ'), 'ব্রহ্মার source implementation instructions leaked into the article');
assert(brahma.includes('../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title'), 'ব্রহ্মার প্রার্থনা return link is missing');
const brahmaIds = [...brahma.matchAll(/\bid="([^\"]+)"/g)].map(match => match[1]);
assert(new Set(brahmaIds).size === brahmaIds.length, 'Duplicate ব্রহ্মার প্রার্থনা article anchor IDs');
const brahmaToc = brahma.match(/<aside class="article-toc"[\s\S]*?<nav>([\s\S]*?)<\/nav>/);
assert(brahmaToc && (brahmaToc[1].match(/<a href="#lesson-s03-c09-section-/g) || []).length === 13, 'ব্রহ্মার প্রার্থনা article table of contents is incomplete');
const brahmaLinks = [...brahma.matchAll(/(?:src|href)="([^\"]+)"/g)].map(match => match[1]);
brahmaLinks.forEach(link => {
  if (/^https?:/.test(link)) return;
  if (link.startsWith('#')) {
    if (link.length > 1) assert(brahmaIds.includes(link.slice(1)), `ব্রহ্মার প্রার্থনা article anchor target missing: ${link}`);
    return;
  }
  const file = decodeURIComponent(link.split('#')[0]);
  assert(fs.existsSync(path.resolve(path.dirname(brahmaPath), file)), `ব্রহ্মার প্রার্থনা article asset or return target missing: ${link}`);
});
const brahmaScript = brahma.match(/<script>([\s\S]*?)<\/script>/);
assert(brahmaScript, 'ব্রহ্মার প্রার্থনা reading progress script is missing');
new Function(brahmaScript[1]);

console.log(JSON.stringify({
  html: htmlPath,
  tabs: primaryTabOrder.length,
  skandhas: storyData.skandhas.length,
  stories: storyData.storyCount,
  expandedCards: storyData.details.length,
  detailedLessons,
  browserScriptSyntax: "valid",
  fonts: requiredFonts.length,
  chotushlokiArticle: { anchors: chotushlokiIds.length, verses: 4, links: 'valid' },
  krishnaVishnuArticle: { anchors: krishnaVishnuIds.length, mapNodes: 9, comparisonTables: 2, scriptureQuotes: 5, links: 'valid' },
  brahmaArticle: { path: brahmaPath, anchors: brahmaIds.length, independentPage: true, links: 'valid' },
  standaloneArticle: { parts: 8, illustrations: articleImages, quizCards, repairedCaptions: figureContexts, numbering: 'Bengali', links: 'valid' },
}, null, 2));
