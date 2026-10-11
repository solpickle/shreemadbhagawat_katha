const fs = require("fs");
const path = require("path");

// প্রথম editorial সংস্করণটি canonical Markdown source থেকে নতুন করে তৈরি করি।
require("./build_exact_explorer.js");

const sourceFile = path.join(__dirname, "srimad_bhagavatam_bengali_explorer.html");
const outputFile = path.join(__dirname, "..", "srimad_bhagavatam_digital_grantha.html");
let html = fs.readFileSync(sourceFile, "utf8");

const granthaTheme = `
/* দ্বিতীয় visual direction: Digital Grantha */
:root{--bg:#eee6d7;--panel:#fffdf7;--panel2:#f5efe3;--text:#28221b;--muted:#554d43;--gold:#a5411d;--line:#d9cbb7;--glow:#f7efe0;--radius:3px}
html{background:#eee6d7}
body{background:linear-gradient(90deg,#e9dfcf 0,#f5efe4 12%,#f5efe4 88%,#e9dfcf 100%);color:#28221b}
.hero{position:relative;text-align:center;padding:54px 24px 43px;background:#fffdf7;border-top:5px solid #a5411d;border-bottom:1px solid #d7c8b1}
.hero:after{content:"❧";position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);width:42px;height:34px;color:#a5411d;background:#fffdf7;font-family:Georgia,serif;font-size:1.7rem;line-height:32px}
.eyebrow{color:#245775;font-size:.76rem;letter-spacing:.16em}
.hero h1{margin:.48rem auto .4rem;color:#8e3215;font-size:clamp(2.45rem,4.8vw,4.25rem);font-weight:500;line-height:1.24}
.hero p{margin:0 auto;max-width:760px;color:#62584d;font-size:.96rem}
.tabs{justify-content:center;padding:15px 24px 0;gap:34px;background:#f7f1e6;border-bottom:1px solid #d9cbb7}
.tab{padding:9px 0 12px;color:#5e5549;font-size:.93rem;border-bottom:2px solid transparent}
.tab:before{content:"";display:inline-block;width:4px;height:4px;margin:0 9px 3px 0;border-radius:50%;background:#c49a60}
.tab.active{color:#8e3215;border-bottom-color:#a5411d}
.tab.active:before{background:#245775}
.page.active{grid-template-columns:245px minmax(0,1fr);max-width:1380px;margin:26px auto 52px;background:#fffdf7;border:1px solid #d8cbb9;box-shadow:0 18px 65px rgba(70,52,31,.11)}
.side{top:68px;height:calc(100vh - 92px);padding:32px 20px;background:#f6f0e5;border-right:1px solid #d8cbb9}
.side-title{padding-bottom:10px;color:#8e3215;border-bottom:1px solid #cdbda5;font-size:.74rem;letter-spacing:.1em}
.search{border:0;border-bottom:1px solid #c9b99f;border-radius:0;background:transparent;color:#342c23}
.side a{position:relative;padding:6px 8px 6px 16px;color:#655b4f;font-size:.82rem}
.side a:before{content:"";position:absolute;left:3px;top:15px;width:5px;border-top:1px solid #b99a70}
.side a:hover{color:#8e3215;background:transparent}
main{position:relative;padding:58px clamp(34px,7vw,100px) 110px;background:#fffdf7}
main:before{content:"";position:absolute;top:0;bottom:0;left:18px;border-left:1px solid rgba(165,65,29,.12)}
.content{max-width:820px}
.content h2{position:relative;padding-bottom:18px;color:#8e3215;font-size:clamp(2.15rem,3.5vw,3rem);font-weight:500}
.content h2:after{content:"";display:block;width:72px;margin-top:14px;border-bottom:2px solid #c28a48}
.content h3{position:relative;color:#8e3215;font-size:clamp(1.6rem,2.4vw,2.2rem);font-weight:500}
.content h3:after{content:"";display:block;width:42px;margin-top:9px;border-bottom:1px solid #cfb58f}
.content h4{color:#245775;font-size:1.26rem;font-weight:600}
.content p{color:#312b24;font-size:1.075rem;line-height:2.05}
.content strong{color:#1d1915;font-weight:600}
.content code{color:#804020;background:#f4eadb}
.content hr{height:auto;margin:60px 0;text-align:center;background:none;border:0}
.content hr:after{content:"◆  ◆  ◆";color:#b28a55;font-size:.62rem;letter-spacing:.7em}
.content blockquote{margin:38px 0;padding:45px 46px 34px 64px;color:#154f68;background:#f8f4eb;border:1px solid #ded2c0;border-top:3px solid #245775;border-radius:2px}
.content blockquote:before{left:20px;top:-12px;color:#b65d29;font-size:6rem}
.diagram-wrap{border:1px solid #d4c4ab;border-radius:2px;background:#f8f2e7}
.diagram-label{color:#8e3215;background:#eee3d1;border-color:#d4c4ab;letter-spacing:.05em}
.diagram{color:#40372d;background-image:linear-gradient(rgba(115,86,50,.035) 1px,transparent 1px);background-size:100% 28px}
.prompt-wrap{border-left:4px solid #a5411d;background:#fff9ef}
.table-wrap{border-radius:2px;border-color:#d4c4ab}
table{background:#fffdf7}
th{color:#fffaf1;background:#7f3b23;font-weight:500}
th,td{border-color:#ded2c0}
tbody tr:nth-child(even){background:#faf5eb}
.source-note{padding:12px 16px;color:#695b4b;background:#f8f1e5;border-left:3px solid #245775}
footer{color:#6d6256;background:#eee6d7;border-top:1px solid #d3c3ac}
@media(max-width:850px){body{background:#fffdf7}.hero{text-align:left;padding:38px 20px 34px}.hero:after{left:34px}.tabs{justify-content:flex-start;padding-left:18px;gap:26px}.page.active{margin:0;border:0;box-shadow:none}.side{height:auto}.side a:before,main:before{display:none}main{padding:42px 21px 72px}.content p{font-size:1rem;line-height:1.95}.content blockquote{padding:42px 24px 25px 43px}}
`;

html = html
  .replace("<title>শ্রীমদ্ভাগবত মহাপুরাণ — বাংলা জ্ঞানমানচিত্র</title>", "<title>শ্রীমদ্ভাগবত মহাপুরাণ — Digital Grantha</title>")
  .replaceAll('url("assets/fonts/', 'url("shreemadbhagawat_katha_site/assets/fonts/')
  .replace("</style>", `${granthaTheme}\n</style>`)
  .replace("<div class=\"eyebrow\">শ্রবণ • কীর্তন • স্মরণ • ভক্তি</div>", "<div class=\"eyebrow\">ডিজিটাল গ্রন্থ • বাংলা পাঠসংস্করণ</div>");

fs.writeFileSync(outputFile, html, "utf8");
console.log(JSON.stringify({ outputFile: path.relative(path.join(__dirname, ".."), outputFile), bytes: Buffer.byteLength(html) }, null, 2));
