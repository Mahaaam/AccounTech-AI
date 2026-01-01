# 🚀 راهنمای دیپلوی AccounTech AI روی etherium.group

## 📋 پیش‌نیازها

### **سرور**
- Ubuntu 20.04+ یا Debian 11+
- حداقل 2GB RAM
- حداقل 20GB فضای دیسک
- دسترسی root یا sudo

### **نرم‌افزارها**
- Docker
- Docker Compose
- Git

---

## 🔧 نصب Docker (اگر نصب نیست)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## 🌐 تنظیمات DNS

در پنل مدیریت دامین `etherium.group`، رکوردهای زیر را اضافه کنید:

```
Type    Name    Value           TTL
A       @       YOUR_SERVER_IP  3600
A       www     YOUR_SERVER_IP  3600
A       api     YOUR_SERVER_IP  3600
```

**بررسی DNS**:
```bash
dig etherium.group
dig www.etherium.group
dig api.etherium.group
```

---

## 📦 دیپلوی پروژه

### **مرحله 1: آپلود فایل‌ها**

```bash
# Connect to server
ssh root@YOUR_SERVER_IP

# Create directory
mkdir -p /opt/accountech
cd /opt/accountech

# Upload project files (از کامپیوتر محلی)
# روش 1: با scp
scp -r E:\Repsitory\ACCOUNTING/* root@YOUR_SERVER_IP:/opt/accountech/

# روش 2: با Git
git clone YOUR_REPO_URL .
```

### **مرحله 2: تنظیمات اولیه**

```bash
cd /opt/accountech

# Make deploy script executable
chmod +x deploy.sh

# Create necessary directories
mkdir -p nginx/certs nginx/vhost.d nginx/html nginx/acme
mkdir -p backend/data

# Set password (optional)
echo "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918" > backend/app_password.txt
```

### **مرحله 3: دیپلوی**

```bash
# Run deployment script
./deploy.sh
```

یا به صورت دستی:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Initialize database
docker exec accountech-backend python init_db.py

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## 🔐 SSL Certificate (Let's Encrypt)

گواهی SSL به صورت خودکار توسط `acme-companion` صادر می‌شود.

**بررسی وضعیت SSL**:
```bash
# Check logs
docker logs nginx-proxy-acme

# Check certificates
ls -la nginx/certs/
```

**اگر SSL صادر نشد**:
```bash
# Restart acme-companion
docker restart nginx-proxy-acme

# Check logs
docker logs -f nginx-proxy-acme
```

---

## 📊 مدیریت سرویس‌ها

### **مشاهده لاگ‌ها**
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f accountech-backend
docker logs -f accountech-frontend
docker logs -f nginx-proxy
```

### **ری‌استارت سرویس‌ها**
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker restart accountech-backend
docker restart accountech-frontend
```

### **توقف سرویس‌ها**
```bash
docker-compose -f docker-compose.prod.yml down
```

### **بروزرسانی**
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 بررسی وضعیت

### **سلامت سرویس‌ها**
```bash
# Check running containers
docker ps

# Check service health
curl http://localhost:8000/docs
curl http://localhost:80
```

### **دسترسی به دیتابیس**
```bash
docker exec -it accountech-backend bash
cd data
sqlite3 accounting.db
```

---

## 🌐 دسترسی به سایت

بعد از دیپلوی موفق:

- **Frontend**: https://etherium.group
- **Backend API**: https://api.etherium.group
- **API Docs**: https://api.etherium.group/docs

**اطلاعات ورود پیش‌فرض**:
- رمز عبور: `admin`

---

## 🔒 امنیت

### **تغییر رمز عبور**
```bash
# Generate new password hash (SHA256 of your password)
echo -n "YOUR_NEW_PASSWORD" | sha256sum

# Update password file
echo "NEW_HASH" > backend/app_password.txt

# Restart backend
docker restart accountech-backend
```

### **فایروال**
```bash
# Install UFW
sudo apt install ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### **بکاپ دیتابیس**
```bash
# Create backup
docker exec accountech-backend tar -czf /tmp/backup.tar.gz /app/data

# Copy to host
docker cp accountech-backend:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz
```

---

## 🐛 عیب‌یابی

### **مشکل: سرویس‌ها start نمی‌شوند**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h
```

### **مشکل: SSL صادر نمی‌شود**
```bash
# Check DNS
dig etherium.group

# Check acme logs
docker logs nginx-proxy-acme

# Restart acme
docker restart nginx-proxy-acme
```

### **مشکل: Backend به Frontend متصل نمی‌شود**
```bash
# Check network
docker network inspect accountech_accountech-network

# Check backend health
docker exec accountech-backend curl http://localhost:8000/docs
```

---

## 📞 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌ها را بررسی کنید
2. وضعیت containerها را چک کنید
3. DNS و SSL را بررسی کنید

---

## ✅ چک‌لیست دیپلوی

- [ ] Docker و Docker Compose نصب شده
- [ ] DNS تنظیم شده (A record برای @, www, api)
- [ ] فایل‌های پروژه آپلود شده
- [ ] اسکریپت deploy.sh اجرا شده
- [ ] سرویس‌ها در حال اجرا هستند
- [ ] SSL صادر شده (ممکن است 5-10 دقیقه طول بکشد)
- [ ] سایت در دسترس است
- [ ] رمز عبور تغییر کرده

---

**🎉 موفق باشید!**
