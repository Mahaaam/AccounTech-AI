# 🚀 راهنمای دیپلوی AccounTech AI روی Netlify

## 📦 فایل‌های آماده

✅ **Build شده**: `frontend/dist/`  
✅ **تنظیمات Netlify**: `frontend/netlify.toml`  
✅ **Redirects**: `frontend/_redirects`

---

## 🌐 مراحل دیپلوی

### **روش 1: Netlify Drop (ساده‌ترین)** ⭐

1. برو به: https://app.netlify.com/drop
2. پوشه `frontend/dist` را **Drag & Drop** کن
3. چند ثانیه صبر کن
4. لینک سایت آماده است! 🎉

### **روش 2: Netlify CLI**

```bash
# نصب Netlify CLI
npm install -g netlify-cli

# ورود به حساب
netlify login

# دیپلوی
cd frontend
netlify deploy --prod --dir=dist
```

### **روش 3: GitHub Integration**

1. پوش کن پروژه را به GitHub
2. برو به Netlify Dashboard
3. New site from Git → انتخاب repo
4. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Deploy!

---

## ⚙️ تنظیمات مهم

### **Environment Variables** (در Netlify Dashboard)

اگر Backend جداگانه داری:
```
VITE_API_URL=https://your-backend-url.com
```

### **Backend Integration**

این Frontend فعلاً به `localhost:8000` متصل است.

**برای Production**:

1. **گزینه 1**: Backend را روی سرویسی مثل Railway, Render یا Heroku دیپلوی کن
2. **گزینه 2**: از Netlify Functions استفاده کن (نیاز به تغییرات)
3. **گزینه 3**: Backend را روی VPS خودت بذار

بعد از دیپلوی Backend، فایل `frontend/netlify.toml` را ویرایش کن:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://YOUR-BACKEND-URL.com/api/:splat"
  status = 200
  force = true
```

---

## 🔧 Build موفق

```
✓ 2320 modules transformed
✓ dist/index.html                   0.77 kB
✓ dist/assets/index-DkRSVBdO.css   29.16 kB
✓ dist/assets/index-nZoSCq6v.js   736.17 kB
✓ built in 4.32s
```

---

## 📁 ساختار فایل‌های Build

```
frontend/dist/
├── index.html
├── assets/
│   ├── index-DkRSVBdO.css
│   └── index-nZoSCq6v.js
└── vite.svg
```

---

## ⚠️ نکات مهم

### **1. Backend جداگانه نیاز است**

این Frontend فقط رابط کاربری است. برای عملکرد کامل نیاز به Backend دارید که:
- FastAPI Server
- SQLite Database
- Authentication System
- Voice & OCR Processing

### **2. گزینه‌های Backend**

**رایگان**:
- Railway (500 ساعت/ماه رایگان)
- Render (750 ساعت/ماه رایگان)
- Fly.io (رایگان محدود)

**پولی**:
- DigitalOcean ($5/ماه)
- Linode ($5/ماه)
- AWS/GCP/Azure

### **3. دیتابیس**

SQLite برای production توصیه نمی‌شود. بهتر است:
- PostgreSQL (Supabase, Neon رایگان)
- MySQL
- MongoDB

---

## 🎯 چک‌لیست دیپلوی

- [x] Frontend build شد
- [x] فایل netlify.toml ایجاد شد
- [x] فایل _redirects ایجاد شد
- [ ] Backend دیپلوی شود
- [ ] Environment variables تنظیم شوند
- [ ] URL Backend در netlify.toml قرار بگیرد
- [ ] تست نهایی

---

## 🚀 دیپلوی سریع

**همین الان می‌خوای دیپلوی کنی؟**

1. برو به: https://app.netlify.com/drop
2. پوشه `E:\Repsitory\ACCOUNTING\frontend\dist` را بکش و بنداز
3. لینک سایت رو بگیر!

**نکته**: بدون Backend، فقط صفحه Login نمایش داده می‌شود.

---

## 📞 پشتیبانی

اگر مشکلی پیش آمد:
- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://answers.netlify.com

---

**✨ موفق باشید!**
