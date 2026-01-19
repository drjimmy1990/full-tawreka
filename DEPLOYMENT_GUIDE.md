# Tawreka Full Deployment Guide v2.0 - aaPanel (Ubuntu VPS)

Complete guide for deploying the Tawreka restaurant platform, including fresh deployment, redeployment, and self-hosted Supabase options.

---

## 📋 Project Components

| Component | Type | Port | Purpose |
|-----------|------|------|---------|
| `backend-api` | Node.js (Express) | 4001 | REST API + Paymob Integration |
| `tawriqa-web` | Static (React/Vite) | 80/443 | Customer Website |
| `tawreka-system` | Static (React/Vite) | 80/443 | Admin/Kitchen Panel |

## 🌐 Domain Structure

```
tawreka.com          → Customer Website (tawriqa-web)
kitchen.tawreka.com  → Admin Panel (tawreka-system)
api.tawreka.com      → Backend API (backend-api)
supabase.tawreka.com → Self-hosted Supabase (optional)
```

---

# 🧹 PART 0: Stop and Delete Existing Deployment

> **Run these commands BEFORE redeploying to ensure a clean slate.**

## 0.1 Stop and Delete Backend API

```bash
# Check current running apps
npx pm2 list

# Stop the backend
npx pm2 stop tawreka-api

# Delete from PM2
npx pm2 delete tawreka-api

# Save the new PM2 state (no apps)
npx pm2 save

# Optional: Remove all files
rm -rf /www/wwwroot/api.tawreka.com/*
```

## 0.2 Delete Website in aaPanel

1. Go to **aaPanel → Website**
2. Click on `api.tawreka.com` → **Delete** → Check "Delete site files" → Confirm
3. Repeat for `tawreka.com` and `kitchen.tawreka.com` if needed

## 0.3 Clear Node.js Cache (Optional)

```bash
# Clear npm cache
npm cache clean --force

# Remove global npm modules (if any)
rm -rf ~/.npm
```

---

# 📦 PART 1: Prerequisites

## 1.1 Install Required aaPanel Software
In aaPanel → App Store, install:
- ✅ **Nginx** (Latest)
- ✅ **Docker** (for self-hosted Supabase)

## 1.2 Install Node.js

```bash
# Download and install n and Node.js
curl -fsSL https://raw.githubusercontent.com/mklement0/n-install/stable/bin/n-install | bash

# Reload shell
source ~/.bashrc

# Verify installation
node -v  # Should print v24.x.x
npm -v   # Should print 11.x.x
```

---

# 🚀 PART 2: Deploy Backend API (Fresh Install)

## 2.1 Create Project Directory

```bash
mkdir -p /www/wwwroot/api.tawreka.com
cd /www/wwwroot/api.tawreka.com
```

## 2.2 Upload Backend Code

**Option A - Git Clone:**
```bash
git clone https://github.com/YOUR_USER/full-tawreka.git temp
mv temp/backend-api/* .
rm -rf temp
```

**Option B - Upload via aaPanel Files:**
1. Go to aaPanel → Files
2. Navigate to `/www/wwwroot/api.tawreka.com`
3. Upload `backend-api` folder contents

## 2.3 Install Dependencies

```bash
cd /www/wwwroot/api.tawreka.com
npm install
```

## 2.4 Create Environment File

```bash
nano /www/wwwroot/api.tawreka.com/.env
```

### For Cloud Supabase:
```env
# Server
PORT=4001
NODE_ENV=production

# Supabase Cloud
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY

# Paymob Egypt
PAYMOB_API_KEY=YOUR_PAYMOB_API_KEY
PAYMOB_INTEGRATION_ID=YOUR_INTEGRATION_ID
PAYMOB_IFRAME_ID=YOUR_IFRAME_ID

# CORS
ALLOWED_ORIGINS=https://tawreka.com,https://kitchen.tawreka.com

# API Security
API_KEY=YOUR_SECURE_API_KEY
```

### For Self-Hosted Supabase:
```env
# Server
PORT=4001
NODE_ENV=production

# Self-Hosted Supabase
SUPABASE_URL=https://supabase.tawreka.com
SUPABASE_SERVICE_KEY=YOUR_SELF_HOSTED_SERVICE_KEY

# Paymob Egypt
PAYMOB_API_KEY=YOUR_PAYMOB_API_KEY
PAYMOB_INTEGRATION_ID=YOUR_INTEGRATION_ID
PAYMOB_IFRAME_ID=YOUR_IFRAME_ID

# CORS
ALLOWED_ORIGINS=https://tawreka.com,https://kitchen.tawreka.com

# API Security
API_KEY=YOUR_SECURE_API_KEY
```

## 2.5 Build TypeScript

```bash
npm run build
```

## 2.6 Start with PM2

```bash
# Start the API
npx pm2 start dist/index.js --name "tawreka-api"

# Save for auto-restart
npx pm2 save

# Configure startup on reboot
npx pm2 startup
# Copy and run the command it outputs!
```

### PM2 Commands Reference
```bash
npx pm2 status           # Check status
npx pm2 logs tawreka-api # View logs
npx pm2 restart tawreka-api # Restart
npx pm2 stop tawreka-api    # Stop
npx pm2 delete tawreka-api  # Delete
npx pm2 monit            # Real-time monitor
```

## 2.7 Configure aaPanel Website for API

1. **aaPanel → Website → Add Site**
2. Domain: `api.tawreka.com`
3. PHP Version: **Pure Static**
4. Create Database: **No**

## 2.8 Configure Reverse Proxy

1. Click `api.tawreka.com` → **Reverse Proxy**
2. Add:
   - Name: `nodejs`
   - Target URL: `http://127.0.0.1:4001`
   - Send Domain: `$host`

**Or manually edit Nginx config:**
```nginx
location / {
    proxy_pass http://127.0.0.1:4001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## 2.9 Enable SSL

1. Go to `api.tawreka.com` → **SSL**
2. Click **Let's Encrypt** → Issue
3. Enable **Force HTTPS**

---

# 🍽️ PART 3: Deploy Customer Website (tawriqa-web)

## 3.1 Update Environment Locally
Before building, update `.env`:
```env
VITE_API_URL=https://api.tawreka.com
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

> **For Self-Hosted Supabase:** Replace with `https://supabase.tawreka.com`

## 3.2 Build Locally

```bash
cd tawriqa-web
npm run build
```

## 3.3 Create Website in aaPanel

1. **aaPanel → Website → Add Site**
2. Domain: `tawreka.com` and `www.tawreka.com`
3. Root: `/www/wwwroot/tawreka.com`
4. PHP: **Pure Static**

## 3.4 Upload Files

Upload `dist/` folder contents to `/www/wwwroot/tawreka.com/`

## 3.5 Configure SPA Routing

Add to Nginx config or URL Rewrite:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 3.6 Enable SSL

1. SSL → Let's Encrypt (for both `tawreka.com` and `www.tawreka.com`)
2. Enable **Force HTTPS**

---

# 🍳 PART 4: Deploy Admin Panel (tawreka-system)

Same process as customer website:

1. Update `.env` with production Supabase URL
2. Build: `npm run build`
3. Create site: `kitchen.tawreka.com`
4. Upload `dist/` contents
5. Configure SPA routing
6. Enable SSL

---

# 🛠️ PART 5: Self-Hosted Supabase Deployment (Optional)

> Use this if you want full control of your database instead of Supabase Cloud.

## 5.1 Prerequisites

```bash
# Install Docker
apt-get update && apt-get install -y docker.io docker-compose

# Start Docker
systemctl start docker
systemctl enable docker
```

## 5.2 Clone Supabase Self-Hosted

```bash
mkdir -p /www/supabase
cd /www/supabase

# Clone the official Supabase Docker setup
git clone --depth 1 https://github.com/supabase/supabase.git
cd supabase/docker
```

## 5.3 Configure Environment

```bash
cp .env.example .env
nano .env
```

**Key variables to configure:**
```env
# Site URL
SITE_URL=https://supabase.tawreka.com
API_EXTERNAL_URL=https://supabase.tawreka.com

# JWT Secrets (Generate new ones!)
JWT_SECRET=your-super-secret-jwt-token-minimum-32-characters
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key

# Database
POSTGRES_PASSWORD=your-secure-db-password

# Studio (Admin Dashboard)
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your-dashboard-password
```

### Generate JWT Keys
```bash
# Generate a random JWT secret
openssl rand -base64 32

# Use the official Supabase key generator
# https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
```

## 5.4 Start Supabase

```bash
cd /www/supabase/supabase/docker
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
```

All containers should be "Up".

## 5.5 Configure aaPanel Reverse Proxy for Supabase

1. **aaPanel → Website → Add Site**
2. Domain: `supabase.tawreka.com`
3. PHP: **Pure Static**

4. Configure **Reverse Proxy**:
   - Name: `supabase`
   - Target URL: `http://127.0.0.1:8000`

**Or manually add to Nginx:**
```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
}
```

5. Enable SSL for `supabase.tawreka.com`

## 5.6 Update Application Environment Files

**Backend API `.env`:**
```env
SUPABASE_URL=https://supabase.tawreka.com
SUPABASE_SERVICE_KEY=YOUR_SELF_HOSTED_SERVICE_ROLE_KEY
```

**tawriqa-web `.env`:**
```env
VITE_SUPABASE_URL=https://supabase.tawreka.com
VITE_SUPABASE_ANON_KEY=YOUR_SELF_HOSTED_ANON_KEY
```

**tawreka-system `.env`:**
```env
VITE_SUPABASE_URL=https://supabase.tawreka.com
VITE_SUPABASE_ANON_KEY=YOUR_SELF_HOSTED_ANON_KEY
```

## 5.7 Import Database Schema

Access Supabase Studio at `https://supabase.tawreka.com` and run the SQL schema from `tawreka-system/supabase.sql`.

---

# 🔄 PART 6: Updating Existing Deployment

## Update Backend API

```bash
cd /www/wwwroot/api.tawreka.com

# Stop current version
npx pm2 stop tawreka-api

# Upload new files or git pull
# git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
npx pm2 restart tawreka-api
```

## Update Frontend Sites

1. Build locally: `npm run build`
2. Delete old files on server:
   ```bash
   rm -rf /www/wwwroot/tawreka.com/*
   ```
3. Upload new `dist/` contents
4. Clear browser cache (Ctrl+Shift+R)

---

# 🐛 PART 7: Troubleshooting

## Backend Not Starting
```bash
# Check logs
npx pm2 logs tawreka-api

# Check port usage
netstat -tlnp | grep 4001

# Restart everything
npx pm2 delete tawreka-api
npx pm2 start dist/index.js --name "tawreka-api"
```

## 502 Bad Gateway
- Check if Node.js is running: `npx pm2 status`
- Check reverse proxy config
- Verify port 4001 is correct

## CORS Errors
- Check `ALLOWED_ORIGINS` in backend `.env`
- Ensure frontend uses HTTPS API URL

## SPA Routes Return 404
```bash
# Add to Nginx config
location / {
    try_files $uri $uri/ /index.html;
}

# Restart Nginx
nginx -t && nginx -s reload
```

## Self-Hosted Supabase Issues
```bash
# Check container logs
cd /www/supabase/supabase/docker
docker-compose logs -f

# Restart all containers
docker-compose restart

# Full reset
docker-compose down
docker-compose up -d
```

---

# 📁 Final Directory Structure

```
/www/wwwroot/
├── api.tawreka.com/          # Backend API (Node.js)
│   ├── dist/                  # Compiled JS
│   ├── node_modules/
│   ├── .env
│   └── package.json
│
├── tawreka.com/              # Customer Website (Static)
│   ├── index.html
│   └── assets/
│
├── kitchen.tawreka.com/      # Admin Panel (Static)
│   ├── index.html
│   └── assets/
│
/www/supabase/ (Optional)
└── supabase/docker/          # Self-hosted Supabase
    ├── docker-compose.yml
    └── .env
```

---

# ✅ Deployment Checklist

## Cloud Supabase
- [ ] Stopped/deleted old deployments
- [ ] Backend API running on PM2
- [ ] API reverse proxy configured
- [ ] Customer website with SPA routing
- [ ] Admin panel with SPA routing
- [ ] SSL certificates for all domains
- [ ] Environment variables configured
- [ ] CORS configured
- [ ] Tested order flow

## Self-Hosted Supabase (Additional)
- [ ] Docker installed
- [ ] Supabase containers running
- [ ] Supabase reverse proxy configured
- [ ] SSL for supabase subdomain
- [ ] JWT keys generated and configured
- [ ] Database schema imported
- [ ] All apps using self-hosted URLs
