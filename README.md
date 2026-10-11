# শ্রীমদ্ভাগবত কথা — বাংলা Study Companion

বাংলায় শ্রীমদ্ভাগবত অধ্যয়নের জন্য একটি clean editorial website। এতে পরিচয়, নির্বাচিত ২৫টি শ্লোক, কথোপকথন ও ১২ স্কন্ধ, চরিত্র ও সময়রেখা এবং **গল্প ও শিক্ষা** বিভাগ রয়েছে।

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
```

## Source Markdown

Builder দুটি approved Markdown source ব্যবহার করে। বর্তমান local workspace-এ এগুলো repository-টির parent directory-তে রাখা আছে:

```text
../raw_conversation.md
../BHAGAVATAM_CODEX_INTEGRATION.md
```

এই Bengali content locked। ধর্মীয় লেখা, গল্প, শিক্ষা বা উদ্ধৃতি build করার সময় rewrite, summarize অথবা স্বয়ংক্রিয়ভাবে generate করা হয় না।

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
- পাঁচটি navigation tab উপস্থিত
- generated browser JavaScript-এর syntax valid

## প্রযুক্তি

Website-টি plain HTML, CSS এবং JavaScript দিয়ে তৈরি। কোনো runtime framework, tracker, sign-in অথবা external API নেই।

