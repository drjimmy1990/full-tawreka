# Tawreka Full Deployment Guide - aaPanel (Ubuntu VPS)

This guide covers deploying all 3 components of the Tawreka restaurant platform on an Ubuntu VPS with aaPanel.

## 📋 Project Components

| Component | Type | Port | Purpose |
|-----------|------|------|---------|
| `backend-api` | Node.js (Express) | 4001 | REST API + Paymob Integration |
| `tawriqa-web` | Static (React/Vite) | 80/443 | Customer Website |
| `tawreka-system` | Static (React/Vite) | 80/443 | Admin/Kitchen Panel |

## 🌐 Recommended Domain Structure

```
tawreka.com          → Customer Website (tawriqa-web)
kitchen.tawreka.com  → Admin Panel (tawreka-system)
api.tawreka.com      → Backend API (backend-api)
```

---

## 📦 Prerequisites

### 1. Install Required aaPanel Software
In aaPanel → App Store, install:
- ✅ **Nginx** (Latest)

### 2. SSH Access
You need SSH access to upload files and run commands.

### 3. Install Node.js (Required)
Use the `n` Node version manager (tested and working):
```bash
# Download and install n and Node.js
curl -fsSL https://raw.githubusercontent.com/mklement0/n-install/stable/bin/n-install | bash

# Reload shell
source ~/.bashrc

# Verify installation
node -v  # Should print v24.x.x or similar
npm -v   # Should print 11.x.x or similar
```

---

## 🚀 PART 1: Deploy Backend API (Node.js)

### Step 1: Create Node Project Directory
```bash
mkdir -p /www/wwwroot/api.tawreka.com
cd /www/wwwroot/api.tawreka.com
```

### Step 2: Upload Backend Code
Option A - Git Clone:
```bash
git clone https://github.com/drjimmy1990/full-tawreka.git temp
mv temp/backend-api/* .
rm -rf temp
```

Option B - Upload via aaPanel Files:
1. Go to aaPanel → Files
2. Navigate to `/www/wwwroot/api.tawreka.com`
3. Upload `backend-api` folder contents

### Step 3: Install Dependencies
```bash
cd /www/wwwroot/api.tawreka.com
npm install
```

### Step 4: Create Production Environment File
Create `.env` file:
```bash
nano /www/wwwroot/api.tawreka.com/.env
```

Add these variables:
```env
# Server
PORT=4001
NODE_ENV=production

# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY

# Paymob Egypt
PAYMOB_API_KEY=YOUR_PAYMOB_API_KEY
PAYMOB_INTEGRATION_ID=YOUR_INTEGRATION_ID
PAYMOB_IFRAME_ID=YOUR_IFRAME_ID

# CORS - Add your domains
ALLOWED_ORIGINS=https://tawreka.com,https://kitchen.tawreka.com

# API Security
API_KEY=YOUR_SECURE_API_KEY
```

### Step 5: Build TypeScript
```bash
npm run build
```

### Step 6: Start with PM2 (Process Manager)
Use `npx` to run PM2 (avoids global path issues):
```bash
# Start the API
npx pm2 start dist/index.js --name "tawreka-api"

# Save process list for auto-restart
npx pm2 save

# Configure PM2 to start on server reboot
npx pm2 startup
```

> **Note**: After running `pm2 startup`, copy and run the command it outputs to enable auto-start.

### PM2 Management Commands
```bash
# Check status
npx pm2 status

# View logs
npx pm2 logs tawreka-api

# Restart the API
npx pm2 restart tawreka-api

# Stop the API
npx pm2 stop tawreka-api

# Delete from PM2 (stops and removes)
npx pm2 delete tawreka-api

# Monitor in real-time
npx pm2 monit
```

### Step 7: Create Website in aaPanel for API
1. Go to **aaPanel → Website → Add Site**
2. Configure:
   - **Domain**: `api.tawreka.com`
   - **PHP Version**: Pure Static (no PHP)
   - **Create Database**: No

### Step 8: Configure Reverse Proxy for API
1. Click on `api.tawreka.com` site → **Reverse Proxy**
2. Add new proxy:
   - **Name**: `nodejs`
   - **Target URL**: `http://127.0.0.1:4001`
   - **Send Domain**: `$host`

Or manually edit Nginx config:
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

### Step 9: Enable SSL for API
1. Go to `api.tawreka.com` → **SSL**
2. Click **Let's Encrypt** → Issue Certificate
3. Enable **Force HTTPS**

---

## 🍽️ PART 2: Deploy Customer Website (tawriqa-web)

### Step 1: Build Locally
On your development machine:
```bash
cd tawriqa-web
npm run build
```

This creates a `dist` folder with static files.

### Step 2: Update Environment for Production
Before building, update `.env`:
```env
VITE_API_URL=https://api.tawreka.com
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Step 3: Create Website in aaPanel
1. Go to **aaPanel → Website → Add Site**
2. Configure:
   - **Domain**: `tawreka.com` and `www.tawreka.com`
   - **Root Directory**: `/www/wwwroot/tawreka.com`
   - **PHP Version**: Pure Static

### Step 4: Upload Built Files
Upload the contents of `dist/` folder to `/www/wwwroot/tawreka.com/`

Option A - Via aaPanel Files:
1. aaPanel → Files → Navigate to `/www/wwwroot/tawreka.com/`
2. Upload all files from `dist/` folder

Option B - Via SCP:
```bash
scp -r dist/* root@YOUR_VPS_IP:/www/wwwroot/tawreka.com/
```

### Step 5: Configure SPA Routing (IMPORTANT!)
Since this is a React SPA, all routes should return `index.html`.

1. Go to `tawreka.com` site → **URL Rewrite**
2. Add this rule:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Or edit the site's Nginx config and add inside the `server` block:
```nginx
location / {
    root /www/wwwroot/tawreka.com;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

### Step 6: Enable SSL
1. Go to `tawreka.com` → **SSL**
2. Issue Let's Encrypt certificate for both `tawreka.com` and `www.tawreka.com`
3. Enable **Force HTTPS**

---

## 🍳 PART 3: Deploy Admin/Kitchen Panel (tawreka-system)

### Step 1: Build Locally
On your development machine:
```bash
cd tawreka-system
npm run build
```

### Step 2: Update Environment for Production
Before building, verify `.env`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Step 3: Create Website in aaPanel
1. Go to **aaPanel → Website → Add Site**
2. Configure:
   - **Domain**: `kitchen.tawreka.com`
   - **Root Directory**: `/www/wwwroot/kitchen.tawreka.com`
   - **PHP Version**: Pure Static

### Step 4: Upload Built Files
Upload the contents of `dist/` folder to `/www/wwwroot/kitchen.tawreka.com/`

### Step 5: Configure SPA Routing
Same as customer website - add URL rewrite:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Step 6: Enable SSL
1. Go to `kitchen.tawreka.com` → **SSL**
2. Issue Let's Encrypt certificate
3. Enable **Force HTTPS**

---

## 🔧 Post-Deployment Configuration

### 1. Update Paymob Callback URLs
In your Paymob Dashboard:
- **Transaction Processed Callback**: `https://your-n8n-webhook-url`
- **Transaction Response Callback**: `https://tawreka.com/checkout/success`

### 2. Update Supabase Settings
In Supabase Dashboard → Settings → API:
- Add your domains to **Site URL** and **Redirect URLs**

### 3. Configure CORS in Backend
Ensure `ALLOWED_ORIGINS` in backend `.env` includes all your domains:
```env
ALLOWED_ORIGINS=https://tawreka.com,https://www.tawreka.com,https://kitchen.tawreka.com
```

---

## 🔄 Updating Deployments

### Update Backend API
```bash
cd /www/wwwroot/api.tawreka.com
# Upload new files or git pull
npm install
npm run build
npx pm2 restart tawreka-api
```

### Update Frontend Sites
1. Build locally: `npm run build`
2. Upload new `dist/` contents to the server
3. Clear browser cache

---

## 🐛 Troubleshooting

### Backend API Not Starting
```bash
# Check logs
npx pm2 logs tawreka-api

# Check if port is in use
netstat -tlnp | grep 4001

# Restart
npx pm2 restart tawreka-api

# Stop the API
npx pm2 stop tawreka-api

# Delete and recreate
npx pm2 delete tawreka-api
npx pm2 start dist/index.js --name "tawreka-api"
```

### 502 Bad Gateway
- Check if Node.js app is running: `pm2 status`
- Check Nginx reverse proxy configuration
- Check if correct port is configured

### CORS Errors
- Verify `ALLOWED_ORIGINS` in backend `.env`
- Ensure API URL in frontend `.env` uses HTTPS

### SPA Routes Return 404
- Add `try_files $uri $uri/ /index.html;` to Nginx config
- Restart Nginx: `nginx -t && nginx -s reload`

### SSL Certificate Issues
- Ensure domain DNS points to VPS IP
- Wait for DNS propagation (up to 24 hours)
- Try issuing certificate again in aaPanel

---

## 📊 Monitoring & Management

### Check Application Status
```bash
npx pm2 status
npx pm2 monit
```

### View Logs
```bash
# Backend API logs
npx pm2 logs tawreka-api

# Nginx access logs
tail -f /www/wwwlogs/api.tawreka.com.log
tail -f /www/wwwlogs/tawreka.com.log
```

### Restart Services
```bash
# Restart Node app
npx pm2 restart tawreka-api

# Stop Node app
npx pm2 stop tawreka-api

# Restart Nginx
nginx -s reload
```

---

## 📁 Final Directory Structure

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
│   ├── assets/
│   └── ...
│
└── kitchen.tawreka.com/      # Admin Panel (Static)
    ├── index.html
    ├── assets/
    └── ...
```

---

## ✅ Deployment Checklist

- [ ] Backend API running on PM2
- [ ] API reverse proxy configured
- [ ] Customer website deployed with SPA routing
- [ ] Admin panel deployed with SPA routing
- [ ] SSL certificates issued for all domains
- [ ] Environment variables configured
- [ ] Paymob callback URLs updated
- [ ] CORS configured for all domains
- [ ] Tested order flow end-to-end
- [ ] Kitchen alerts working with Supabase Realtime
