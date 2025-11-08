# 🔷 Azure Backend Deployment Guide

## Smart Krishi Sahayak - Complete Azure Setup

---

## 📋 Prerequisites

- ✅ Azure Account (Free tier available)
- ✅ Azure CLI installed
- ✅ Git/GitHub account
- ✅ Node.js backend ready (`/server` folder)

---

## 🚀 Quick Deployment Steps

### Step 1: Install Azure CLI

```bash
# Windows (PowerShell)
winget install Microsoft.AzureCLI

# Or download from: https://aka.ms/installazurecliwindows
```

### Step 2: Login to Azure

```bash
az login
```

### Step 3: Create Resource Group

```bash
az group create --name smart-krishi-rg --location centralindia
```

### Step 4: Create App Service Plan (Free Tier)

```bash
az appservice plan create \
  --name smart-krishi-plan \
  --resource-group smart-krishi-rg \
  --sku F1 \
  --is-linux
```

### Step 5: Create Web App

```bash
az webapp create \
  --resource-group smart-krishi-rg \
  --plan smart-krishi-plan \
  --name smart-krishi-backend \
  --runtime "NODE:20-lts"
```

### Step 6: Configure App Settings

```bash
# Set Node.js version
az webapp config appsettings set \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    JWT_SECRET="your-secret-key-here" \
    MONGODB_URI="your-mongodb-connection-string"
```

### Step 7: Deploy from Local Git

```bash
# Enable local Git deployment
az webapp deployment source config-local-git \
  --name smart-krishi-backend \
  --resource-group smart-krishi-rg

# Get deployment credentials
az webapp deployment list-publishing-credentials \
  --name smart-krishi-backend \
  --resource-group smart-krishi-rg \
  --query "{username:publishingUserName, password:publishingPassword}"

# Add Azure remote
git remote add azure <git-url-from-previous-command>

# Deploy
git subtree push --prefix server azure main
```

---

## 🔄 Alternative: GitHub Actions Deployment

### Step 1: Get Publish Profile

```bash
az webapp deployment list-publishing-profiles \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend \
  --xml
```

### Step 2: Add GitHub Secret

1. Copy the XML output
2. Go to GitHub repo → Settings → Secrets and variables → Actions
3. Create new secret: `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Paste the XML content

### Step 3: Push to GitHub

The GitHub workflow (`.github/workflows/azure-backend-deploy.yml`) will automatically deploy!

```bash
git add .
git commit -m "Setup Azure backend deployment"
git push origin main
```

---

## 🗄️ Database Options

### Option A: MongoDB Atlas (Free Tier)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Get connection string
4. Add to Azure App Settings

```bash
az webapp config appsettings set \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend \
  --settings MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/krishi"
```

### Option B: Azure Cosmos DB

```bash
# Create Cosmos DB account
az cosmosdb create \
  --name smart-krishi-db \
  --resource-group smart-krishi-rg \
  --kind MongoDB \
  --default-consistency-level Eventual \
  --enable-free-tier true

# Get connection string
az cosmosdb keys list \
  --name smart-krishi-db \
  --resource-group smart-krishi-rg \
  --type connection-strings
```

---

## 🔧 Configure Environment Variables

Create `.env` file in server folder:

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

Add to Azure:

```bash
az webapp config appsettings set \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend \
  --settings @.env
```

---

## 🌐 Connect Frontend to Azure Backend

Update your frontend API URL:

```typescript
// src/config/api.ts or similar
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://smart-krishi-backend.azurewebsites.net/api'
  : 'http://localhost:5000/api';
```

Or create `.env` file in root:

```env
VITE_API_URL=https://smart-krishi-backend.azurewebsites.net/api
```

---

## ✅ Verify Deployment

### Test Health Endpoint

```bash
curl https://smart-krishi-backend.azurewebsites.net/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-08T...",
  "service": "Smart Krishi Sahayak Backend",
  "version": "1.0.0"
}
```

### View Logs

```bash
# Stream logs
az webapp log tail \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend

# Or view in Azure Portal
# Portal → App Service → Log stream
```

---

## 📊 Monitoring & Scaling

### Enable Application Insights

```bash
az monitor app-insights component create \
  --app smart-krishi-insights \
  --location centralindia \
  --resource-group smart-krishi-rg \
  --application-type web

# Link to Web App
az webapp config appsettings set \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="<your-key>"
```

### Scale Up (if needed)

```bash
# Upgrade to Basic tier for more features
az appservice plan update \
  --name smart-krishi-plan \
  --resource-group smart-krishi-rg \
  --sku B1
```

---

## 🎯 Complete Architecture

```
┌─────────────────────────────────────┐
│   Frontend (Firebase Hosting)      │
│   https://smart-krishi-app.web.app │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               ▼
┌─────────────────────────────────────┐
│   Backend (Azure App Service)      │
│   https://smart-krishi-backend     │
│   .azurewebsites.net/api           │
└──────────────┬──────────────────────┘
               │
               │ Database
               ▼
┌─────────────────────────────────────┐
│   MongoDB Atlas / Cosmos DB        │
│   (Free Tier)                       │
└─────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

- **App Service (F1 Free):** ₹0/month
- **MongoDB Atlas (M0):** ₹0/month  
- **Firebase Hosting:** ₹0/month
- **Total:** **₹0/month** (Free tier)

### Paid Options (Optional):
- **Basic (B1):** ~₹1,200/month
- **Cosmos DB:** ~₹300/month
- **Standard (S1):** ~₹5,000/month

---

## 🔐 Security Best Practices

```bash
# Enable HTTPS only
az webapp update \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend \
  --https-only true

# Configure CORS
az webapp cors add \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend \
  --allowed-origins \
    "https://smart-krishi-sahayak-6871c.web.app" \
    "https://smart-krishi-app.firebaseapp.com"

# Enable managed identity
az webapp identity assign \
  --resource-group smart-krishi-rg \
  --name smart-krishi-backend
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **App not starting:**
   ```bash
   # Check logs
   az webapp log tail --resource-group smart-krishi-rg --name smart-krishi-backend
   ```

2. **Database connection failed:**
   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas
   - Azure IP: Add `0.0.0.0/0` or specific Azure IPs

3. **Environment variables not working:**
   ```bash
   # List all settings
   az webapp config appsettings list \
     --resource-group smart-krishi-rg \
     --name smart-krishi-backend
   ```

---

## 📚 Next Steps

1. ✅ Setup custom domain
2. ✅ Enable SSL certificate
3. ✅ Configure auto-scaling
4. ✅ Setup staging environment
5. ✅ Enable Application Insights
6. ✅ Configure backup & disaster recovery

---

## 🎉 Deployment Complete!

Your backend is now live at:
**https://smart-krishi-backend.azurewebsites.net**

Test it:
```bash
curl https://smart-krishi-backend.azurewebsites.net/api/health
```

---

**Created by:** ABHISHEK-DBZ  
**Project:** Smart Krishi Sahayak  
**Date:** November 2025
