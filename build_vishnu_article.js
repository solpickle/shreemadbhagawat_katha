const fs = require('fs');
const path = require('path');

const title = 'কৃষ্ণ, বিষ্ণু ও শিবতত্ত্ব — সৃষ্টি, ধাম ও সময়ের ধারাবাহিক আলোচনা';
const articlePath = 'articles/vishnu-cosmology.html';
const entryId = 'vishnu-cosmology-article';
const sourceDirectory = path.join(__dirname, '..', 'vishnu_raw_conversation');
const partTitles = [
  'কৃষ্ণ, তিন বিষ্ণু ও তাঁদের ধাম',
  'বিষ্ণু, মহাবিষ্ণু ও নারায়ণ',
  'সৃষ্টিতত্ত্ব ও চতুর্দশ ভুবন',
  'যুগ, মন্বন্তর, কল্প ও প্রলয়',
  'আমাদের অবস্থান ও অবতারদের সময়রেখা',
  'ব্রহ্মা, বিষ্ণু ও শিবতত্ত্ব',
  'সদাশিব ও রুদ্রের আবির্ভাব',
  'কৈলাস, শিবলোক ও শক্তিতত্ত্ব',
];

// Match illustrations to their original position in each conversation turn.
// Null entries are image-search results for which no local illustration was supplied.
const imageMap = [
  [['karondokshayi_mohavishnu.jpg', 'কারণোদকশায়ী মহাবিষ্ণু'], ['gorbhodokshayi_vishnu.jpg', 'গর্ভোদকশায়ী বিষ্ণু'], ['khirodokshayi_vishnu.jpg', 'ক্ষীরোদকশায়ী বিষ্ণু']],
  [['shree_narayan.jpg', 'শ্রীনারায়ণ'], ['mahavishnu.jpg', 'মহাবিষ্ণু']],
  [['mahavishnu_nishah_theke_oshonkho_brahmanda.jpg', 'মহাবিষ্ণু ও অসংখ্য ব্রহ্মাণ্ড'], ['protiti_brohmande_gorvodokshayi_vishnur_probesh.jpg', 'ব্রহ্মাণ্ডে গর্ভোদকশায়ী বিষ্ণু'], ['brahmar_jonmo_o_bibhranti.jpg', 'পদ্মে ব্রহ্মার আবির্ভাব']],
  [null, null],
  [['prohlad_o_narasimha.jpg', 'প্রহ্লাদ ও নৃসিংহদেব'], ['bali_maharaj_n_bamandev.jpg', 'বলি মহারাজ ও বামনদেব'], ['shree_krishna_arjun.jpg', 'শ্রীকৃষ্ণ ও অর্জুন']],
  [['brahma.jpg', 'ব্রহ্মা'], ['vishnu.jpg', 'বিষ্ণু'], ['maheshwar.jpg', 'মহেশ্বর'], ['prachetader_proti_shib_er_upodesh.jpg', 'প্রাচেতাদের প্রতি শিবের উপদেশ'], null],
  [['sadashiv.jpg', 'সদাশিব'], ['shiv_maheshwar.jpg', 'ধ্যানরত শিব / মহেশ্বর'], ['Rudra.jpg', 'রুদ্রের আবির্ভাবের চিত্রায়ণ'], ['Brahma_r_kopal_theke_rudrer_jonmo.jpg', 'ব্রহ্মা ও চার কুমার']],
  [['parthib_kailash.jpg', 'পার্থিব কৈলাস'], ['dibya_kailash.jpg', 'শিব-পার্বতীর দিব্য কৈলাসের চিত্রায়ণ'], ['sadashivlok.jpg', 'সদাশিবের দিব্য প্রকাশের চিত্রায়ণ'], null],
];

const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bn = value => String(value).replace(/[0-9]/g, digit => '০১২৩৪৫৬৭৮৯'[digit]);
const plain = value => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, '').replace(/\*/g, '').replace(/\\/g, '');

function inline(value) {
  return escapeHtml(value.replace(/&#x20;/g, '').replace(/\\$/gm, '').replace(/(\d)\\\./g, '$1.'))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function localizeLeadingNumber(value) {
  return value.replace(/^(\d+)(\\?\.)/, (_, number, punctuation) => `${bn(number)}${punctuation.replace('\\', '')}`);
}

function figure(file, caption, manifest) {
  const image = path.join(sourceDirectory, file);
  if (!fs.existsSync(image)) throw new Error(`Missing local illustration: ${file}`);
  const target = path.join(__dirname, 'assets', 'images', 'vishnu', file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(image, target);
  manifest.add(file);
  // Read intrinsic JPEG dimensions without changing the user's originals.
  const data = fs.readFileSync(image);
  let width = 800, height = 600;
  for (let at = 2; at < data.length - 9;) {
    if (data[at] !== 0xff) { at++; continue; }
    const marker = data[at + 1];
    if ([0xc0, 0xc1, 0xc2].includes(marker)) { height = data.readUInt16BE(at + 5); width = data.readUInt16BE(at + 7); break; }
    if ([0xd8, 0xd9].includes(marker)) { at += 2; continue; }
    if (marker === 0xda) break;
    at += 2 + data.readUInt16BE(at + 2);
  }
  return `<figure class="article-figure"><img src="../assets/images/vishnu/${encodeURIComponent(file)}" alt="${escapeHtml(caption)}" width="${width}" height="${height}" loading="lazy" decoding="async"><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
}

function readSource() {
  return fs.readFileSync(path.join(sourceDirectory, 'raw_conversation.md'), 'utf8').replace(/\r\n/g, '\n');
}

function prepareParts(source, manifest) {
  return source.split(/\n---\n/).filter(part => part.trim()).map((part, index) => {
    let imageIndex = 0;
    const figures = [];
    const kept = [];
    const omitted = [];
    for (const line of part.split('\n')) {
      const trim = line.trim();
      if (/^\[.*\]\(https:\/\/images\.openai\.com\//.test(trim)) {
        const mapped = imageMap[index][imageIndex++];
        if (mapped) { const key = `ARTICLEFIGURE${figures.length}`; figures.push(figure(...mapped, manifest)); kept.push(key); }
        omitted.push({ reason: 'replaced-image-search-link', text: line });
      } else if (
        /^\[image\]\(https:\/\/www\.google\.com\/s2\/favicons/.test(trim) ||
        /^\[[^\]]+\]\(https?:\/\//.test(trim) ||
        /^(?:Vedabase|VedaBase)(?:\+1)?$/.test(trim) ||
        /^জয় শ্রী রাধামদনগোপাল।/.test(trim) ||
        /^(?:Acha, kotojon|Han bolun\.|Shib, Sodashib, Rudro)/.test(trim) ||
        /^(?:ছোট্ট জ্ঞানপরীক্ষা|5\/5 উত্তর|## 5 \/ 5 সঠিক|আবার চেষ্টা করুন)$/.test(trim)
      ) {
        omitted.push({ reason: 'conversation-or-export-interface', text: line });
      } else {
        kept.push(line.replace(/&#x20;/g, ''));
      }
    }
    if (imageIndex !== imageMap[index].length) throw new Error(`Illustration mapping mismatch in part ${index + 1}`);
    return { title: partTitles[index], text: kept.join('\n').trim(), figures, omitted };
  });
}

// These passages were flattened visual diagrams in the chat export. Reuse every label.
const diagrams = [
  [0, 'সর্বোচ্চ ধাম', 'এটি বোঝার সুবিধার জন্য', 'realms'],
  [0, 'শ্রীকৃষ্ণ (স্বয়ং ভগবান)', 'এটি মূল বিস্তারধারার', 'expansions'],
  [1, 'শ্রীকৃষ্ণ\n\nস্বয়ং ভগবান', 'এখানে একটা কথা বিশেষভাবে', 'paired-chain'],
  [2, 'চতুর্দশ ভুবনের সরল মানচিত্র', 'এটি ভাগবতীয় চতুর্দশ লোকের', 'worlds'],
  [2, 'শ্রীকৃষ্ণ\n\nসমস্ত ভগবৎ-প্রকাশের মূল উৎস', 'ক্ষীরোদকশায়ী বিষ্ণুর ভূমিকা', 'paired-chain'],
  [3, 'চার যুগ মিলে', 'এখানে প্রতিটি হিসাব', 'time-scale'],
  [3, 'সত্য\n\nত্রেতা\n\nদ্বাপর\n\nকলি', 'গৌড়ীয় বৈষ্ণব পরম্পরায়', 'yugas'],
  [3, 'ব্রহ্মার এক দিনে ১৪ মনু', '৭ নম্বর বৈবস্বত', 'manus'],
  [3, 'সৃষ্টি ও প্রলয়ের চক্র', '## ৭. এই বিশাল', 'cycle'],
  [4, 'ব্রহ্মার বর্তমান দিন', 'অর্থাৎ, আমরা ব্রহ্মার', 'current-time'],
  [4, 'এক ব্রহ্মদিবসের মন্বন্তরসমূহ', 'প্রথম ছয়টি মন্বন্তর', 'manus'],
  [5, 'দুধ\n\nমূল অবস্থা', 'এটি শাস্ত্রের উপমা', 'comparison'],
  [5, 'শ্রীকৃষ্ণ / গোবিন্দ\n\nসমস্ত ভগবৎ-প্রকাশের মূল উৎস', 'এটি গৌড়ীয় তত্ত্বের', 'paired-chain'],
  [6, 'দুটি ভিন্ন স্তরের প্রকাশ', 'দুটি ধারাকে সরাসরি', 'two-levels'],
  [7, 'শ্রীকৃষ্ণ / গোবিন্দ\n\nসমস্ত শক্তির পরম উৎস', 'এটি শক্তিতত্ত্বের', 'branches'],
];

function renderDiagram(text, type, id) {
  const labels = text.split(/\n+/).map(label => label.replace(/^##\s+/, '').trim()).filter(Boolean);
  const label = index => inline(labels[index]);
  const node = ({ title, eyebrow, description = [], note = [], tone = '', count }) => `<div class="map-node ${tone}">${count !== undefined ? `<span class="map-count">${label(count)}</span>` : ''}<div class="map-node-copy">${eyebrow !== undefined ? `<span class="map-eyebrow">${label(eyebrow)}</span>` : ''}<strong class="map-title">${label(title)}</strong>${description.map(index => `<span class="map-description">${label(index)}</span>`).join('')}${note.map(index => `<span class="map-note">${label(index)}</span>`).join('')}</div></div>`;
  const arrow = '<span class="map-connector" aria-hidden="true"></span>';
  const stack = nodes => `<div class="map-stack">${nodes.map(node).join(arrow)}</div>`;
  const caption = (title, subtitle) => `<figcaption class="map-caption"><strong>${label(title)}</strong>${subtitle !== undefined ? `<span>${label(subtitle)}</span>` : ''}</figcaption>`;
  let body;
  switch (type) {
    case 'realms':
      body = stack([
        { eyebrow: 0, title: 1, description: [2], tone: 'map-root' },
        { title: 3, description: [4] },
        { title: 5, description: [6], note: [7], tone: 'map-blue' },
        { title: 8, description: [9], note: [10] },
        { title: 11, description: [12], note: [13], tone: 'map-warm' },
      ]);
      break;
    case 'expansions':
      body = stack(labels.map((_, title) => ({ title, tone: title === 0 ? 'map-root' : title >= 5 ? 'map-blue' : '' })));
      break;
    case 'paired-chain':
    case 'comparison': {
      const nodes = labels.filter((_, index) => index % 2 === 0).map((_, index) => ({ title: index * 2, description: [index * 2 + 1], tone: index === 0 ? 'map-root' : '' }));
      body = type === 'comparison' ? `<div class="map-comparison">${nodes.map(node).join(arrow)}</div>` : stack(nodes);
      break;
    }
    case 'worlds': {
      const lowerIndex = labels.indexOf('সপ্ত অধোলোক');
      const rows = (start, end) => {
        const nodes = [];
        for (let index = start; index < end; index += 3) nodes.push(node({ count: index, title: index + 1, description: [index + 2], tone: labels[index + 1] === 'ভূলোক' ? 'map-blue' : '' }));
        return nodes.join('');
      };
      body = caption(0) + `<div class="world-columns"><div class="world-group"><p class="map-group-label">${label(1)}</p><div class="world-list">${rows(2, lowerIndex)}</div></div><div class="world-group"><p class="map-group-label">${label(lowerIndex)}</p><div class="world-list">${rows(lowerIndex + 1, labels.length)}</div></div></div>`;
      break;
    }
    case 'time-scale':
      body = stack([0, 3, 6, 9, 12].map(index => ({ eyebrow: index, title: index + 1, description: [index + 2], tone: index === 6 ? 'map-blue' : '' })));
      break;
    case 'current-time':
      body = stack([
        { eyebrow: 0, title: 1, description: [2] },
        { eyebrow: 3, title: 4 },
        { eyebrow: 5, title: 6 },
        { eyebrow: 7, title: 8, description: [9], tone: 'map-blue' },
      ]);
      break;
    case 'yugas':
      body = `<div class="yuga-bar">${labels.slice(0, 4).map((_, index) => `<span>${label(index)}</span>`).join('')}</div><figcaption class="map-footnote">${label(4)}</figcaption>`;
      break;
    case 'manus':
      body = caption(0) + `<ol class="manu-track">${labels.slice(1).map((_, index) => `<li${index === 6 ? ' class="manu-current" aria-current="step"' : ''}>${label(index + 1)}</li>`).join('')}</ol>`;
      break;
    case 'cycle':
      body = caption(0) + `<div class="cycle-steps">${[1, 4, 7, 10].map(index => node({ eyebrow: index, title: index + 1, description: [index + 2] })).join(arrow)}</div><p class="cycle-return">${label(13)}</p><div class="cycle-end">${node({ eyebrow: 14, title: 15, tone: 'map-warm' })}</div>`;
      break;
    case 'two-levels':
      body = caption(0) + `<div class="map-levels"><div>${stack([{ title: 1, description: [2], tone: 'map-root' }, { title: 3, description: [4] }])}</div><div><p class="map-group-label">${label(5)}</p>${stack([{ title: 6, description: [7] }, { title: 8, description: [9], tone: 'map-blue' }])}</div></div>`;
      break;
    case 'branches':
      body = node({ title: 0, description: [1], tone: 'map-root' }) + `<div class="map-branches">${[2, 4, 6].map(index => node({ title: index, description: [index + 1], tone: index === 6 ? 'map-blue' : '' })).join('')}</div>`;
      break;
    default:
      throw new Error(`Unknown article map type: ${type}`);
  }
  // Every original label must appear exactly once, in its original reading order.
  if (plain(body) !== plain(labels.join(''))) throw new Error(`Map label/order mismatch: ${type}`);
  return `<figure id="${id}" class="text-map ${type}" aria-label="${escapeHtml(labels[0])}">${body}</figure>`;
}

function renderQuiz(lines, start) {
  const questions = [];
  const optionCounts = [3, 3, 3, 2, 3];
  let i = start;
  while (i < lines.length && questions.length < 5) {
    while (i < lines.length && !lines[i].trim()) i++;
    const match = i < lines.length && lines[i].trim().match(/^(\d+)\\?\.\s+(.+)$/);
    if (!match) break;
    const number = Number(match[1]);
    const question = match[2];
    i++;
    const group = [];
    while (i < lines.length && group.length < optionCounts[questions.length] + 1) {
      const current = lines[i].trim();
      if (current) group.push(current);
      i++;
    }
    if (group.length !== optionCounts[questions.length] + 1) throw new Error(`Incomplete quiz question: ${question}`);
    questions.push({ number, question, options: group.slice(0, -1), answer: group.at(-1) });
  }
  if (questions.length !== 5) throw new Error(`Expected five quiz questions, found ${questions.length}`);

  // Correct choices are determined from the retained source answer lines.
  const correct = [1, 0, 2, 1, 0];
  const cards = questions.map((item, questionIndex) => {
    const id = `quiz-question-${item.number}`;
    const options = item.options.map((option, optionIndex) =>
      `<button class="quiz-option" type="button" data-correct="${optionIndex === correct[questionIndex]}" aria-describedby="${id}-feedback"><span class="quiz-choice" aria-hidden="true">${String.fromCharCode(2453 + optionIndex)}</span><span>${inline(option)}</span></button>`
    ).join('');
    return `<section class="quiz-card" aria-labelledby="${id}"><div class="quiz-question"><span class="quiz-number" aria-hidden="true">${bn(item.number).padStart(2, '০')}</span><h4 id="${id}">${inline(item.question)}</h4></div><div class="quiz-options">${options}</div><div class="quiz-feedback" id="${id}-feedback" role="status" aria-live="polite" hidden><span class="quiz-result"></span><p>${inline(item.answer)}</p></div></section>`;
  }).join('');
  return { html: `<div class="article-quiz" data-quiz><div class="quiz-intro"><p>সংক্ষিপ্ত জ্ঞানপরীক্ষা</p><span class="quiz-score" aria-live="polite">০ / ৫ উত্তর দেওয়া হয়েছে</span></div>${cards}</div>`, next: i };
}

function renderPart(part, index) {
  const tokens = [];
  let text = part.text;
  for (const [partIndex, start, end, type] of diagrams) {
    if (partIndex !== index) continue;
    const from = text.indexOf(start), to = text.indexOf(end, from + start.length);
    if (from < 0 || to < 0) throw new Error(`Diagram boundaries missing: ${start}`);
    const passage = text.slice(from, to).trim();
    const token = `ARTICLEDIAGRAM${tokens.length}`;
    tokens.push(renderDiagram(passage, type, `map-${index + 1}-${tokens.length + 1}`));
    text = text.slice(0, from) + token + '\n\n' + text.slice(to);
  }
  const lines = text.split('\n');
  const out = [];
  let headingCount = 0;
  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    const figureMatch = line.match(/^ARTICLEFIGURE(\d+)$/);
    if (figureMatch) { out.push(part.figures[Number(figureMatch[1])]); i++; continue; }
    const diagramMatch = line.match(/^ARTICLEDIAGRAM(\d+)$/);
    if (diagramMatch) { out.push(tokens[Number(diagramMatch[1])]); i++; continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 4);
      out.push(`<h${level} id="part-${index + 1}-section-${++headingCount}">${inline(localizeLeadingNumber(heading[2]))}</h${level}>`);
      i++;
      if (heading[2].includes('পাঁচটি প্রশ্নে নিজেকে যাচাই করুন')) {
        const quiz = renderQuiz(lines, i);
        out.push(quiz.html);
        i = quiz.next;
      }
      continue;
    }
    if (line.startsWith('|') && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++].trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()));
      out.push(`<div class="article-table" role="region" tabindex="0" aria-label="${escapeHtml(part.title)} — সারণি"><table><thead><tr>${rows[0].map(cell => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(2).map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (line.startsWith('>')) {
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) quote.push(lines[i++].trim().replace(/^>\s?/, ''));
      out.push(`<blockquote>${quote.map(inline).join('<br>')}</blockquote>`); continue;
    }
    const list = line.match(/^([-*]|\d+\.)\s+(.+)$/);
    if (list) {
      const ordered = /^\d/.test(list[1]);
      const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
      const items = [];
      while (i < lines.length && pattern.test(lines[i].trim())) items.push(lines[i++].trim().replace(pattern, '$1'));
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map(item => `<li>${inline(item)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`); continue;
    }
    const paragraph = [localizeLeadingNumber(line)]; i++;
    while (i < lines.length && lines[i].trim() && !/^(?:#|>|\||ARTICLE|[-*]\s|\d+\.\s)/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
  }
  let result = out.join('\n');
  // Chat export repeated several image captions as a separate title followed by
  // a short descriptor. Rejoin those fragments into one editorial caption.
  result = result.replace(/(<figure class="article-figure">[\s\S]*?<figcaption>([^<]+)<\/figcaption><\/figure>)\n<p>\2<\/p>\n<p>([^<]+)<\/p>/g, (match, figure, caption, context) =>
    figure.replace('</figcaption>', `<span class="figure-context">${context}</span></figcaption>`)
  );
  // Verify every retained source line, including all table cells and diagram labels.
  const outputText = plain(result);
  part.text.split('\n').forEach(line => {
    if (!line.trim() || /^ARTICLEFIGURE\d+$/.test(line) || /^\|[\s:|-]+\|$/.test(line.trim())) return;
    const expected = plain(line.replace(/^#{1,6}\s+/, '').replace(/^>\s?/, '').replace(/^[-*]\s+/, '').replace(/^\d+\\?\.\s+/, '').replace(/\|/g, '').replace(/&#x20;/g, ''));
    if (expected && !outputText.includes(expected)) throw new Error(`Article fidelity mismatch in part ${index + 1}: ${line}`);
  });
  return result;
}

function buildArticle() {
  const manifest = new Set();
  const parts = prepareParts(readSource(), manifest);
  if (parts.length !== 8) throw new Error('Expected eight conversation parts');
  const body = parts.map((part, index) => `<section class="article-part" id="part-${index + 1}" aria-labelledby="part-${index + 1}-title"><header class="part-header"><p>পর্ব ${bn(index + 1)}</p><h2 id="part-${index + 1}-title">${part.title}</h2></header>${renderPart(part, index)}</section>`).join('\n');
  const toc = parts.map((part, index) => `<a href="#part-${index + 1}"><span>${bn(index + 1).padStart(2, '০')}</span>${part.title}</a>`).join('');
  const back = '../srimad_bhagavatam_bengali_explorer.html#detailed-lessons-title';
  const html = `<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | শ্রীমদ্ভাগবত কথা</title><meta name="description" content="কৃষ্ণ, নারায়ণ, তিন বিষ্ণু, সৃষ্টি, চতুর্দশ ভুবন, সময়চক্র, শিব ও শক্তিতত্ত্ব নিয়ে একটি সচিত্র ধারাবাহিক পাঠ।"><meta name="theme-color" content="#f8f6f1"><link rel="stylesheet" href="../assets/article.css"><link rel="stylesheet" href="../assets/article-maps.css"></head>
<body><a class="skip-link" href="#article">মূল লেখায় যান</a><div class="reading-progress" aria-hidden="true"></div><header class="article-topbar"><a href="${back}">← বিশদ পাঠে ফিরুন</a><a class="site-name" href="${back}">শ্রীমদ্ভাগবত কথা</a><a href="#contents">সূচিপত্র</a></header>
<main><header class="article-hero"><p class="eyebrow">বিশদ পাঠ · গৌড়ীয় বৈষ্ণব দর্শন</p><h1>${title}</h1><p class="article-deck">কৃষ্ণ ও বিষ্ণুর প্রকাশ থেকে সৃষ্টি ও সময়চক্র, শিব ও শক্তিতত্ত্ব—আট পর্বে একটি ধারাবাহিক পাঠ।</p><p class="article-meta">৮টি পর্ব <span>·</span> সচিত্র আলোচনা <span>·</span> সারণি ও জ্ঞানচিত্র</p></header><div class="article-layout"><aside class="article-toc" id="contents" aria-label="পাঠের সূচিপত্র"><details open><summary>এই পাঠের সূচি</summary><nav>${toc}</nav></details></aside><article id="article" tabindex="-1">${body}<footer class="article-end"><p>॥ ওঁ নমো ভগবতে বাসুদেবায় ॥</p><a href="${back}">← বিশদ পাঠে ফিরুন</a><a href="#">উপরে ফিরুন ↑</a></footer></article></div></main>
<script>
const progress=document.querySelector('.reading-progress');
const updateProgress=()=>{const range=document.documentElement.scrollHeight-innerHeight;progress.style.width=(range>0?scrollY/range*100:0)+'%'};
addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();
const links=[...document.querySelectorAll('.article-toc nav a')];
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){links.forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}}},{rootMargin:'-10% 0px -75% 0px'});document.querySelectorAll('.article-part').forEach(part=>observer.observe(part))}
document.querySelectorAll('[data-quiz]').forEach(quiz=>{
  const cards=[...quiz.querySelectorAll('.quiz-card')];
  const score=quiz.querySelector('.quiz-score');
  cards.forEach(card=>{
    card.querySelectorAll('.quiz-option').forEach(option=>option.addEventListener('click',()=>{
      const firstAnswer=!card.classList.contains('answered');
      card.classList.add('answered');
      card.querySelectorAll('.quiz-option').forEach(button=>{
        button.disabled=true;
        button.classList.toggle('is-correct',button.dataset.correct==='true');
      });
      option.classList.add(option.dataset.correct==='true'?'is-selected-correct':'is-selected-wrong');
      const feedback=card.querySelector('.quiz-feedback');
      feedback.hidden=false;
      feedback.querySelector('.quiz-result').textContent=option.dataset.correct==='true'?'সঠিক উত্তর':'সঠিক উত্তরটি দেখুন';
      if(firstAnswer){
        const answered=cards.filter(item=>item.classList.contains('answered')).length;
        score.textContent=answered.toLocaleString('bn-BD')+' / ৫ উত্তর দেওয়া হয়েছে';
      }
    }));
  });
});
</script></body></html>`;
  fs.mkdirSync(path.join(__dirname, 'articles'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, articlePath), html);
  return { title, articlePath, entryId, parts: parts.length, illustrations: manifest.size, omitted: parts.flatMap(part => part.omitted).length };
}

module.exports = { buildArticle, title, articlePath, entryId };
if (require.main === module) console.log(JSON.stringify(buildArticle(), null, 2));
