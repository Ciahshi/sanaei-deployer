// server.js — بک‌اند واقعی دیپلوی سنایی روی Railway
// این سرور توکن کاربر را می‌گیرد و از سمت سرور به API ریلوی وصل می‌شود (بدون CORS)
const express = require('express');
const cors = require('cors');
const { deploySanaei, getDeployStatus, findForkRepo, forkSanaei, validateToken } = require('./sanaei.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // اجازه دسترسی از هر دامنه (سایت شما می‌تواند هر جا هاست شود)
app.use(express.json({ limit: '1mb' }));

// ---------- صفحات ----------
// ---------- صفحه اصلی (فرانت‌اند جاسازی‌شده) ----------
const FRONTEND_HTML = String.raw`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>سنایی | دیپلوی خودکار پنل روی Railway</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#05070d; --bg2:#0a0e1a; --card:#0d1220; --card2:#111829; --border:rgba(148,163,184,.13);
  --text:#e2e8f0; --muted:#8b96ab; --dim:#5b6478;
  --acc:#34d399; --acc2:#10b981; --acc-glow:rgba(52,211,153,.35);
  --gold:#fbbf24; --red:#f87171; --blue:#38bdf8;
  --ok:#34d399; --err:#f87171; --warn:#fbbf24;
  --r-lg:18px; --r-md:12px; --r-sm:8px;
  --shadow:0 20px 60px rgba(0,0,0,.45);
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  font-family:'Vazirmatn',system-ui,sans-serif;background:var(--bg);color:var(--text);
  min-height:100vh;overflow-x:hidden;line-height:1.75;
}
.bg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:
  radial-gradient(1200px 800px at 85% -10%,rgba(52,211,153,.07),transparent 60%),
  radial-gradient(1000px 700px at 0% 110%,rgba(56,189,248,.05),transparent 60%),
  var(--bg);}
.grid{position:fixed;inset:0;z-index:-1;pointer-events:none;
  background-image:linear-gradient(rgba(148,163,184,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.045) 1px,transparent 1px);
  background-size:44px 44px;mask-image:radial-gradient(ellipse 90% 70% at 50% 0%,black 20%,transparent 75%);}
.orb{position:fixed;border-radius:50%;filter:blur(90px);opacity:.16;z-index:-1;pointer-events:none;animation:drift 22s ease-in-out infinite alternate;}
.orb1{width:420px;height:420px;background:#34d399;top:-120px;right:-80px}
.orb2{width:380px;height:380px;background:#38bdf8;bottom:-140px;left:-100px;animation-delay:-8s}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(50px,30px) scale(1.12)}}
::selection{background:rgba(52,211,153,.3)}
::-webkit-scrollbar{width:9px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:#1e293b;border-radius:99px}

/* ---------- LOADING OVERLAY ---------- */
#loader{position:fixed;inset:0;z-index:1000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;transition:opacity .7s ease,visibility .7s;}
#loader.hide{opacity:0;visibility:hidden}
.loader-mark{position:relative;width:110px;height:110px}
.loader-mark svg{width:100%;height:100%}
.loader-ring{position:absolute;inset:0;border-radius:50%;border:2px solid transparent;border-top-color:var(--acc);border-right-color:rgba(52,211,153,.25);animation:spin 1.1s linear infinite}
.loader-ring2{position:absolute;inset:-14px;border-radius:50%;border:1px solid transparent;border-bottom-color:rgba(56,189,248,.5);animation:spin 2.2s linear infinite reverse}
@keyframes spin{to{transform:rotate(360deg)}}
.loader-text{font-size:1.05rem;color:var(--muted)}
.loader-text b{color:var(--acc)}
.loader-dots::after{content:'';animation:dots 1.4s steps(4,end) infinite}
@keyframes dots{0%{content:''}25%{content:'.'}50%{content:'..'}75%{content:'...'}}
.loader-bar{width:240px;height:4px;border-radius:99px;background:#12182a;overflow:hidden}
.loader-bar i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--acc),var(--blue));animation:loadbar 1.8s ease-in-out infinite}
@keyframes loadbar{0%{width:0}55%{width:100%}100%{width:100%;opacity:0}}

/* ---------- NAV ---------- */
nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(14px);background:rgba(5,7,13,.72);border-bottom:1px solid var(--border)}
.nav-in{max-width:1180px;margin:0 auto;padding:14px 22px;display:flex;align-items:center;gap:14px}
.logo{display:flex;align-items:center;gap:11px;text-decoration:none}
.logo-badge{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#059669,#10b981);display:grid;place-items:center;font-weight:900;color:#fff;font-size:1.15rem;box-shadow:0 8px 22px rgba(16,185,129,.35)}
.logo-name{font-size:1.18rem;font-weight:800;color:#fff}
.logo-name span{color:var(--acc)}
.logo-sub{font-size:.7rem;color:var(--dim);font-weight:500;margin-top:-3px}
.nav-links{margin-inline-start:auto;display:flex;gap:6px;align-items:center}
.nav-links a{color:var(--muted);text-decoration:none;font-size:.86rem;padding:8px 13px;border-radius:9px;transition:.25s;font-weight:500}
.nav-links a:hover{color:#fff;background:rgba(148,163,184,.09)}
.github-btn{display:inline-flex;align-items:center;gap:7px;background:#1a2233;border:1px solid var(--border);color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-size:.83rem;font-weight:600;transition:.25s}
.github-btn:hover{border-color:rgba(52,211,153,.5);background:#202a40}
.github-btn svg{width:16px;height:16px;fill:currentColor}

main{max-width:1180px;margin:0 auto;padding:0 22px 90px}
section{padding:64px 0 10px}
.sec-head{margin-bottom:30px}
.sec-tag{display:inline-flex;align-items:center;gap:8px;font-size:.75rem;font-weight:700;color:var(--acc);background:rgba(52,211,153,.09);border:1px solid rgba(52,211,153,.25);padding:5px 13px;border-radius:99px;margin-bottom:14px;letter-spacing:.5px}
.sec-title{font-size:1.75rem;font-weight:800;color:#fff;margin-bottom:8px}
.sec-title .dot{color:var(--acc)}
.sec-desc{color:var(--muted);max-width:640px;font-size:.95rem}

.hero{padding:76px 0 30px;text-align:center;position:relative}
.hero-badge{display:inline-flex;align-items:center;gap:9px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.28);color:var(--acc);padding:8px 18px;border-radius:99px;font-size:.82rem;font-weight:600;margin-bottom:24px}
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--acc);box-shadow:0 0 0 0 rgba(52,211,153,.6);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.5)}70%{box-shadow:0 0 0 12px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
.hero h1{font-size:clamp(2rem,5vw,3.4rem);font-weight:900;line-height:1.35;color:#fff;margin-bottom:18px}
.hero h1 .grad{background:linear-gradient(120deg,#34d399 10%,#38bdf8 90%);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--muted);max-width:640px;margin:0 auto 34px;font-size:1.02rem}
.hero-cta{display:flex;gap:13px;justify-content:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:9px;padding:13px 26px;border-radius:13px;font-weight:700;font-size:.95rem;cursor:pointer;transition:.25s;text-decoration:none;border:none;font-family:inherit}
.btn-primary{background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 10px 30px rgba(16,185,129,.3)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(16,185,129,.42)}
.btn-ghost{background:rgba(148,163,184,.07);color:#e2e8f0;border:1px solid var(--border)}
.btn-ghost:hover{background:rgba(148,163,184,.14);border-color:rgba(52,211,153,.4)}
.btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important;box-shadow:none!important}
.hero-stats{display:flex;gap:0;justify-content:center;margin-top:44px;flex-wrap:wrap}
.hstat{text-align:center;padding:6px 34px;border-left:1px solid var(--border)}
.hstat:last-child{border-left:none}
.hstat b{display:block;font-size:1.5rem;font-weight:800;color:#fff}
.hstat b i{font-style:normal;color:var(--acc)}
.hstat span{font-size:.78rem;color:var(--dim)}
@media(max-width:640px){.hstat{border-left:none;padding:10px 20px}}

.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:14px;margin-top:8px}
.step{background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px 20px;position:relative;transition:.3s}
.step:hover{transform:translateY(-3px);border-color:rgba(52,211,153,.35);box-shadow:var(--shadow)}
.step-num{position:absolute;top:16px;left:18px;font-size:.72rem;font-weight:800;color:var(--acc);background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);border-radius:99px;padding:2px 11px;font-family:'JetBrains Mono',monospace}
.step-ico{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-size:1.35rem;margin-bottom:14px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.22)}
.step h3{font-size:.98rem;font-weight:700;color:#fff;margin-bottom:6px}
.step p{font-size:.8rem;color:var(--muted);line-height:1.7}

.wizard{background:var(--card);border:1px solid var(--border);border-radius:22px;overflow:hidden;box-shadow:var(--shadow)}
.wz-head{padding:22px 26px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.wz-title{font-size:1.15rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:10px}
.wz-title .ico{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#059669,#10b981);display:grid;place-items:center;font-size:1.1rem}
.wz-steps{display:flex;gap:6px;margin-inline-start:auto;flex-wrap:wrap}
.wz-dot{width:9px;height:9px;border-radius:50%;background:#1e293b;transition:.3s}
.wz-dot.done{background:var(--acc)}
.wz-dot.cur{background:var(--gold);box-shadow:0 0 10px rgba(251,191,36,.5)}
.wz-body{padding:26px}
.wz-step{display:none;animation:fadeUp .45s ease}
.wz-step.active{display:block}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

label{display:block;font-size:.83rem;font-weight:600;color:#cbd5e1;margin-bottom:8px}
label .req{color:var(--red)}
.hint{font-size:.75rem;color:var(--dim);margin-top:6px;line-height:1.7}
input[type=text],input[type=password],input[type=url]{
  width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:12px;color:var(--text);
  padding:13px 15px;font-size:.92rem;font-family:inherit;transition:.25s;outline:none;
}
input:focus{border-color:rgba(52,211,153,.55);box-shadow:0 0 0 3px rgba(52,211,153,.13)}
input::placeholder{color:#4a5468}
.field{margin-bottom:18px}
.tok-wrap{position:relative}
.tok-wrap input{padding-left:88px;direction:ltr;text-align:left;font-family:'JetBrains Mono',monospace;font-size:.84rem}
.tok-eye{position:absolute;left:8px;top:50%;transform:translateY(-50%);background:#182033;border:1px solid var(--border);color:var(--muted);border-radius:8px;padding:6px 11px;font-size:.75rem;cursor:pointer;transition:.2s}
.tok-eye:hover{color:#fff;border-color:rgba(52,211,153,.4)}

.btn-row{display:flex;gap:11px;margin-top:22px;flex-wrap:wrap}
.btn-sm{padding:10px 18px;font-size:.86rem;border-radius:10px}
.btn-acc{background:rgba(52,211,153,.12);color:var(--acc);border:1px solid rgba(52,211,153,.35)}
.btn-acc:hover{background:rgba(52,211,153,.2)}

.console{background:#060a12;border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-top:18px}
.console-bar{display:flex;align-items:center;gap:8px;padding:10px 15px;background:#0a101c;border-bottom:1px solid var(--border)}
.c-dot{width:11px;height:11px;border-radius:50%}
.c-dot.r{background:#f87171}.c-dot.y{background:#fbbf24}.c-dot.g{background:#34d399}
.console-bar span{font-size:.74rem;color:var(--dim);margin-inline-start:auto;font-family:'JetBrains Mono',monospace}
#logBox{height:240px;overflow-y:auto;padding:15px;font-family:'JetBrains Mono',monospace;font-size:.78rem;line-height:1.9;direction:ltr;text-align:left;white-space:pre-wrap;word-break:break-word}
.log-line{display:flex;gap:10px;align-items:flex-start}
.log-line::before{content:attr(data-t);color:#3d4860;flex-shrink:0;font-size:.68rem;padding-top:3px}
.log-ok{color:#86efac}.log-err{color:#fca5a5}.log-info{color:#93c5fd}.log-warn{color:#fcd34d}.log-dim{color:#64748b}
.log-acc{color:#34d399;font-weight:700}

.result-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:20px}
.res-card{background:var(--card2);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px}
.res-card h4{display:flex;align-items:center;gap:9px;font-size:.9rem;color:#fff;margin-bottom:14px}
.res-card h4 .ic{width:32px;height:32px;border-radius:9px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.25);display:grid;place-items:center;font-size:.95rem}
.kv{display:flex;flex-direction:column;gap:9px}
.kv-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:.8rem;padding-bottom:8px;border-bottom:1px dashed rgba(148,163,184,.1)}
.kv-row:last-child{border-bottom:none;padding-bottom:0}
.kv-k{color:var(--dim);flex-shrink:0}
.kv-v{color:#e2e8f0;font-weight:600;direction:ltr;text-align:left;font-family:'JetBrains Mono',monospace;font-size:.76rem;word-break:break-all;overflow-wrap:anywhere}
.copy-btn{background:none;border:1px solid var(--border);color:var(--muted);border-radius:7px;padding:2px 9px;font-size:.68rem;cursor:pointer;transition:.2s;flex-shrink:0}
.copy-btn:hover{color:var(--acc);border-color:rgba(52,211,153,.5)}
.link-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:12px;font-size:.9rem;transition:.25s;margin-top:18px;box-shadow:0 8px 24px rgba(16,185,129,.3)}
.link-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(16,185,129,.45)}

.prog-wrap{margin:16px 0 4px}
.prog{height:9px;background:#12182a;border-radius:99px;overflow:hidden}
.prog i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#059669,#10b981,#34d399);transition:width .6s ease;position:relative;overflow:hidden}
.prog i::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 20%,rgba(255,255,255,.35) 50%,transparent 80%);animation:shine 1.6s linear infinite}
@keyframes shine{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.prog-labels{display:flex;justify-content:space-between;font-size:.75rem;color:var(--dim);margin-top:7px}
.prog-labels b{color:var(--acc)}

.spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:-2px}

#toasts{position:fixed;bottom:24px;left:24px;z-index:900;display:flex;flex-direction:column;gap:10px;max-width:340px}
.toast{background:#0d1526;border:1px solid var(--border);border-inline-start:3px solid var(--acc);border-radius:12px;padding:13px 16px;font-size:.84rem;color:var(--text);box-shadow:var(--shadow);animation:slideIn .35s ease;display:flex;gap:10px;align-items:flex-start}
.toast.err{border-inline-start-color:var(--err)}
.toast.warn{border-inline-start-color:var(--warn)}
.toast.info{border-inline-start-color:var(--blue)}
@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}
.toast.out{opacity:0;transform:translateX(30px);transition:.4s}

.faq-item{background:var(--card);border:1px solid var(--border);border-radius:var(--r-md);margin-bottom:10px;overflow:hidden}
.faq-q{padding:16px 20px;font-weight:700;font-size:.9rem;color:#e2e8f0;cursor:pointer;display:flex;align-items:center;gap:11px;user-select:none}
.faq-q .ar{color:var(--acc);transition:.3s}
.faq-item.open .ar{transform:rotate(45deg)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .4s ease;padding:0 20px;color:var(--muted);font-size:.84rem;line-height:1.9}
.faq-item.open .faq-a{max-height:300px;padding-bottom:18px}
footer{border-top:1px solid var(--border);padding:36px 22px;text-align:center;color:var(--dim);font-size:.8rem}
footer b{color:var(--muted)}

@media(max-width:760px){
  .nav-links{display:none}
  .wz-steps{display:none}
  .hero{padding-top:52px}
}
</style>
</head>
<body>

<!-- ======== LOADER ======== -->
<div id="loader">
  <div class="loader-mark">
    <div class="loader-ring"></div>
    <div class="loader-ring2"></div>
    <svg viewBox="0 0 100 100" fill="none">
      <rect x="20" y="20" width="60" height="60" rx="16" fill="#0d1526" stroke="#10b981" stroke-width="3"/>
      <path d="M38 55 L48 65 L64 42" stroke="#34d399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="35" cy="38" r="4" fill="#34d399"/>
    </svg>
  </div>
  <div class="loader-text"><b>سنایی</b> در حال آماده‌سازی&nbsp;<span class="loader-dots"></span></div>
  <div class="loader-bar"><i></i></div>
</div>

<div class="bg"></div>
<div class="grid"></div>
<div class="orb orb1"></div>
<div class="orb orb2"></div>

<nav>
  <div class="nav-in">
    <a href="#home" class="logo">
      <div class="logo-badge">س</div>
      <div>
        <div class="logo-name">سنایی <span>|</span> Sanaei</div>
        <div class="logo-sub">Deploy Panel on Railway</div>
      </div>
    </a>
    <div class="nav-links">
      <a href="#home" class="active">خانه</a>
      <a href="#how">مراحل</a>
      <a href="#deploy">دیپلوی</a>
      <a href="#faq">سوالات</a>
    </div>
    <a class="github-btn" href="https://github.com/x4gKing/3x-ui" target="_blank" rel="noopener">
      <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
      ریپازیتوری اصلی
    </a>
  </div>
</nav>

<main>
<section id="home" class="hero">
  <div class="hero-badge"><span class="pulse-dot"></span> دیپلوی واقعی و خودکار</div>
  <h1>پنل <span class="grad">سنایی</span> را در چند دقیقه<br>روی Railway بالا بیاور</h1>
  <p>توکن Railway را وارد کنید؛ سرور دیپلوی، آخرین نسخه ریپازیتوری سنایی را پیدا می‌کند، پروژه را می‌سازد و لینک پنل و ولوم دائمی را تحویل می‌دهد.</p>
  <div class="hero-cta">
    <a href="#deploy" class="btn btn-primary">🚀 شروع دیپلوی</a>
    <a href="#how" class="btn btn-ghost">📋 مراحل کار</a>
  </div>
  <div class="hero-stats">
    <div class="hstat"><b><i>۳</i></b><span>فایل ریپازیتوری</span></div>
    <div class="hstat"><b><i>۵</i></b><span>مرحله خودکار</span></div>
    <div class="hstat"><b><i>∞</i></b><span>ولوم دائمی</span></div>
    <div class="hstat"><b><i>۱</i></b><span>لینک پنل</span></div>
  </div>
</section>

<section id="how">
  <div class="sec-head">
    <span class="sec-tag">⚙️ نحوه کار</span>
    <h2 class="sec-title">مراحل دیپلوی <span class="dot">.</span></h2>
    <p class="sec-desc">همه‌چیز خودکار است؛ شما فقط توکن و نام کاربری گیت‌هاب را وارد می‌کنید.</p>
  </div>
  <div class="steps">
    <div class="step">
      <span class="step-num">01</span>
      <div class="step-ico">🪙</div>
      <h3>گرفتن توکن</h3>
      <p>در Railway وارد <b>Account Settings → Tokens</b> شوید و یک توکن با دسترسی کامل بسازید.</p>
    </div>
    <div class="step">
      <span class="step-num">02</span>
      <div class="step-ico">🍴</div>
      <h3>فورک ریپو</h3>
      <p>ریپازیتوری اصلی سنایی را با یک کلیک در گیت‌هاب خودتان فورک کنید.</p>
    </div>
    <div class="step">
      <span class="step-num">03</span>
      <div class="step-ico">🔍</div>
      <h3>تشخیص خودکار</h3>
      <p>سرور، فورک شما را از گیت‌هاب پیدا می‌کند و اعتبار توکن را بررسی می‌کند.</p>
    </div>
    <div class="step">
      <span class="step-num">04</span>
      <div class="step-ico">⚡</div>
      <h3>دیپلوی واقعی</h3>
      <p>سرور روی Railway پروژه، سرویس، ولوم و دامنه را می‌سازد و دیپلوی را شروع می‌کند.</p>
    </div>
    <div class="step">
      <span class="step-num">05</span>
      <div class="step-ico">🎉</div>
      <h3>دریافت لینک</h3>
      <p>لینک پنل، دامنه و راهنمای ورود تحویل شما می‌شود و پنل آماده استفاده است.</p>
    </div>
  </div>
</section>

<section id="deploy">
  <div class="sec-head">
    <span class="sec-tag">🚀 دیپلوی</span>
    <h2 class="sec-title">دستیار دیپلوی خودکار <span class="dot">.</span></h2>
    <p class="sec-desc">توکن و اطلاعات گیت‌هاب را وارد کنید؛ بقیه کار با سرور است.</p>
  </div>

  <div class="wizard" id="wizard">
    <div class="wz-head">
      <div class="wz-title"><span class="ico">🤖</span> دستیار دیپلوی سنایی</div>
      <div class="wz-steps" id="wzDots"></div>
    </div>
    <div class="wz-body">

      <!-- STEP 1 -->
      <div class="wz-step active" data-step="1">
        <h3 style="margin-bottom:6px">۱. توکن Railway خود را وارد کنید</h3>
        <p class="hint" style="margin-bottom:18px">توکن فقط برای ارتباط با API ریلوی استفاده می‌شود و در حافظه سرور موقت است.</p>
        <div class="field">
          <label>توکن دسترسی Railway <span class="req">*</span></label>
          <div class="tok-wrap">
            <input type="password" id="tok" placeholder="r3rU8xxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false">
            <button class="tok-eye" id="tokEye" type="button">نمایش</button>
          </div>
          <div class="hint">مسیر ساخت توکن: <b>Railway → Account Settings → Tokens → Generate New Token</b> (دسترسی کامل)</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="goStep(2)">ادامه ←</button>
        </div>
      </div>

      <!-- STEP 2 -->
      <div class="wz-step" data-step="2">
        <h3 style="margin-bottom:6px">۲. اتصال به گیت‌هاب</h3>
        <p class="hint" style="margin-bottom:18px">با توکن کلاسیک گیت‌هاب، سرور خودش پروژه را فورک می‌کند — نیازی به فورک دستی نیست!</p>
        <div class="field">
          <label>توکن کلاسیک گیت‌هاب <span class="req">*</span></label>
          <div class="tok-wrap">
            <input type="password" id="ghTok" placeholder="ghp_xxxxxxxxxxxx" autocomplete="off" spellcheck="false">
            <button class="tok-eye" id="ghTokEye" type="button">نمایش</button>
          </div>
          <div class="hint">برای فورک خودکار و دیپلوی ریپوی سنایی لازم است.</div>
          <div class="hint" style="margin-top:8px">
            🔗 ساخت توکن کلاسیک: <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener" style="color:var(--acc)">github.com/settings/tokens/new</a><br>
            ⚙️ تنظیمات: <b>Expiration</b> دلخواه → تیک <b>repo</b> و <b>read:org</b> را بزنید → <b>Generate token</b> → کپی کنید
          </div>
        </div>
        <div class="field">
          <label>نام دلخواه برای فورک (اختیاری)</label>
          <input type="text" id="forkName" placeholder="sanaei-3xui-xxxxxx" spellcheck="false" dir="ltr" style="text-align:left">
          <div class="hint">خالی بگذارید — خودکار ساخته می‌شود.</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-acc btn-sm" id="forkBtn" onclick="autoFork()">🍴 فورک خودکار</button>
          <span class="hint" id="forkResult" style="margin-top:10px"></span>
        </div>
        <div class="btn-row">
          <button class="btn btn-ghost" onclick="goStep(1)">→ بازگشت</button>
          <button class="btn btn-primary" onclick="goStep(3)">ادامه ←</button>
        </div>
      </div>

      <!-- STEP 3 -->
      <div class="wz-step" data-step="3">
        <h3 style="margin-bottom:6px">۳. بررسی و تأیید اطلاعات</h3>
        <p class="hint" style="margin-bottom:18px">سرور، اعتبار توکن و فورک را بررسی می‌کند و دیپلوی واقعی شروع می‌شود.</p>
        <div class="field">
          <label>نام پروژه در Railway</label>
          <input type="text" id="projName" placeholder="sanaei-panel" spellcheck="false" dir="ltr" style="text-align:left">
          <div class="hint">اختیاری — اگر خالی بماند، خودکار ساخته می‌شود.</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-ghost" onclick="goStep(2)">→ بازگشت</button>
          <button class="btn btn-primary" id="startBtn" onclick="startDeploy()">🚀 شروع دیپلوی خودکار</button>
        </div>
      </div>

      <!-- STEP 4 -->
      <div class="wz-step" data-step="4">
        <h3 style="margin-bottom:6px">۴. در حال دیپلوی...</h3>
        <p class="hint" style="margin-bottom:14px">این کار معمولاً ۳ تا ۷ دقیقه طول می‌کشد. وضعیت به‌صورت زنده نمایش داده می‌شود.</p>
        <div class="prog-wrap">
          <div class="prog"><i id="progBar"></i></div>
          <div class="prog-labels"><span id="progLabel">آماده‌سازی...</span><b id="progPct">۰٪</b></div>
        </div>
        <div class="console" style="margin-top:14px">
          <div class="console-bar"><span class="c-dot r"></span><span class="c-dot y"></span><span class="c-dot g"></span><span>deployment-live.log</span></div>
          <div id="liveLog"><span class="log-dim">منتظر شروع...</span></div>
        </div>
      </div>

      <!-- STEP 5 -->
      <div class="wz-step" data-step="5">
        <div style="text-align:center;margin-bottom:20px">
          <div style="width:76px;height:76px;border-radius:50%;background:rgba(52,211,153,.12);border:2px solid rgba(52,211,153,.5);display:inline-grid;place-items:center;font-size:2rem;box-shadow:0 0 40px rgba(52,211,153,.25)">✅</div>
          <h3 style="margin-top:14px;color:#fff">پنل شما با موفقیت ساخته شد!</h3>
          <p class="hint">دیتابیس و تنظیمات روی ولوم دائمی ذخیره شده‌اند.</p>
        </div>
        <div class="result-grid" id="resultGrid"></div>
        <div style="text-align:center">
          <a class="link-btn" id="panelLink" href="#" target="_blank" rel="noopener">🔗 ورود به پنل سنایی</a>
        </div>
      </div>

    </div>
  </div>
</section>

<section id="faq">
  <div class="sec-head">
    <span class="sec-tag">❓ سوالات متداول</span>
    <h2 class="sec-title">هر آنچه باید بدانید <span class="dot">.</span></h2>
  </div>
  <div class="faq-item">
    <div class="faq-q"><span class="ar">+</span> توکن من کجا ذخیره می‌شود؟</div>
    <div class="faq-a">توکن به سرور دیپلوی ارسال می‌شود، فقط برای ارتباط با API ریلوی استفاده می‌گردد و بعد از پایان دیپلوی از حافظه حذف می‌شود. در هیچ دیتابیسی ذخیره نمی‌شود.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q"><span class="ar">+</span> چرا باید ریپازیتوری را فورک کنم؟</div>
    <div class="faq-a">Railway برای دیپلوی به ریپازیتوری نیاز دارد که به حساب شما متصل باشد. فورک کردن، مالکیت و دسترسی را به شما می‌دهد و می‌توانید تنظیمات را بعداً هم تغییر دهید.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q"><span class="ar">+</span> ولوم چیست و چرا مهم است؟</div>
    <div class="faq-a">ولوم یک فضای ذخیره‌سازی دائمی است که به کانتینر وصل می‌شود. دیتابیس و تنظیمات 3x-ui در آن ذخیره می‌شود تا با هر ری‌دیپلوی یا ری‌استارت، اطلاعات پاک نشود. سرور به‌صورت خودکار ولوم می‌سازد.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q"><span class="ar">+</span> ورود اولیه به پنل چگونه است؟</div>
    <div class="faq-a">نام کاربری و رمز عبور پیش‌فرض 3x-ui <b>admin/admin</b> است. حتماً بعد از اولین ورود، از بخش تنظیمات آن را تغییر دهید.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q"><span class="ar">+</span> آیا پنل روی پورت 3000 در دسترس است؟</div>
    <div class="faq-a">بله. این ریپازیتوری یک nginx داخلی دارد که همه‌چیز را روی پورت 3000 سرو می‌کند؛ دامنه Railway هم به همین پورت وصل می‌شود و پنل در مسیر <b>/managepanel/</b> در دسترس است.</div>
  </div>
</section>
</main>

<footer>
  <b>سنایی Sanaei</b> — دیپلوی خودکار پنل روی Railway • ساخته‌شده با ❤️ برای استفاده شخصی
</footer>

<div id="toasts"></div>

<script>
/* ================= LOADER ================= */
(function(){
  function hide(){ var l=document.getElementById('loader'); if(l) l.classList.add('hide'); }
  window.addEventListener('load',function(){setTimeout(hide,400);});
  setTimeout(hide,3000);
})();

/* ================= CONFIG ================= */
const API = (window.__API_BASE__ || ''); // آدرس بک‌اند — به‌صورت خودکار از همان دامنه
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
function ts(){ return new Date().toTimeString().slice(0,8); }
function toast(msg, type='ok'){
  const t=document.createElement('div');
  t.className='toast '+(type==='err'?'err':type==='warn'?'warn':type==='info'?'info':'');
  t.innerHTML=(type==='ok'?'✅ ':type==='err'?'⛔ ':type==='warn'?'⚠️ ':'ℹ️ ')+esc(msg);
  $('toasts').appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),450)},4200);
}

/* ================= API CALLS ================= */
async function api(path, body){
  const res = await fetch(API + path, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body || {}),
  });
  let j; try { j = await res.json(); } catch { throw new Error('پاسخ نامعتبر از سرور'); }
  if(!res.ok || j.ok === false) throw new Error(j.error || 'خطای سرور ('+res.status+')');
  return j;
}

/* ================= WIZARD ================= */
const STEP_COUNT = 5;
(function(){
  const d=$('wzDots');
  for(let i=1;i<=STEP_COUNT;i++){
    const s=document.createElement('span');
    s.className = i===1 ? 'wz-dot cur' : 'wz-dot';
    s.id='wzDot'+i; d.appendChild(s);
  }
})();
/* نمایش استپ اول به‌صورت پیش‌فرض */
document.querySelector('.wz-step[data-step="1"]')?.classList.add('active');
function goStep(n){
  if(n<1||n>STEP_COUNT)return;
  document.querySelectorAll('.wz-step').forEach(s=>s.classList.remove('active'));
  document.querySelector('.wz-step[data-step="'+n+'"]')?.classList.add('active');
  document.querySelectorAll('.wz-dot').forEach((d,i)=>{d.className='wz-dot'+(i+1<n?' done':i+1===n?' cur':'');});
  $('deploy')?.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ================= TOKEN EYE ================= */
$('tokEye').addEventListener('click',()=>{
  const t=$('tok');
  t.type = t.type==='password' ? 'text' : 'password';
  $('tokEye').textContent = t.type==='password' ? 'نمایش' : 'مخفی';
});
$('ghTokEye').addEventListener('click',()=>{
  const t=$('ghTok');
  t.type = t.type==='password' ? 'text' : 'password';
  $('ghTokEye').textContent = t.type==='password' ? 'نمایش' : 'مخفی';
});

/* ================= AUTO FORK ================= */
let forkedRepo = null;
async function autoFork(){
  const ghTok = $('ghTok').value.trim();
  if(!ghTok){ toast('ابتدا توکن کلاسیک گیت‌هاب را وارد کنید','err'); return; }
  const btn=$('forkBtn');
  btn.disabled=true; btn.innerHTML='<span class="spin"></span> در حال فورک...';
  $('forkResult').textContent='';
  try{
    const r = await api('/api/fork', { githubToken: ghTok, customName: $('forkName').value.trim() || undefined });
    forkedRepo = r.fork.fullName;
    $('forkResult').textContent = '✅ فورک ساخته شد: ' + r.fork.fullName;
    $('forkResult').style.color = 'var(--ok)';
    toast('فورک ساخته شد: '+r.fork.fullName,'ok');
  }catch(e){
    $('forkResult').textContent = '❌ ' + e.message;
    $('forkResult').style.color = 'var(--err)';
    toast(e.message,'err');
  }
  btn.disabled=false; btn.textContent='🍴 فورک خودکار';
}

/* ================= DEPLOY ================= */
let jobId = null, pollTimer = null;

function live(msg, cls='info'){
  const box=$('liveLog');
  if(box.querySelector('.log-dim')) box.innerHTML='';
  const line=document.createElement('div');
  line.className='log-line'; line.dataset.t=ts();
  const s=document.createElement('span'); s.className='log-'+cls; s.textContent=msg;
  line.appendChild(s); box.appendChild(line); box.scrollTop=box.scrollHeight;
}
function setProg(pct,label){
  $('progBar').style.width=Math.max(0,Math.min(100,pct))+'%';
  $('progPct').textContent=Math.round(pct)+'٪';
  if(label) $('progLabel').textContent=label;
}

async function startDeploy(){
  const token = $('tok').value.trim();
  const ghTok = $('ghTok').value.trim();
  if(!token){ toast('لطفاً توکن Railway را وارد کنید','err'); return; }
  if(!ghTok){ toast('لطفاً توکن کلاسیک گیت‌هاب را وارد کنید','err'); return; }
  const projName = $('projName').value.trim();

  const btn=$('startBtn');
  btn.disabled=true; btn.innerHTML='<span class="spin"></span> در حال ارسال...';
  goStep(4);
  live('ارسال درخواست به سرور دیپلوی...','info');
  try{
    // اگر فورک هنوز ساخته نشده، همینجا ساخته می‌شود (سرور خودش فورک می‌کند)
    const r = await api('/api/deploy', { token, repo: forkedRepo || undefined, projectName: projName, githubToken: ghTok });
    jobId = r.jobId;
    live('دیپلوی شروع شد — شناسه: '+jobId,'ok');
    setProg(4,'در حال پردازش...');
    pollTimer = setInterval(pollStatus, 3000);
  }catch(e){
    live('خطا: '+e.message,'err');
    toast(e.message,'err');
    btn.disabled=false; btn.innerHTML='🚀 شروع دیپلوی خودکار';
  }
}

async function pollStatus(){
  if(!jobId) return;
  try{
    const res = await fetch(API + '/api/status/' + jobId);
    const j = await res.json();
    if(!res.ok){ throw new Error(j.error || 'خطا'); }
    setProg(j.progress, j.message);
    // نمایش مراحل جدید
    const lastShown = parseInt($('liveLog').dataset.shown || '0');
    (j.steps || []).slice(lastShown).forEach(s=>{
      live(s.title + (s.detail ? ' — ' + s.detail : ''), s.title.includes('هشدار') ? 'warn' : 'info');
    });
    $('liveLog').dataset.shown = (j.steps || []).length;
    if(j.status === 'done' || j.status === 'error'){
      clearInterval(pollTimer);
      if(j.status === 'done' && j.result){
        setProg(100,'پنل آماده است!');
        live('✅ دیپلوی با موفقیت کامل شد','ok');
        showResult(j.result);
        goStep(5);
      }else{
        setProg(100,'خطا');
        live('⛔ '+(j.error || 'دیپلوی ناموفق'),'err');
        toast(j.error || 'دیپلوی ناموفق','err');
        $('startBtn').disabled=false; $('startBtn').innerHTML='🚀 شروع دیپلوی خودکار';
      }
    }
  }catch(e){
    // خطای موقت — ادامه بده
  }
}

/* ================= RESULT ================= */
function copy(text,btn){
  navigator.clipboard?.writeText(text).then(()=>{
    if(btn){ btn.textContent='✓ کپی شد'; setTimeout(()=>btn.textContent='کپی',1400); }
    toast('کپی شد','info');
  }).catch(()=>toast('کپی ناموفق','err'));
}
function showResult(r){
  const grid=$('resultGrid'); grid.innerHTML='';
  const mkRow=(k,v,btnTxt=null)=>{
    const row=document.createElement('div'); row.className='kv-row';
    row.innerHTML='<span class="kv-k">'+esc(k)+'</span><span class="kv-v">'+esc(v)+'</span>'+(btnTxt?'<button class="copy-btn">'+btnTxt+'</button>':'');
    if(btnTxt) row.querySelector('.copy-btn').addEventListener('click',()=>copy(v,row.querySelector('.copy-btn')));
    return row;
  };
  const c1=document.createElement('div'); c1.className='res-card';
  c1.innerHTML='<h4><span class="ic">🔗</span> آدرس پنل</h4><div class="kv"></div>';
  if(r.panelUrl){
    c1.querySelector('.kv').appendChild(mkRow('پنل', r.panelUrl,'کپی'));
    $('panelLink').href = r.panelUrl;
  } else {
    c1.querySelector('.kv').appendChild(mkRow('پنل','دامنه ساخته نشد — از بخش Networking بسازید'));
  }
  grid.appendChild(c1);

  const c2=document.createElement('div'); c2.className='res-card';
  c2.innerHTML='<h4><span class="ic">📊</span> مشخصات سرویس</h4><div class="kv"></div>';
  c2.querySelector('.kv').appendChild(mkRow('پروژه', r.projectId,'کپی'));
  c2.querySelector('.kv').appendChild(mkRow('سرویس', r.serviceId,'کپی'));
  c2.querySelector('.kv').appendChild(mkRow('ولوم','/etc/x-ui (دائمی)'));
  grid.appendChild(c2);

  const c3=document.createElement('div'); c3.className='res-card';
  c3.innerHTML='<h4><span class="ic">🔑</span> ورود اولیه</h4><div class="kv"></div>';
  c3.querySelector('.kv').appendChild(mkRow('نام کاربری','admin'));
  c3.querySelector('.kv').appendChild(mkRow('رمز عبور','admin'));
  c3.querySelector('.kv').appendChild(mkRow('مسیر پنل','/managepanel/'));
  grid.appendChild(c3);
}

/* ================= FAQ ================= */
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>q.parentElement.classList.toggle('open'));
});
</script>
</body>
</html>
`;

app.get('/', (req, res) => res.type('html').send(FRONTEND_HTML));
app.get('/health', (req, res) => res.json({ ok: true, service: 'sanaei-deployer', time: new Date().toISOString() }));

// ---------- API ----------

// بررسی اعتبار توکن ریلوی
app.post('/api/validate', async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'توکن الزامی است' });
  try {
    const info = await validateToken(token);
    res.json({ ok: true, user: info });
  } catch (e) {
    res.status(401).json({ ok: false, error: e.message });
  }
});

// فورک خودکار ریپوی سنایی (با توکن کلاسیک گیت‌هاب)
app.post('/api/fork', async (req, res) => {
  const { githubToken, customName } = req.body || {};
  if (!githubToken) return res.status(400).json({ ok: false, error: 'توکن گیت‌هاب لازم است' });
  try {
    const fork = await forkSanaei(githubToken, customName);
    res.json({ ok: true, fork });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// جستجوی خودکار فورک ریپوی سنایی
app.post('/api/find-fork', async (req, res) => {
  const { githubUser, githubToken } = req.body || {};
  if (!githubUser) return res.status(400).json({ ok: false, error: 'نام کاربری گیت‌هاب الزامی است' });
  try {
    const repo = await findForkRepo(githubUser, githubToken);
    res.json({ ok: true, repo });
  } catch (e) {
    res.status(404).json({ ok: false, error: e.message });
  }
});

// شروع دیپلوی کامل
app.post('/api/deploy', async (req, res) => {
  const { token, repo, projectName, githubToken } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'توکن الزامی است' });
  if (!repo) return res.status(400).json({ ok: false, error: 'ریپازیتوری الزامی است' });
  try {
    const job = await deploySanaei({ token, repo, projectName, githubToken });
    res.status(202).json({ ok: true, jobId: job.id, ...job.info });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// وضعیت دیپلوی (پولینگ از سمت سایت)
app.get('/api/status/:jobId', async (req, res) => {
  try {
    const st = await getDeployStatus(req.params.jobId);
    res.json(st);
  } catch (e) {
    res.status(404).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`✅ sanaei-deployer running on port ${PORT}`));
