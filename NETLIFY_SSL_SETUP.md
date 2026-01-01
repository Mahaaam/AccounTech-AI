# 🔐 راهنمای تنظیم SSL برای etherium.group در Netlify

## ✅ وضعیت فعلی
- ✅ پروژه روی Netlify آپلود شده
- ✅ دامین etherium.group به Netlify متصل شده
- ⚠️ SSL Certificate نیاز به تنظیم دارد

---

## 🌐 مرحله 1: بررسی DNS Records

در پنل مدیریت دامین `etherium.group`، مطمئن شوید این رکوردها وجود دارند:

### **برای Netlify**:

```
Type    Name    Value                           TTL
A       @       75.2.60.5                       3600
CNAME   www     YOUR-SITE-NAME.netlify.app      3600
```

**یا اگر از Netlify DNS استفاده می‌کنید**:

```
Type    Name    Value                           TTL
CNAME   @       YOUR-SITE-NAME.netlify.app      3600
CNAME   www     YOUR-SITE-NAME.netlify.app      3600
```

---

## 🔧 مرحله 2: تنظیم Custom Domain در Netlify

### **2.1. رفتن به تنظیمات دامین**

1. برو به Netlify Dashboard
2. سایت خود را انتخاب کن
3. **Site settings** → **Domain management**

### **2.2. اضافه کردن Custom Domain**

1. کلیک روی **Add custom domain**
2. وارد کن: `etherium.group`
3. کلیک روی **Verify**
4. اگر DNS صحیح باشد، Netlify تأیید می‌کند

### **2.3. اضافه کردن www**

1. دوباره کلیک روی **Add domain alias**
2. وارد کن: `www.etherium.group`
3. **Verify**

---

## 🔐 مرحله 3: فعال‌سازی SSL

### **3.1. تنظیمات HTTPS**

1. در همان صفحه **Domain management**
2. پایین بیا به بخش **HTTPS**
3. کلیک روی **Verify DNS configuration**

### **3.2. صدور گواهی SSL**

اگر DNS صحیح باشد:

1. Netlify به صورت خودکار شروع به صدور SSL می‌کند
2. این فرآیند **5 تا 24 ساعت** طول می‌کشد
3. وضعیت را در همین صفحه می‌بینی:
   - ⏳ **Provisioning certificate** (در حال صدور)
   - ✅ **Certificate active** (فعال شد)

### **3.3. فعال‌سازی Force HTTPS**

بعد از صدور SSL:

1. در بخش **HTTPS**
2. فعال کن: **Force HTTPS**
3. این باعث می‌شود همه درخواست‌های HTTP به HTTPS redirect شوند

---

## ⚠️ مشکلات رایج و راه‌حل

### **مشکل 1: DNS Not Configured**

**علت**: DNS records صحیح تنظیم نشده

**راه‌حل**:
```
1. برو به پنل مدیریت دامین
2. DNS records را بررسی کن
3. مطمئن شو که به Netlify اشاره می‌کنند
4. صبر کن 1-2 ساعت برای propagate شدن DNS
```

**بررسی DNS**:
```bash
# در Command Prompt یا Terminal
nslookup etherium.group
nslookup www.etherium.group
```

باید به IP یا CNAME مربوط به Netlify اشاره کنند.

### **مشکل 2: SSL Certificate Provisioning Failed**

**علت**: مشکل در تأیید مالکیت دامین

**راه‌حل**:
```
1. Remove domain از Netlify
2. صبر کن 10 دقیقه
3. دوباره domain را اضافه کن
4. Verify DNS configuration
```

### **مشکل 3: Certificate Stuck on Provisioning**

**علت**: DNS هنوز propagate نشده

**راه‌حل**:
```
1. صبر کن 24 ساعت
2. اگر باز هم مشکل داشت، با Netlify Support تماس بگیر
```

---

## 🔍 بررسی DNS فعلی

### **چک کردن DNS Records**:

```bash
# Windows (Command Prompt)
nslookup etherium.group
nslookup www.etherium.group

# یا
ping etherium.group
ping www.etherium.group
```

### **چک کردن SSL**:

```bash
# در مرورگر
https://etherium.group
https://www.etherium.group
```

یا از ابزار آنلاین:
- https://www.ssllabs.com/ssltest/
- https://www.digwebinterface.com/

---

## 📋 DNS Records صحیح برای Netlify

### **گزینه 1: استفاده از Netlify DNS** (توصیه می‌شود)

اگر می‌خوای از DNS خود Netlify استفاده کنی:

1. در Netlify Dashboard → **Domain settings**
2. کلیک روی **Use Netlify DNS**
3. Nameserverهای Netlify را کپی کن
4. در پنل دامین، Nameserverها را تغییر بده به:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```

### **گزینه 2: استفاده از DNS فعلی**

اگر می‌خوای DNS فعلی را نگه داری:

```
Type    Name    Value                           TTL
A       @       75.2.60.5                       3600
CNAME   www     YOUR-SITE-NAME.netlify.app      3600
```

**نکته**: `YOUR-SITE-NAME` را با نام واقعی سایت Netlify خودت جایگزین کن.

برای پیدا کردن نام سایت:
1. برو به Netlify Dashboard
2. نام سایت در بالا نوشته شده (مثلاً: `accountech-ai.netlify.app`)

---

## 🚀 مراحل سریع

### **اگر DNS صحیح است**:

1. ✅ Netlify Dashboard → Site settings → Domain management
2. ✅ Add custom domain: `etherium.group`
3. ✅ Add domain alias: `www.etherium.group`
4. ✅ Verify DNS configuration
5. ⏳ صبر کن 5-24 ساعت برای صدور SSL
6. ✅ Force HTTPS را فعال کن

### **اگر DNS صحیح نیست**:

1. برو به پنل مدیریت دامین
2. DNS records را اصلاح کن
3. صبر کن 1-2 ساعت
4. مراحل بالا را انجام بده

---

## 📞 پشتیبانی Netlify

اگر بعد از 24 ساعت SSL صادر نشد:

1. **Netlify Support**: https://www.netlify.com/support/
2. **Community Forum**: https://answers.netlify.com/
3. **Twitter**: @Netlify

---

## ✅ چک‌لیست

- [ ] DNS records صحیح تنظیم شده
- [ ] DNS propagate شده (1-2 ساعت)
- [ ] Custom domain در Netlify اضافه شده
- [ ] DNS configuration verified شده
- [ ] SSL certificate در حال صدور است
- [ ] SSL certificate صادر شده
- [ ] Force HTTPS فعال شده
- [ ] سایت با HTTPS در دسترس است

---

## 🎯 نتیجه نهایی

بعد از تکمیل این مراحل:

- ✅ https://etherium.group → سایت شما با SSL
- ✅ https://www.etherium.group → redirect به بالا
- ✅ http://etherium.group → redirect به https
- ✅ گواهی SSL معتبر از Let's Encrypt

---

**🔐 موفق باشید!**
