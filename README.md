# শ্রীমদ্ভাগবত কথা — বাংলা Study Companion

বাংলায় শ্রীমদ্ভাগবত অধ্যয়নের জন্য একটি clean editorial website। এতে পরিচয়, নির্বাচিত ২৫টি শ্লোক, কথোপকথন ও ১২ স্কন্ধ, চরিত্র ও সময়রেখা, **গল্প ও শিক্ষা** এবং blog-style **বিশদ পাঠ** বিভাগ রয়েছে।

প্রকাশিত website: **https://solpickle.github.io/shreemadbhagawat_katha/**

## মূল website

`srimad_bhagavatam_bengali_explorer.html`

ফাইলটি browser-এ সরাসরি খুললেই website ব্যবহার করা যাবে। কোনো server বা package installation প্রয়োজন নেই।

## প্রধান বৈশিষ্ট্য

- বাংলা editorial reading design
- responsive desktop ও mobile layout
- keyboard-accessible tabs এবং story dialog
- ১২টি স্কন্ধের ১১০টি নির্বাচিত ঘটনা
- ২৩টি curated expanded story card
- গল্প ও অধ্যায় অনুযায়ী browsing
- স্বতন্ত্র **বিশদ পাঠ** tab ও searchable পাঠাগার
- প্রতিটি বিশদ পাঠের clickable responsive detail view
- বাংলা local search
- local Bengali font assets
- source-content fidelity validation

## Repository structure

```text
assets/fonts/                         বাংলা font files
build_exact_explorer.js               মূল HTML builder
build_grantha_variant.js              alternative HTML builder
srimad_bhagavatam_bengali_explorer.html
validate_bhagavatam_integration.js     content-fidelity validator
validate_static_site.js                deployment-safe static validator
.github/workflows/deploy-pages.yml     GitHub Pages deployment
```

## Source Markdown

Builder approved Markdown source ব্যবহার করে। বর্তমান local workspace-এ এগুলো repository-টির parent directory-তে রাখা আছে:

```text
../raw_conversation.md
../BHAGAVATAM_CODEX_INTEGRATION.md
../bhagavat_*.md
```

এই Bengali content locked। ধর্মীয় লেখা, গল্প, শিক্ষা বা উদ্ধৃতি build করার সময় rewrite, summarize অথবা স্বয়ংক্রিয়ভাবে generate করা হয় না।

### নতুন বিশদ পাঠ যোগ করা

Repository-টির parent directory-তে `bhagavat_*.md` pattern-এ নতুন Markdown রাখুন। বর্তমান frontmatter structure অনুসরণ করে `title`, `scripture`, `skandha`, `chapter`, `verses`, `category`, `speaker` এবং `listener` দিন। এরপর builder চালালে প্রতিটি file স্বয়ংক্রিয়ভাবে **বিশদ পাঠ** tab-এর পাঠাগারে একটি নতুন clickable entry হবে। Source Markdown repository-তে commit হবে না; শুধু generated HTML commit হবে।

## Build

Repository directory থেকে:

```powershell
node build_exact_explorer.js
```

Alternative Digital Grantha version তৈরি করতে:

```powershell
node build_grantha_variant.js
```

Alternative output parent directory-তে `srimad_bhagavatam_digital_grantha.html` নামে তৈরি হয়।

## Validation

```powershell
node validate_bhagavatam_integration.js
```

Validator যা পরীক্ষা করে:

- ১২টি স্কন্ধ উপস্থিত
- ১১০টি source row exact match
- ২৩টি expanded card উপস্থিত
- Bengali locked content অপরিবর্তিত
- ছয়টি navigation tab উপস্থিত
- generated browser JavaScript-এর syntax valid

`validate_bhagavatam_integration.js` approved source Markdown-এর সঙ্গে পূর্ণ fidelity পরীক্ষা করে এবং তাই local workspace-এ চালানো হয়। GitHub Actions Markdown ছাড়াই `validate_static_site.js` চালিয়ে committed HTML, embedded story data, browser script ও font assets যাচাই করে।

## GitHub Pages deployment

`main` branch-এ কোনো commit বা pull request merge হলে GitHub Actions:

1. committed website যাচাই করে;
2. `srimad_bhagavatam_bengali_explorer.html`-কে deployment artifact-এর `index.html` বানায়;
3. local font assets সংযুক্ত করে;
4. GitHub Pages-এ website প্রকাশ করে।

Source Markdown repository-তে upload করা হয় না। Content পরিবর্তনের পরে local machine-এ build ও পূর্ণ fidelity validation চালিয়ে শুধু generated website commit করতে হবে।

## প্রযুক্তি

Website-টি plain HTML, CSS এবং JavaScript দিয়ে তৈরি। কোনো runtime framework, tracker, sign-in অথবা external API নেই।
