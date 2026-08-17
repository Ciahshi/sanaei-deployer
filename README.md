# 🚀 سنایی دیپلویِر (Sanaei Deployer)

دیپلوی خودکار و **واقعی** پنل سنایی (3x-ui) روی Railway.

این پروژه یک **بک‌اند واقعی** است که از سمت سرور به API ریلوی وصل می‌شود (بدون محدودیت CORS) و کل فرآیند دیپلوی را انجام می‌دهد.

## 📁 ساختار پروژه

```
sanaei-deployer/
├── server.js          # سرور Express (صفحه + API)
├── sanaei.js          # منطق دیپلوی (کوئری‌های GraphQL ریلوی)
├── public/index.html  # فرانت‌اند (سایت فارسی)
├── package.json
├── Dockerfile
└── railway.json
```

## ⚙️ مراحل دیپلوی (خودکار)

| # | مرحله | توضیح |
|---|-------|-------|
| 1 | بررسی توکن | اتصال به API ریلوی و اعتبارسنجی |
| 2 | دریافت ورک‌اسپیس | پیدا کردن workspace کاربر |
| 3 | ساخت پروژه | `projectCreate` |
| 4 | پیدا کردن محیط | `project.environments` |
| 5 | ساخت سرویس | `serviceCreate` با سورس گیت‌هاب |
| 6 | ساخت ولوم | `volumeCreate` روی `/etc/x-ui` (دائمی) |
| 7 | ساخت دامنه | `serviceDomainCreate` روی پورت 3000 |
| 8 | شروع دیپلوی | `serviceInstanceDeployV2` |
| 9 | پولینگ وضعیت | `deployments` تا آماده‌شدن |

## 🚀 دیپلوی روی Railway

### روش ۱: دکمه دیپلوی (سریع)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/sanaei-deployer)

> ⚠️ بعد از فورک، آدرس ریپو خودتان را جایگزین کنید.

### روش ۲: دستی

1. این ریپو را در گیت‌هاب خودتان فورک کنید
2. در Railway → **New Project → Deploy from GitHub repo** → ریپوی فورک‌شده را انتخاب کنید
3. Railway به‌صورت خودکار `Dockerfile` را تشخیص می‌دهد
4. بعد از دیپلوی، در **Settings → Networking → Generate Domain** یک دامنه بسازید
5. دامنه شما = آدرس سایت

## 🔑 نحوه استفاده

1. سایت را باز کنید
2. توکن Railway خود را وارد کنید (Account Settings → Tokens → Generate)
3. نام کاربری گیت‌هاب را وارد کنید (ریپو `3x-ui` را قبلاً فورک کرده باشید)
4. روی «شروع دیپلوی خودکار» بزنید
5. منتظر بمانید — لینک پنل در پایان نمایش داده می‌شود

## 🔌 API

| Method | Path | توضیح |
|--------|------|-------|
| GET | `/health` | بررسی سلامت |
| POST | `/api/validate` | اعتبارسنجی توکن `{token}` |
| POST | `/api/find-fork` | پیدا کردن فورک `{githubUser}` |
| POST | `/api/deploy` | شروع دیپلوی `{token, repo, projectName}` |
| GET | `/api/status/:jobId` | وضعیت دیپلوی |

## 📝 نکات امنیتی

- توکن فقط در حافظه (RAM) نگه داشته می‌شود و در هیچ دیتابیسی ذخیره نمی‌شود
- بعد از پایان دیپلوی، توکن از حافظه حذف می‌شود
- ولوم روی `/etc/x-ui` باعث می‌شود اطلاعات پنل با ری‌دیپلوی پاک نشود
