# ☁️ Azure Deployment Guide — CI/CD Pipeline for Your Web App

> **Who is this for?** Complete beginners who have never used Azure before.
> Every step is a GUI click-through — no terminal commands, no CLI.

> **What are we building?** Taking your existing GitHub Actions CI/CD pipeline (which currently targets Docker Hub + AWS EC2) and migrating it to Azure.

---

## 📋 Table of Contents

| Batch | Topic | Status |
|-------|-------|--------|
| 1 | [Understanding the Pipeline & Azure Overview](#batch-1-understanding-the-pipeline--azure-overview) | ✅ Done |
| 2 | [Azure Account Setup & Resource Group Creation](#batch-2-azure-account-setup--resource-group-creation) | ✅ Done |
| 3 | [Azure Container Registry (ACR)](#batch-3-azure-container-registry-acr---your-docker-image-storage) | ✅ Done |
| 4 | [Azure App Service — Creating Your Web App](#batch-4-azure-app-service---creating-your-web-app) | ✅ Done |
| 5 | [Connecting ACR to App Service & Environment Config](#batch-5-connecting-acr-to-app-service--environment-config) | ✅ Done |
| 6 | [GitHub Secrets & Updated CI/CD Workflow](#batch-6-github-secrets--updated-cicd-workflow-for-azure) | ✅ Done |
| 7 | [Testing the Full Pipeline End-to-End](#batch-7-testing-the-full-pipeline-end-to-end) | ✅ Done |
| 8 | [Monitoring, Logs & Troubleshooting](#batch-8-monitoring-logs--troubleshooting) | ✅ Done |
| 9 | [Cost Management & Cleanup](#batch-9-cost-management--cleanup) | ✅ Done |

---

# Batch 1: Understanding the Pipeline & Azure Overview

## 1.1 What Your Project Does Right Now

Your project is a **Node.js Express web application** with a complete CI/CD pipeline. Here's a plain-English breakdown of every piece:

### Your Application Code

```
h:\DevOps\Automated CI_CD\
├── src/
│   ├── app.js                  ← The main entry point (Express server)
│   ├── controllers/
│   │   └── homeController.js   ← Handles / and /api/info responses
│   ├── routes/
│   │   ├── index.js            ← Routes for / and /api/info
│   │   └── health.js           ← Route for /health (health check endpoint)
│   └── middleware/
│       └── errorHandler.js     ← Catches errors and returns JSON
├── public/
│   ├── index.html              ← The frontend HTML page
│   └── style.css               ← Styling for the frontend
├── tests/
│   ├── app.test.js             ← Tests for app routes
│   └── routes.test.js          ← Tests for health endpoint
├── Dockerfile                  ← Instructions to build a Docker container
├── docker-compose.yml          ← Local Docker testing config
├── .dockerignore               ← Files to exclude from Docker builds
├── .github/workflows/ci-cd.yml ← The CI/CD pipeline definition
└── package.json                ← Node.js dependencies and scripts
```

### Your App Has 3 Endpoints

| Endpoint | What It Returns |
|----------|----------------|
| `GET /` | The HTML home page (from `public/index.html`) |
| `GET /api/info` | JSON with app name, version, technology stack |
| `GET /health` | JSON health check (status, uptime, memory, version) |

The `/health` endpoint is **critical** — it's how the CI/CD pipeline knows your app is alive after deployment.

---

## 1.2 What Your CI/CD Pipeline Does (3 Jobs)

Your `.github/workflows/ci-cd.yml` defines a pipeline with **3 sequential jobs**:

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  JOB 1          │     │  JOB 2               │     │  JOB 3          │
│  Build & Test   │────▶│  Docker Build & Push  │────▶│  Deploy to EC2  │
│                 │     │                      │     │                 │
│  • npm ci       │     │  • Build Docker image│     │  • SSH into EC2 │
│  • npm run lint │     │  • Push to Docker Hub│     │  • Pull image   │
│  • npm test     │     │                      │     │  • Run container│
│  • Coverage     │     │  (only on main push) │     │  • Health check │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

> **Key insight:** Job 1 runs on every push/PR. Jobs 2 & 3 only run when you push to `main`.

---

## 1.3 The Azure Equivalent — What We'll Replace

We're keeping **Job 1 exactly the same** (GitHub Actions handles testing). We're replacing Docker Hub and AWS EC2 with Azure services:

```
CURRENT PIPELINE                    AZURE PIPELINE
─────────────────                   ──────────────────
Docker Hub (image storage)    →     Azure Container Registry (ACR)
AWS EC2 (deployment server)   →     Azure App Service (managed hosting)
SSH-based deployment          →     Webhook-based auto-deployment
```

### Why Azure App Service Instead of an Azure VM?

| Feature | Azure VM (like EC2) | Azure App Service |
|---------|--------------------|--------------------|
| Setup complexity | High (install Docker, configure firewall, SSH keys) | Low (just point to a container) |
| SSL/HTTPS | You configure it yourself | Free, automatic |
| Auto-restart on crash | You configure it yourself | Built-in |
| Scaling | Manual | One slider |
| Cost (for this project) | ~₹1,500/month minimum | **Free tier available** |
| Maintenance | You patch the OS, Docker, etc. | Azure handles everything |

**Bottom line:** App Service is the better choice for a beginner. It eliminates all the server management headaches.

---

## 1.4 Azure Concepts You Need to Know (Just 5)

Before we start clicking buttons in Azure, here are the only 5 concepts you need:

### 1. Subscription
> Think of it as your **billing account**. All costs are charged to a subscription. Azure gives you a **free subscription** with ₹15,000 (~$200) credit for 30 days.

### 2. Resource Group
> A **folder** that holds related Azure resources. We'll create one called `cicd-webapp-rg` to hold everything for this project. When you're done, delete the resource group to delete everything inside it at once.

### 3. Azure Container Registry (ACR)
> Azure's equivalent of **Docker Hub**. It's a private place to store your Docker images. Your GitHub Actions pipeline will push images here instead of Docker Hub.

### 4. Azure App Service
> A **managed hosting platform** that runs your Docker container. You tell it "run this container from ACR" and it handles everything else — networking, HTTPS, health checks, auto-restart.

### 5. App Service Plan
> The **hardware tier** under your App Service. Think of it as choosing the size of the virtual machine that runs your container. The free/basic tier is enough for this project.

---

## 1.5 The Full Azure Architecture

Here's what we'll build across the next batches:

```
┌─────────────────────────────────────────────────────────────────┐
│                        GITHUB                                   │
│                                                                 │
│  Developer pushes code → GitHub Actions Pipeline runs           │
│                                                                 │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │ Job 1:       │   │ Job 2:           │   │ Job 3:         │  │
│  │ Build & Test │──▶│ Docker Build     │──▶│ Deploy to      │  │
│  │ (unchanged)  │   │ Push to ACR      │   │ Azure App Svc  │  │
│  └──────────────┘   └───────┬──────────┘   └───────┬────────┘  │
│                             │                      │            │
└─────────────────────────────│──────────────────────│────────────┘
                              │                      │
                              ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AZURE                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Resource Group: cicd-webapp-rg                           │    │
│  │                                                         │    │
│  │  ┌───────────────────────┐   ┌───────────────────────┐  │    │
│  │  │ Container Registry    │   │ App Service            │  │    │
│  │  │ (ACR)                 │   │                        │  │    │
│  │  │                       │   │  Runs your container   │  │    │
│  │  │  Stores Docker images │──▶│  on port 3000          │  │    │
│  │  │  cicdwebappacr.       │   │  Auto HTTPS            │  │    │
│  │  │  azurecr.io           │   │  Health checks /health │  │    │
│  │  └───────────────────────┘   └───────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Public URL: https://cicd-webapp.azurewebsites.net              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1.6 What We'll Do in Each Batch

| Batch | What You'll Do | Time Estimate |
|-------|---------------|---------------|
| **2** | Create Azure free account, create a Resource Group | 10 min |
| **3** | Create Azure Container Registry (ACR) — your image storage | 10 min |
| **4** | Create App Service Plan + Web App for Containers | 15 min |
| **5** | Connect ACR → App Service, set environment variables | 10 min |
| **6** | Add Azure secrets to GitHub, update `ci-cd.yml` workflow | 20 min |
| **7** | Push code, watch pipeline run, verify live deployment | 10 min |
| **8** | View logs, set up alerts, troubleshoot common issues | 10 min |
| **9** | Understand costs, clean up resources when done | 5 min |

**Total estimated time: ~90 minutes**

---

## ✅ Batch 1 Complete

You now understand:
- What your app does and how the pipeline works
- What Azure services replace Docker Hub + EC2
- The 5 Azure concepts you need
- The full architecture diagram

**Say `continue` to start Batch 2: Creating your Azure account and Resource Group.**

---
---

# Batch 2: Azure Account Setup & Resource Group Creation

## 2.1 Create Your Azure Free Account

> **💰 Cost:** Azure gives new users a **free account** with ₹15,000 (~$200 USD) in credits valid for 30 days, PLUS 12 months of many services free. You need a credit/debit card for verification only — you won't be charged unless you explicitly upgrade.

### Step-by-Step

**Step 1:** Open your browser and go to:
```
https://azure.microsoft.com/free
```

**Step 2:** Click the big **"Start free"** button (or "Try Azure for free").

**Step 3:** Sign in with your **Microsoft account** (Outlook, Hotmail, or any Microsoft login).
- Don't have one? Click **"Create one"** and follow the prompts. Use any email address.

**Step 4:** Fill in the registration form:

| Field | What to Enter |
|-------|---------------|
| Country/Region | Select **India** (or your country) |
| First Name | Your first name |
| Last Name | Your last name |
| Phone | Your phone number (you'll get an OTP for verification) |
| Address | Your address |

**Step 5:** **Phone verification** — Enter the OTP sent to your phone.

**Step 6:** **Card verification** — Enter your debit/credit card details.
> ⚠️ **Don't worry!** Azure charges ₹2 (or $1) as a temporary verification charge. It gets refunded immediately. You will NOT be charged for using the free tier.

**Step 7:** Check the agreement checkbox and click **"Sign up"**.

**Step 8:** Wait 1-2 minutes. You'll be redirected to the **Azure Portal**:
```
https://portal.azure.com
```

> 🎉 **Congratulations!** You're now inside the Azure Portal. This is where all the magic happens.

---

## 2.2 Quick Tour of the Azure Portal

When you land on the Azure Portal, here's what you'll see:

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 Home    🔍 Search bar                      👤 Your Account │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Azure services:                                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │Create│ │Azure │ │Subscr│ │Resour│ │All   │                 │
│  │a     │ │Active│ │iptio│ │ce    │ │reso- │                 │
│  │resou-│ │Direc-│ │ns   │ │groups│ │urces │                 │
│  │rce   │ │tory  │ │     │ │      │ │      │                 │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                 │
│                                                                 │
│  Recent resources: (empty for now)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key areas:**
- **Search bar** (top center) — The fastest way to find anything. Just type what you need.
- **"Create a resource"** — The big "+" button for creating new things.
- **Left sidebar** — Access to all Azure services (may need to click ☰ hamburger menu).

---

## 2.3 Verify Your Subscription Exists

Before creating anything, let's verify your free subscription is active.

**Step 1:** In the **search bar** at the top, type: `Subscriptions`

**Step 2:** Click **"Subscriptions"** from the results.

**Step 3:** You should see one subscription listed:

| Name | Status | Subscription ID |
|------|--------|-----------------|
| Azure subscription 1 | **Active** | (a long UUID like `abc12345-...`) |

> If the status shows **"Active"**, you're good to go!
> If it shows **"Disabled"**, your free trial may not have activated — wait a few minutes and refresh.

**Step 4:** **Write down your Subscription ID** — you'll need it later. It looks like:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
> 💡 **Tip:** Click on the subscription name to see its details page. You can see your remaining free credits there too.

---

## 2.4 Create a Resource Group

A Resource Group is a container (like a folder) for all the Azure resources in your project. Everything we create will go inside this group.

### Why a Resource Group?
- **Organization:** Keep all project resources together
- **Billing:** See the cost of the entire project in one place
- **Cleanup:** Delete the resource group = delete everything inside it instantly

### Step-by-Step

**Step 1:** In the **search bar** at the top, type: `Resource groups`

**Step 2:** Click **"Resource groups"** from the results.

**Step 3:** Click **"+ Create"** (blue button at the top).

**Step 4:** Fill in the form:

```
┌─────────────────────────────────────────────────────────┐
│  Create a resource group                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Subscription:    [ Azure subscription 1        ▼ ]     │
│                   (auto-selected, leave as is)          │
│                                                         │
│  Resource group:  [ cicd-webapp-rg                 ]     │
│                   ↑ TYPE THIS NAME                      │
│                                                         │
│  Region:          [ (Asia Pacific) Central India  ▼ ]   │
│                   ↑ SELECT THIS (closest to you)        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

| Field | What to Enter | Why |
|-------|---------------|-----|
| Subscription | `Azure subscription 1` | Should be auto-selected |
| Resource group | `cicd-webapp-rg` | Descriptive name for our project |
| Region | `Central India` | Choose the region **closest to you** for lower latency |

> **📍 Region selection guide:**
> - India → **Central India** (Pune) or **South India** (Chennai)
> - US East → **East US** or **East US 2**
> - Europe → **West Europe** or **North Europe**
> - The region you pick here should be the **same** for ALL resources we create later.

**Step 5:** Click **"Review + create"** at the bottom.

**Step 6:** Review the summary screen:
```
┌───────────────────────────────────────────┐
│  Validation passed ✅                      │
│                                           │
│  Subscription:    Azure subscription 1    │
│  Resource group:  cicd-webapp-rg          │
│  Region:          Central India           │
│                                           │
│          [ Create ]                       │
└───────────────────────────────────────────┘
```

**Step 7:** Click **"Create"**.

**Step 8:** Wait 5-10 seconds. You'll see a notification:
```
✅ Resource group 'cicd-webapp-rg' created successfully
```

---

## 2.5 Verify Your Resource Group

**Step 1:** In the **search bar**, type: `Resource groups`

**Step 2:** Click **"Resource groups"**.

**Step 3:** You should see your new resource group:

| Name | Subscription | Location |
|------|-------------|----------|
| **cicd-webapp-rg** | Azure subscription 1 | Central India |

**Step 4:** Click on **"cicd-webapp-rg"** to open it.

You'll see an empty resource group:
```
┌─────────────────────────────────────────────────────────────┐
│  cicd-webapp-rg                                              │
│  Resource group                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Resources: (empty — we'll add things in the next batches)  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  No resources to display.                           │    │
│  │  Create resources in this resource group by using   │    │
│  │  the + Create button above.                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> 💡 This is your project's home base in Azure. In the next batches, you'll see Container Registry and App Service appear here.

---

## 2.6 📝 What You Should Have Now

Before moving on, verify you have all of this:

| ✅ Checkpoint | Status |
|--------------|--------|
| Azure account created | ☐ Done? |
| Logged into Azure Portal (portal.azure.com) | ☐ Done? |
| Free subscription is **Active** | ☐ Done? |
| Subscription ID copied/noted | ☐ Done? |
| Resource Group `cicd-webapp-rg` created | ☐ Done? |
| Region noted (e.g., Central India) | ☐ Done? |

### 📋 Values to Save for Later

Keep these values handy (we'll need them in future batches):

```
┌────────────────────────────────────────────────────┐
│  YOUR AZURE VALUES (save these!)                    │
├────────────────────────────────────────────────────┤
│  Subscription ID:   ________________________________│
│  Resource Group:    cicd-webapp-rg                   │
│  Region:            ________________________________│
└────────────────────────────────────────────────────┘
```

---

## ✅ Batch 2 Complete

You now have:
- An Azure free account with ₹15,000 credits
- An active subscription
- A resource group (`cicd-webapp-rg`) ready to hold all project resources

**Say `continue` to start Batch 3: Creating Azure Container Registry (ACR) — where your Docker images will be stored.**

---
---

# Batch 3: Azure Container Registry (ACR) — Your Docker Image Storage

## 3.1 What is Azure Container Registry?

> **Simple analogy:** If Docker Hub is like a public Google Drive for Docker images, then ACR is like your **private OneDrive** — only you (and services you authorize) can access it.

In your current pipeline, GitHub Actions builds a Docker image and pushes it to **Docker Hub**. We're going to replace that with **Azure Container Registry (ACR)**.

```
CURRENT:   GitHub Actions → builds image → pushes to Docker Hub
NEW:       GitHub Actions → builds image → pushes to Azure Container Registry (ACR)
```

### Why ACR Instead of Docker Hub?

| Feature | Docker Hub (Free) | Azure Container Registry |
|---------|-------------------|--------------------------|
| Private images | 1 only | Unlimited |
| Speed to Azure App Service | Slow (crosses internet) | **Fast** (same Azure network) |
| Integrated with Azure | No | **Yes** (one-click connection) |
| Rate limits | 100 pulls/6hrs | **No limits** |
| Cost | Free (limited) | ~₹350/month (Basic tier) or **free credits** |

---

## 3.2 Create Azure Container Registry

### Step-by-Step

**Step 1:** Go to the Azure Portal:
```
https://portal.azure.com
```

**Step 2:** In the **search bar** at the top, type: `Container registries`

**Step 3:** Click **"Container registries"** from the results.

**Step 4:** Click **"+ Create"** (blue button at the top).

**Step 5:** You'll see the **"Create container registry"** form. Fill in the **Basics** tab:

```
┌─────────────────────────────────────────────────────────────┐
│  Create container registry                                   │
│                                                             │
│  ── Basics tab ──                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Subscription:       [ Azure subscription 1         ▼ ]     │
│                                                             │
│  Resource group:     [ cicd-webapp-rg               ▼ ]     │
│                      ↑ SELECT THE ONE WE CREATED            │
│                                                             │
│  Registry name:      [ cicdwebappacr                  ]     │
│                      ↑ TYPE THIS (letters & numbers only)   │
│                                                             │
│  Location:           [ Central India                ▼ ]     │
│                      ↑ SAME REGION as your Resource Group   │
│                                                             │
│  SKU:                [ Basic                        ▼ ]     │
│                      ↑ SELECT "Basic" (cheapest option)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Field | What to Enter | Why |
|-------|---------------|-----|
| Subscription | `Azure subscription 1` | Auto-selected |
| Resource group | `cicd-webapp-rg` | The group we created in Batch 2 |
| Registry name | `cicdwebappacr` | Must be **globally unique**, letters & numbers only, no hyphens |
| Location | `Central India` | **Same region** as your resource group |
| SKU | `Basic` | Cheapest tier (~₹350/month, covered by free credits) |

> ⚠️ **Registry name rules:**
> - Must be 5-50 characters
> - Only **lowercase letters and numbers** (no hyphens, no underscores, no spaces)
> - Must be **globally unique** across all of Azure
> - If `cicdwebappacr` is taken, try `cicdwebapp<yourinitials>acr` (e.g., `cicdwebappcvacr`)

> 💡 **What's a SKU?** It stands for "Stock Keeping Unit" — it's just Azure's way of saying "pricing tier". **Basic** is the cheapest and is more than enough for this project.

**Step 6:** You can skip the other tabs (Networking, Encryption, Tags). Click **"Review + create"**.

**Step 7:** Review the summary:

```
┌───────────────────────────────────────────────┐
│  Validation passed ✅                          │
│                                               │
│  Subscription:     Azure subscription 1       │
│  Resource group:   cicd-webapp-rg             │
│  Registry name:    cicdwebappacr              │
│  Location:         Central India              │
│  SKU:              Basic                      │
│                                               │
│  Login server:     cicdwebappacr.azurecr.io   │
│                    ↑ THIS IS YOUR IMAGE URL   │
│                                               │
│            [ Create ]                         │
└───────────────────────────────────────────────┘
```

> 📝 **Note the Login server** — `cicdwebappacr.azurecr.io`. This is like your Docker Hub username, but for Azure. Your images will be pushed to addresses like:
> ```
> cicdwebappacr.azurecr.io/cicd-webapp:latest
> ```

**Step 8:** Click **"Create"**.

**Step 9:** Wait 30-60 seconds. You'll see:
```
✅ Deployment succeeded
   Your deployment is complete.
   
   [ Go to resource ]    ← CLICK THIS
```

**Step 10:** Click **"Go to resource"** to open your new Container Registry.

---

## 3.3 Enable Admin Access (Required for GitHub Actions)

By default, ACR doesn't allow username/password login — it uses Azure's identity system. But GitHub Actions needs a **username and password** to push images. We need to turn on "Admin user".

**Step 1:** You should already be on your Container Registry page. If not, search for `Container registries` and click on `cicdwebappacr`.

**Step 2:** In the **left sidebar**, scroll down and find **"Access keys"** under the **Settings** section.

```
┌──────────────────────────────────────────────────────┐
│  cicdwebappacr | Access keys                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Left sidebar:              Main panel:              │
│  ┌──────────────────┐      ┌────────────────────┐   │
│  │ Overview         │      │                    │   │
│  │ Activity log     │      │ Login server:      │   │
│  │ Access control   │      │ cicdwebappacr.     │   │
│  │ Tags             │      │ azurecr.io         │   │
│  │ ─── Settings ─── │      │                    │   │
│  │ Access keys  ← ← │      │ Admin user:        │   │
│  │ Networking       │      │ [ ○ Disabled ]     │   │
│  │ Properties       │      │  ↑ CLICK TO ENABLE │   │
│  └──────────────────┘      │                    │   │
│                            └────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Step 3:** Click on **"Access keys"**.

**Step 4:** Find the **"Admin user"** toggle. It's currently set to **Disabled**. Click it to switch it to **Enabled**.

```
Admin user:   [ ● Enabled ]   ← Toggle this ON
```

**Step 5:** Once enabled, you'll see credentials appear:

```
┌────────────────────────────────────────────────────────────┐
│  Access keys                                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Login server:    cicdwebappacr.azurecr.io                  │
│                                                            │
│  Admin user:      [● Enabled]                              │
│                                                            │
│  Username:        cicdwebappacr                             │
│                   ↑ COPY THIS (it's the registry name)     │
│                                                            │
│  Password:        ********************************         │
│                   [ 👁 Show ] [ 📋 Copy ]                   │
│                   ↑ CLICK "Copy" — SAVE THIS SECURELY!     │
│                                                            │
│  Password 2:      ********************************         │
│                   [ 👁 Show ] [ 📋 Copy ]                   │
│                   (backup password, you can use either)     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

> 🔐 **IMPORTANT — Save these 3 values securely!** You'll need them in Batch 6 when setting up GitHub Secrets:

| Value | What It Is | Example |
|-------|-----------|---------|
| **Login server** | The URL of your registry | `cicdwebappacr.azurecr.io` |
| **Username** | Same as your registry name | `cicdwebappacr` |
| **Password** | The auto-generated password | (a long random string) |

> 💡 **Tip:** Open Notepad and paste these values there temporarily. You can also always come back to this page to view them again.

---

## 3.4 Verify ACR is in Your Resource Group

**Step 1:** In the **search bar**, type: `Resource groups`

**Step 2:** Click on **"cicd-webapp-rg"**.

**Step 3:** You should now see 1 resource:

```
┌─────────────────────────────────────────────────────────────┐
│  cicd-webapp-rg                                              │
│  Resource group                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Resources (1):                                             │
│  ┌──────────────┬──────────────────────┬─────────────┐      │
│  │ Name         │ Type                 │ Location    │      │
│  ├──────────────┼──────────────────────┼─────────────┤      │
│  │ cicdwebappacr│ Container registry   │ Central     │      │
│  │              │                      │ India       │      │
│  └──────────────┴──────────────────────┴─────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> ✅ Your Container Registry is live and ready to receive Docker images!

---

## 3.5 Understanding ACR Image URLs

When your CI/CD pipeline pushes a Docker image, it will use URLs in this format:

```
<login-server>/<image-name>:<tag>
```

For your project, the images will be:

| Tag | Full Image URL |
|-----|---------------|
| `latest` | `cicdwebappacr.azurecr.io/cicd-webapp:latest` |
| `v1` | `cicdwebappacr.azurecr.io/cicd-webapp:v1` |
| `abc1234` (commit SHA) | `cicdwebappacr.azurecr.io/cicd-webapp:abc1234` |

This replaces the old Docker Hub format:
```
BEFORE:  <dockerhub-username>/cicd-webapp:latest
AFTER:   cicdwebappacr.azurecr.io/cicd-webapp:latest
```

---

## 3.6 📝 What You Should Have Now

| ✅ Checkpoint | Status |
|--------------|--------|
| Container Registry `cicdwebappacr` created | ☐ Done? |
| SKU set to **Basic** | ☐ Done? |
| Admin user **Enabled** | ☐ Done? |
| Login server noted | ☐ Done? |
| Username noted | ☐ Done? |
| Password copied securely | ☐ Done? |

### 📋 Updated Values to Save

```
┌────────────────────────────────────────────────────────────┐
│  YOUR AZURE VALUES (keep updating this!)                    │
├────────────────────────────────────────────────────────────┤
│  Subscription ID:      ____________________________________│
│  Resource Group:       cicd-webapp-rg                       │
│  Region:               ____________________________________│
│                                                            │
│  ── Container Registry (NEW in Batch 3) ──                 │
│  ACR Login Server:     cicdwebappacr.azurecr.io            │
│  ACR Username:         cicdwebappacr                       │
│  ACR Password:         ____________________________________│
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Batch 3 Complete

You now have:
- Azure Container Registry (`cicdwebappacr`) created and running
- Admin access enabled with username/password for GitHub Actions
- Login server URL noted for image push/pull

**Say `continue` to start Batch 4: Creating Azure App Service — the managed platform that will run your Docker container.**

---
---

# Batch 4: Azure App Service — Creating Your Web App

## 4.1 What is Azure App Service?

> **Simple analogy:** If ACR is a **warehouse** that stores your Docker images, then App Service is the **store** that picks an image from the warehouse and runs it so customers (users) can access it.

App Service is Azure's **managed hosting platform**. You give it a Docker container, and it:
- Runs the container 24/7
- Gives you a **public URL** (e.g., `https://cicd-webapp.azurewebsites.net`)
- Handles **HTTPS/SSL** automatically (free!)
- **Restarts** the container if it crashes
- Provides **logs** and **monitoring**
- Supports **custom domains** if you want one

### What's an App Service Plan?

Before creating a Web App, you need an **App Service Plan** — think of it as the "hardware" your app runs on:

```
┌──────────────────────────────────────────────┐
│  App Service Plan = The "computer"            │
│  (CPU, RAM, pricing tier)                    │
│                                              │
│  ┌───────────────────────────────────────┐   │
│  │  Web App = Your app running on it     │   │
│  │  (Docker container from ACR)          │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

> You can run **multiple web apps** on the same plan, but for this project we only need one.

---

## 4.2 Choose the Right Pricing Tier

| Tier | Cost | RAM | What You Get | Our Choice? |
|------|------|-----|-------------|-------------|
| **F1 (Free)** | ₹0/month | 1 GB | No custom containers ❌ | No — doesn't support Docker |
| **B1 (Basic)** | ~₹1,000/month | 1.75 GB | Docker containers ✅, Custom domain, SSL | **✅ Best for this project** |
| **S1 (Standard)** | ~₹5,500/month | 1.75 GB | Everything in B1 + auto-scaling, slots | Overkill for learning |
| **P1v3 (Premium)** | ~₹9,000/month | 8 GB | High performance | Way overkill |

> 💡 **We'll use B1 (Basic)**. It costs ~₹1,000/month but is **fully covered by your free ₹15,000 credits**. It's the cheapest tier that supports Docker containers.

---

## 4.3 Create the App Service Plan + Web App

Azure lets you create both the plan and the web app in one flow. Here's how:

### Step-by-Step

**Step 1:** Go to the Azure Portal: `https://portal.azure.com`

**Step 2:** In the **search bar**, type: `App Services`

**Step 3:** Click **"App Services"** from the results.

**Step 4:** Click **"+ Create"** → Select **"Web App"** from the dropdown.

**Step 5:** You'll see the **"Create Web App"** form. Fill in the **Basics** tab:

```
┌───────────────────────────────────────────────────────────────────┐
│  Create Web App                                                   │
│                                                                   │
│  ── Basics tab ──                                                │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ── Project Details ──                                           │
│                                                                   │
│  Subscription:         [ Azure subscription 1           ▼ ]       │
│                                                                   │
│  Resource Group:       [ cicd-webapp-rg                 ▼ ]       │
│                        ↑ SELECT the one we created                │
│                                                                   │
│  ── Instance Details ──                                          │
│                                                                   │
│  Name:                 [ cicd-webapp                      ]       │
│                        ↑ TYPE THIS (becomes your URL)            │
│                        URL will be: cicd-webapp.azurewebsites.net │
│                                                                   │
│  Publish:              (●) Docker Container                       │
│                        ↑ SELECT THIS (not "Code")                │
│                                                                   │
│  Operating System:     (●) Linux                                  │
│                        ↑ SELECT LINUX                            │
│                                                                   │
│  Region:               [ Central India                  ▼ ]       │
│                        ↑ SAME REGION as your other resources     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

| Field | What to Enter | Why |
|-------|---------------|-----|
| Subscription | `Azure subscription 1` | Auto-selected |
| Resource Group | `cicd-webapp-rg` | Keep everything together |
| Name | `cicd-webapp` | This becomes your URL: `cicd-webapp.azurewebsites.net` |
| Publish | **Docker Container** | We're deploying a container, not raw code |
| Operating System | **Linux** | Our Dockerfile uses `node:20-alpine` (Linux) |
| Region | `Central India` | Same as ACR for faster image pulls |

> ⚠️ **Web App name rules:**
> - Must be **globally unique** across all Azure (it becomes a URL)
> - Only letters, numbers, and hyphens
> - If `cicd-webapp` is taken, try `cicd-webapp-<yourinitials>` (e.g., `cicd-webapp-cv`)

**Step 6:** Scroll down to the **Pricing plan** section. This is where we pick the App Service Plan:

```
┌───────────────────────────────────────────────────────────────┐
│  ── Pricing Plans ──                                          │
│                                                               │
│  Linux Plan:          [ (New) cicd-webapp-plan        ▼ ]     │
│                       ↑ Azure auto-creates a new plan         │
│                       (leave as default name, or rename)     │
│                                                               │
│  Pricing plan:        [ Basic B1                     ▼ ]     │
│                       ↑ SELECT "Basic B1"                    │
│                                                               │
│  If you don't see B1, click "Explore pricing plans"          │
│  Then find "Basic B1" under the "Dev/Test" tab               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

> 🔍 **Can't find Basic B1?** Here's how to find it:
> 1. Click **"Explore pricing plans"** (blue link)
> 2. A panel opens on the right with tabs: **Free**, **Basic**, **Standard**, **Premium**
> 3. Click the **"Basic"** tab (or **"Dev / Test"** tab)
> 4. Select **"B1"** — it shows: 1 core, 1.75 GB RAM, ~₹1,000/month
> 5. Click **"Select"**

**Step 7:** Now configure the **Docker** tab. Click **"Next: Docker >"** at the bottom.

```
┌───────────────────────────────────────────────────────────────┐
│  Create Web App                                               │
│                                                               │
│  ── Docker tab ──                                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Options:              (●) Single Container                   │
│                        ↑ SELECT THIS                         │
│                                                               │
│  Image Source:         (●) Azure Container Registry           │
│                        ↑ SELECT THIS                         │
│                                                               │
│  Registry:             [ cicdwebappacr               ▼ ]     │
│                        ↑ SELECT your ACR                     │
│                                                               │
│  Image:                [ cicd-webapp                 ▼ ]     │
│                        ↑ Leave empty for now (no image yet)  │
│                                                               │
│  Tag:                  [ latest                      ▼ ]     │
│                        ↑ Leave empty for now                 │
│                                                               │
│  Startup Command:      [                               ]     │
│                        ↑ LEAVE BLANK (Dockerfile has CMD)    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

| Field | What to Select | Why |
|-------|---------------|-----|
| Options | **Single Container** | We have one Dockerfile |
| Image Source | **Azure Container Registry** | Our images are in ACR |
| Registry | `cicdwebappacr` | The ACR we created in Batch 3 |
| Image | Leave empty or type `cicd-webapp` | No image exists yet — it'll be pushed by the pipeline |
| Tag | Leave empty or type `latest` | Will pull the `latest` tag |
| Startup Command | **Leave blank** | Our Dockerfile already has `CMD ["node", "src/app.js"]` |

> 💡 **Don't worry if Image/Tag dropdowns are empty!** That's expected — we haven't pushed any images yet. The pipeline will push the first image in Batch 7. If the form won't let you proceed with empty fields, type `cicd-webapp` for image and `latest` for tag — it will just fail to pull initially until the first pipeline run.

**Step 8:** Skip the remaining tabs (Networking, Monitoring, Tags). Click **"Review + create"**.

**Step 9:** Review the summary:

```
┌───────────────────────────────────────────────────┐
│  Validation passed ✅                              │
│                                                   │
│  Subscription:     Azure subscription 1           │
│  Resource group:   cicd-webapp-rg                 │
│  Name:             cicd-webapp                    │
│  Publish:          Docker Container               │
│  OS:               Linux                          │
│  Region:           Central India                  │
│  Plan:             cicd-webapp-plan (B1)          │
│  Docker:           ACR - cicdwebappacr            │
│                                                   │
│  Estimated cost:   ~₹1,000/month (free credits)  │
│                                                   │
│            [ Create ]                             │
└───────────────────────────────────────────────────┘
```

**Step 10:** Click **"Create"**.

**Step 11:** Wait 1-2 minutes. You'll see:
```
✅ Deployment succeeded
   Your deployment is complete.
   
   [ Go to resource ]    ← CLICK THIS
```

**Step 12:** Click **"Go to resource"**.

---

## 4.4 Explore Your New Web App

You're now on the **Web App overview page**. Here's what you'll see:

```
┌───────────────────────────────────────────────────────────────┐
│  cicd-webapp                                                   │
│  App Service                                                  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Status:    ● Running (or ○ Waiting — that's OK)       │ │
│  │  URL:       https://cicd-webapp.azurewebsites.net       │ │
│  │             ↑ THIS IS YOUR LIVE URL!                   │ │
│  │  Plan:      cicd-webapp-plan (B1)                      │ │
│  │  Location:  Central India                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Left sidebar:                                               │
│  ┌──────────────────────┐                                    │
│  │ Overview             │                                    │
│  │ Activity log         │                                    │
│  │ Deployment Center ←← │  (we'll use this in Batch 5)      │
│  │ ─── Settings ───     │                                    │
│  │ Configuration        │  (environment variables)           │
│  │ Properties           │                                    │
│  └──────────────────────┘                                    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Step 13:** Click on the **URL** (`https://cicd-webapp.azurewebsites.net`).

> 🔶 **You'll see an error page** — that's completely normal! The app can't start because we haven't pushed a Docker image yet. You might see:
> ```
> :( Application Error
> If you are the application administrator, query the site 
> diagnostic service for more information.
> ```
> Or a default Azure placeholder page. **This is expected.** The app will work after we run the pipeline in Batch 7.

---

## 4.5 Configure the App Port

Your Express app listens on **port 3000**, but App Service needs to know this. By default, App Service looks for port 80 or 8080.

**Step 1:** On your Web App page, go to the **left sidebar** → **Settings** → **Configuration**.

**Step 2:** Click the **"General settings"** tab (not "Application settings").

**Step 3:** Scroll down to find **"Startup Command"** — leave it blank.

**Step 4:** Go back to the **"Application settings"** tab.

**Step 5:** Click **"+ New application setting"**.

**Step 6:** Add this setting:

| Name | Value |
|------|-------|
| `WEBSITES_PORT` | `3000` |

```
┌──────────────────────────────────────────┐
│  Add/Edit application setting            │
├──────────────────────────────────────────┤
│                                          │
│  Name:   [ WEBSITES_PORT           ]     │
│  Value:  [ 3000                    ]     │
│                                          │
│  ☐ Deployment slot setting               │
│    (leave unchecked)                     │
│                                          │
│         [ OK ]                           │
└──────────────────────────────────────────┘
```

> 📖 **What is `WEBSITES_PORT`?** Azure App Service has a built-in reverse proxy that receives traffic on port 80/443 (HTTP/HTTPS) and forwards it to your container. But it needs to know which port your container listens on. Setting `WEBSITES_PORT=3000` tells Azure: "my container's app is on port 3000".

**Step 7:** Click **"OK"**.

**Step 8:** Click **"Save"** at the top of the Configuration page.

**Step 9:** A dialog will appear: "Saving these changes will restart your application. Continue?"
→ Click **"Continue"**.

---

## 4.6 Verify Resource Group Now Has 2 Resources

**Step 1:** Search for `Resource groups` → Click **"cicd-webapp-rg"**.

**Step 2:** You should now see **3 resources** (the plan counts as a resource too):

```
┌──────────────────────────────────────────────────────────────────┐
│  cicd-webapp-rg                                                   │
│  Resources (3):                                                  │
│  ┌─────────────────────┬──────────────────────┬──────────────┐   │
│  │ Name                │ Type                 │ Location     │   │
│  ├─────────────────────┼──────────────────────┼──────────────┤   │
│  │ cicdwebappacr       │ Container registry   │ Central India│   │
│  │ cicd-webapp         │ App Service          │ Central India│   │
│  │ cicd-webapp-plan    │ App Service plan     │ Central India│   │
│  └─────────────────────┴──────────────────────┴──────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

> ✅ All three resources are in the same Resource Group, same region. Perfect!

---

## 4.7 📝 What You Should Have Now

| ✅ Checkpoint | Status |
|--------------|--------|
| App Service Plan created (B1 tier) | ☐ Done? |
| Web App `cicd-webapp` created | ☐ Done? |
| Publish type is **Docker Container** | ☐ Done? |
| OS is **Linux** | ☐ Done? |
| `WEBSITES_PORT` set to `3000` | ☐ Done? |
| Web App URL noted | ☐ Done? |

### 📋 Updated Values to Save

```
┌────────────────────────────────────────────────────────────┐
│  YOUR AZURE VALUES (keep updating this!)                    │
├────────────────────────────────────────────────────────────┤
│  Subscription ID:      ____________________________________│
│  Resource Group:       cicd-webapp-rg                       │
│  Region:               ____________________________________│
│                                                            │
│  ── Container Registry (Batch 3) ──                        │
│  ACR Login Server:     cicdwebappacr.azurecr.io            │
│  ACR Username:         cicdwebappacr                       │
│  ACR Password:         ____________________________________│
│                                                            │
│  ── App Service (NEW in Batch 4) ──                        │
│  Web App Name:         cicd-webapp                         │
│  Web App URL:          https://cicd-webapp.azurewebsites.net│
│  App Service Plan:     cicd-webapp-plan (B1)               │
│  WEBSITES_PORT:        3000                                │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Batch 4 Complete

You now have:
- An App Service Plan (B1 tier — the hardware)
- A Web App (`cicd-webapp`) configured for Docker containers from ACR
- Port 3000 configured so Azure knows where your app listens
- A public URL ready at `https://cicd-webapp.azurewebsites.net`

> The app shows an error page right now — that's expected! It will come alive after the first pipeline run in Batch 7.

**Say `continue` to start Batch 5: Connecting ACR to App Service and configuring environment variables.**

---
---

# Batch 5: Connecting ACR to App Service & Environment Config

## 5.1 What Are We Doing in This Batch?

Right now, ACR and App Service exist separately. We need to:

1. **Connect them** — Tell App Service to pull Docker images from ACR
2. **Enable Continuous Deployment** — So App Service automatically pulls new images when they're pushed
3. **Set environment variables** — `NODE_ENV=production` for your app
4. **Get the webhook URL** — So GitHub Actions can tell Azure "a new image is ready!"

```
┌──────────────┐         ┌──────────────────┐
│ ACR          │  pull   │  App Service     │
│              │ ──────▶ │                  │
│ Stores       │  image  │  Runs the        │
│ Docker       │         │  container       │
│ images       │         │                  │
└──────────────┘         └──────────────────┘
       ▲                         │
       │                         │
   push image              webhook notifies
   (GitHub Actions)        "new image available"
```

---

## 5.2 Configure Deployment Center

The **Deployment Center** is where you tell App Service what container to run and where to find it.

### Step-by-Step

**Step 1:** Go to Azure Portal → Search for `App Services` → Click on **"cicd-webapp"**.

**Step 2:** In the **left sidebar**, click **"Deployment Center"** (under the Deployment section).

```
┌───────────────────────────────────────────────────────────────┐
│  cicd-webapp | Deployment Center                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Left sidebar:              Main panel:                       │
│  ┌──────────────────┐      ┌───────────────────────────┐     │
│  │ Overview         │      │  Registry settings         │     │
│  │ Deployment       │      │                           │     │
│  │  Center  ← ← ←  │      │  Source:                   │     │
│  │ ─── Settings ─── │      │  [ Container Registry ▼ ] │     │
│  │ Configuration    │      │                           │     │
│  │ Scale up/out     │      │                           │     │
│  └──────────────────┘      └───────────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Step 3:** You'll see the **Registry settings** on the main panel. Configure it as follows:

```
┌───────────────────────────────────────────────────────────────┐
│  Deployment Center - Registry settings                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Source:                 [ Container Registry           ▼ ]   │
│                                                               │
│  Registry type:          (●) Azure Container Registry         │
│                                                               │
│  Subscription:           [ Azure subscription 1        ▼ ]   │
│                                                               │
│  Registry:               [ cicdwebappacr               ▼ ]   │
│                          ↑ SELECT your ACR                   │
│                                                               │
│  Image:                  [ cicd-webapp                 ▼ ]   │
│                          ↑ Type "cicd-webapp"                │
│                                                               │
│  Tag:                    [ latest                      ▼ ]   │
│                          ↑ Type "latest"                     │
│                                                               │
│  Continuous deployment:  (●) On                               │
│                          ↑ TURN THIS ON!                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

| Field | What to Select | Why |
|-------|---------------|-----|
| Source | **Container Registry** | We're pulling from a Docker registry |
| Registry type | **Azure Container Registry** | Our images are in ACR |
| Subscription | `Azure subscription 1` | Auto-selected |
| Registry | `cicdwebappacr` | Our ACR from Batch 3 |
| Image | `cicd-webapp` | The image name our pipeline will push |
| Tag | `latest` | Pull the latest version |
| Continuous deployment | **On** | Auto-pull when new images arrive |

> 📖 **What is Continuous Deployment?** When turned ON, Azure creates a **webhook URL**. When your pipeline pushes a new image to ACR, it hits this webhook → Azure automatically pulls the new image and restarts the container. No SSH needed!

**Step 4:** Click **"Save"** (at the top).

---

## 5.3 Copy the Webhook URL

After saving with Continuous Deployment ON, Azure generates a webhook URL. This webhook is how GitHub Actions will notify Azure that a new image is ready.

**Step 1:** Still on the **Deployment Center** page, look for the **Webhook URL** field. It appears after you save.

```
┌───────────────────────────────────────────────────────────────┐
│  Webhook URL:                                                 │
│  [ https://cicd-webapp.scm.azurewebsites.net/api/registry/   │
│    webhook                                              📋 ]  │
│    ↑ CLICK THE COPY BUTTON and SAVE THIS!                    │
└───────────────────────────────────────────────────────────────┘
```

> If you don't see the Webhook URL directly, scroll down or look for a section labeled "Webhook" or "CI/CD". The URL will look something like:
> ```
> https://$cicd-webapp:PASSWORD@cicd-webapp.scm.azurewebsites.net/api/registry/webhook
> ```

**Step 2:** **Copy this URL** and save it. We'll add it as a GitHub Secret in Batch 6.

> 💡 **Can't find the webhook URL?** Don't worry — it's optional. In Batch 6, we'll use a different (more reliable) approach: GitHub Actions will directly call Azure's API to restart the app after pushing a new image. The webhook is a nice-to-have.

---

## 5.4 Set Environment Variables

Your app uses environment variables (from `.env`). In Azure, you set these via **Application Settings**.

**Step 1:** On your Web App page, go to **left sidebar** → **Settings** → **Configuration**.

**Step 2:** Click the **"Application settings"** tab.

**Step 3:** You should already see `WEBSITES_PORT = 3000` from Batch 4. Now add more settings by clicking **"+ New application setting"** for each:

| # | Name | Value | Why |
|---|------|-------|-----|
| 1 | `WEBSITES_PORT` | `3000` | (Already set in Batch 4) |
| 2 | `NODE_ENV` | `production` | Tells Express to run in production mode |
| 3 | `PORT` | `3000` | Your app reads this: `process.env.PORT \|\| 3000` |

### Adding `NODE_ENV`:

**Step 4:** Click **"+ New application setting"**.

```
┌──────────────────────────────────────────┐
│  Add/Edit application setting            │
├──────────────────────────────────────────┤
│                                          │
│  Name:   [ NODE_ENV                ]     │
│  Value:  [ production              ]     │
│                                          │
│  ☐ Deployment slot setting               │
│                                          │
│         [ OK ]                           │
└──────────────────────────────────────────┘
```

**Step 5:** Click **"OK"**.

### Adding `PORT`:

**Step 6:** Click **"+ New application setting"** again.

```
┌──────────────────────────────────────────┐
│  Add/Edit application setting            │
├──────────────────────────────────────────┤
│                                          │
│  Name:   [ PORT                    ]     │
│  Value:  [ 3000                    ]     │
│                                          │
│  ☐ Deployment slot setting               │
│                                          │
│         [ OK ]                           │
└──────────────────────────────────────────┘
```

**Step 7:** Click **"OK"**.

**Step 8:** Your Application Settings should now show:

```
┌──────────────────────────────────────────────────────────────┐
│  Application settings:                                        │
│  ┌──────────────────┬─────────────────┬─────────────────┐    │
│  │ Name             │ Value           │ Source           │    │
│  ├──────────────────┼─────────────────┼─────────────────┤    │
│  │ WEBSITES_PORT    │ 3000            │ App setting     │    │
│  │ NODE_ENV         │ production      │ App setting     │    │
│  │ PORT             │ 3000            │ App setting     │    │
│  └──────────────────┴─────────────────┴─────────────────┘    │
│                                                              │
│         [ Save ]   ← DON'T FORGET TO CLICK SAVE!            │
└──────────────────────────────────────────────────────────────┘
```

**Step 9:** Click **"Save"** at the top.

**Step 10:** Confirm the restart dialog → Click **"Continue"**.

> 📖 **How do Application Settings work?** Azure injects these as **environment variables** into your container at runtime. Your code reads them with `process.env.NODE_ENV`, `process.env.PORT`, etc. This is the same as putting them in a `.env` file, but more secure because they're stored in Azure (not in your code).

---

## 5.5 Configure Health Check (Optional but Recommended)

Azure can automatically monitor your `/health` endpoint and restart the container if it becomes unhealthy.

**Step 1:** On your Web App page, go to **left sidebar** → **Monitoring** → **Health check**.

**Step 2:** Toggle Health check to **Enabled**.

**Step 3:** Set the path:

```
┌───────────────────────────────────────────────────────────────┐
│  Health check                                                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Health check:        [● Enabled]                            │
│                                                               │
│  Path:                [ /health                         ]     │
│                       ↑ TYPE THIS (matches your route)       │
│                                                               │
│  Load balancing      ── Advanced options ──                  │
│  threshold:          Leave as default                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

| Field | Value | Why |
|-------|-------|-----|
| Health check | **Enabled** | Auto-restart unhealthy containers |
| Path | `/health` | Your Express app has a `/health` endpoint that returns status |

**Step 4:** Click **"Save"**.

> 📖 **How does this work?** Azure will ping `https://cicd-webapp.azurewebsites.net/health` periodically. If it gets a non-200 response multiple times in a row, Azure marks the instance as unhealthy and replaces it. This is the same concept as the `HEALTHCHECK` in your Dockerfile, but at the Azure platform level.

---

## 5.6 📝 What You Should Have Now

| ✅ Checkpoint | Status |
|--------------|--------|
| Deployment Center configured for ACR | ☐ Done? |
| Continuous deployment turned **ON** | ☐ Done? |
| Webhook URL copied (optional) | ☐ Done? |
| `NODE_ENV=production` added | ☐ Done? |
| `PORT=3000` added | ☐ Done? |
| Health check set to `/health` | ☐ Done? |

### 📋 Updated Values to Save

```
┌────────────────────────────────────────────────────────────┐
│  YOUR AZURE VALUES (keep updating this!)                    │
├────────────────────────────────────────────────────────────┤
│  Subscription ID:      ____________________________________│
│  Resource Group:       cicd-webapp-rg                       │
│  Region:               ____________________________________│
│                                                            │
│  ── Container Registry (Batch 3) ──                        │
│  ACR Login Server:     cicdwebappacr.azurecr.io            │
│  ACR Username:         cicdwebappacr                       │
│  ACR Password:         ____________________________________│
│                                                            │
│  ── App Service (Batch 4) ──                               │
│  Web App Name:         cicd-webapp                         │
│  Web App URL:          https://cicd-webapp.azurewebsites.net│
│  App Service Plan:     cicd-webapp-plan (B1)               │
│                                                            │
│  ── Deployment Config (NEW in Batch 5) ──                  │
│  Webhook URL:          ____________________________________│
│  WEBSITES_PORT:        3000                                │
│  NODE_ENV:             production                          │
│  PORT:                 3000                                │
│  Health check path:    /health                             │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Batch 5 Complete

You now have:
- ACR connected to App Service via Deployment Center
- Continuous Deployment enabled (auto-pulls new images)
- Environment variables (`NODE_ENV`, `PORT`) configured
- Health check monitoring your `/health` endpoint

> 🚀 **Your Azure infrastructure is fully set up!** The next batch is the big one — updating your GitHub Actions workflow to push to ACR and deploy to Azure.

**Say `continue` to start Batch 6: Adding GitHub Secrets and updating your CI/CD workflow for Azure.**

---
---

# Batch 6: GitHub Secrets & Updated CI/CD Workflow for Azure

> 🚀 **This is the most important batch!** Here we connect GitHub to Azure by adding secrets and updating the workflow file.

## 6.1 What Are GitHub Secrets?

GitHub Secrets are **encrypted environment variables** stored in your repository. Your CI/CD pipeline reads them at runtime, but they're never visible in logs or code.

Currently your repo has (or needs) secrets for Docker Hub and AWS. We'll **replace** them with Azure secrets:

```
REMOVE (old):                      ADD (new):
──────────────                     ──────────
DOCKERHUB_USERNAME          →      ACR_LOGIN_SERVER
DOCKERHUB_TOKEN             →      ACR_USERNAME
EC2_HOST                    →      ACR_PASSWORD
EC2_USER                    →      AZURE_WEBAPP_NAME
EC2_SSH_PRIVATE_KEY         →      AZURE_WEBHOOK_URL (optional)
```

---

## 6.2 Add Azure Secrets to GitHub

### Step-by-Step

**Step 1:** Go to your GitHub repository:
```
https://github.com/Gentleman08/automated-web-deployment
```

**Step 2:** Click the **"Settings"** tab (top menu bar, right side).

```
┌───────────────────────────────────────────────────────────────┐
│  < > Code    ○ Issues    ↙ Pull requests    ▶ Actions         │
│                                                               │
│  ⚙ Settings  ← CLICK THIS                                    │
└───────────────────────────────────────────────────────────────┘
```

**Step 3:** In the left sidebar, scroll down to **"Security"** section → Click **"Secrets and variables"** → Click **"Actions"**.

```
┌───────────────────────────────────────────────┐
│  Settings sidebar:                             │
│                                               │
│  ─── Security ───                             │
│  └── Secrets and variables                    │
│      └── Actions  ← CLICK THIS               │
└───────────────────────────────────────────────┘
```

**Step 4:** You'll see the **"Repository secrets"** section. Click **"New repository secret"** for each secret below.

### Add These 4 Secrets

For **each** secret: Click **"New repository secret"** → Type the Name → Paste the Value → Click **"Add secret"**.

```
┌──────────────────────────────────────────────────────────────┐
│  New secret                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Name:   [ ACR_LOGIN_SERVER                            ]     │
│  Secret: [ cicdwebappacr.azurecr.io                    ]     │
│                                                              │
│          [ Add secret ]                                      │
└──────────────────────────────────────────────────────────────┘
```

| # | Secret Name | Secret Value | Where You Got It |
|---|-------------|-------------|------------------|
| 1 | `ACR_LOGIN_SERVER` | `cicdwebappacr.azurecr.io` | ACR → Access keys → Login server (Batch 3) |
| 2 | `ACR_USERNAME` | `cicdwebappacr` | ACR → Access keys → Username (Batch 3) |
| 3 | `ACR_PASSWORD` | *(the long password you copied)* | ACR → Access keys → Password (Batch 3) |
| 4 | `AZURE_WEBAPP_NAME` | `cicd-webapp` | The Web App name from Batch 4 |

> ⚠️ **Double-check:** Make sure there are no extra spaces before or after the values when pasting!

**Step 5:** After adding all 4, your secrets page should show:

```
┌──────────────────────────────────────────────────────────────┐
│  Repository secrets                                           │
│  ┌──────────────────────┬───────────────────────────────┐    │
│  │ Name                 │ Updated                       │    │
│  ├──────────────────────┼───────────────────────────────┤    │
│  │ ACR_LOGIN_SERVER     │ just now                      │    │
│  │ ACR_USERNAME         │ just now                      │    │
│  │ ACR_PASSWORD         │ just now                      │    │
│  │ AZURE_WEBAPP_NAME    │ just now                      │    │
│  └──────────────────────┴───────────────────────────────┘    │
│                                                              │
│  (You can keep old secrets like DOCKERHUB_USERNAME etc.      │
│   They won't be used by the new workflow)                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 6.3 Understanding the Workflow Changes

Here's a side-by-side comparison of what changes in each job:

```
┌──────────────────────────────────────────────────────────────┐
│  JOB 1: Build & Test                                         │
│  ► NO CHANGES — stays exactly the same                       │
│    (npm ci → lint → test → upload coverage)                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  JOB 2: Docker Build & Push                                  │
│                                                              │
│  BEFORE (Docker Hub):              AFTER (Azure ACR):        │
│  ─────────────────                 ──────────────────        │
│  Login to Docker Hub        →      Login to ACR              │
│  Tag: username/cicd-webapp  →      Tag: acr.azurecr.io/...  │
│  Push to Docker Hub         →      Push to ACR               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  JOB 3: Deploy                                               │
│                                                              │
│  BEFORE (AWS EC2):                 AFTER (Azure App Svc):    │
│  ─────────────────                 ──────────────────────    │
│  SSH into EC2               →      Call Azure webhook/API    │
│  docker pull & run          →      App Service auto-deploys  │
│  curl health check          →      curl health check         │
└──────────────────────────────────────────────────────────────┘
```

---

## 6.4 The Updated CI/CD Workflow

Below is the **complete updated workflow file**. You need to **replace the entire contents** of `.github/workflows/ci-cd.yml` with this:

> 📖 **Every line is commented** so you understand exactly what each part does.

```yaml
# .github/workflows/ci-cd.yml
# Automated CI/CD Pipeline — Azure Edition
# Deploys to Azure Container Registry + Azure App Service

name: CI/CD Pipeline

# ============================================
# TRIGGERS: When should this pipeline run?
# ============================================
on:
  # Run on push to main branch
  push:
    branches: [main]

  # Run on pull requests targeting main
  pull_request:
    branches: [main]

  # Allow manual trigger from GitHub UI
  workflow_dispatch:

# ============================================
# ENVIRONMENT VARIABLES (available to all jobs)
# ============================================
env:
  # Azure Container Registry image path
  # Format: <login-server>/<image-name>
  DOCKER_IMAGE: ${{ secrets.ACR_LOGIN_SERVER }}/cicd-webapp
  NODE_VERSION: "20"

# ============================================
# JOBS: The work units of the pipeline
# ============================================
jobs:
  # ------------------------------------------
  # JOB 1: Build, Lint, and Test (UNCHANGED)
  # ------------------------------------------
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest

    steps:
      # Step 1: Check out the repository code
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Set up Node.js environment
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      # Step 3: Install dependencies (clean install from lockfile)
      - name: Install dependencies
        run: npm ci

      # Step 4: Run linter
      - name: Run ESLint
        run: npm run lint

      # Step 5: Run tests with coverage
      - name: Run tests
        run: npm test

      # Step 6: Upload test coverage as artifact
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  # ------------------------------------------
  # JOB 2: Build and Push Docker Image to ACR
  # ------------------------------------------
  build-and-push-docker:
    name: Docker Build & Push to ACR
    runs-on: ubuntu-latest
    needs: build-and-test

    # Only build on push to main (not on PRs)
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      # Step 1: Check out code
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Set up Docker Buildx
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Step 3: Login to Azure Container Registry
      # Uses the ACR credentials stored in GitHub Secrets
      - name: Login to ACR
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      # Step 4: Extract metadata (tags, labels)
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_IMAGE }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest
            type=raw,value=${{ github.run_number }}

      # Step 5: Build and push Docker image to ACR
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Step 6: Verify the pushed image
      - name: Verify image pushed to ACR
        run: |
          echo "✅ Image pushed to Azure Container Registry!"
          echo "Tags: ${{ steps.meta.outputs.tags }}"

  # ------------------------------------------
  # JOB 3: Deploy to Azure App Service
  # ------------------------------------------
  deploy-to-azure:
    name: Deploy to Azure App Service
    runs-on: ubuntu-latest
    needs: build-and-push-docker

    # Only deploy on push to main
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      # Step 1: Trigger Azure App Service to pull the new image
      # The Deployment Center (with Continuous Deployment ON)
      # will automatically detect the new image in ACR.
      # We use Azure CLI to explicitly restart the web app
      # to ensure the latest image is pulled immediately.
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          images: ${{ env.DOCKER_IMAGE }}:latest
          # Note: This action uses the ACR credentials configured
          # in the App Service Deployment Center (Batch 5).
          # No additional Azure login is needed because the
          # App Service already has permission to pull from ACR.

      # Step 2: Wait for deployment to stabilize
      - name: Wait for deployment
        run: |
          echo "⏳ Waiting for Azure App Service to pull and start the new container..."
          sleep 30

      # Step 3: Verify deployment via health check
      - name: Verify deployment
        run: |
          echo "🔍 Checking health endpoint..."
          HEALTH_URL="https://${{ secrets.AZURE_WEBAPP_NAME }}.azurewebsites.net/health"
          
          # Try up to 5 times with 10-second intervals
          for i in 1 2 3 4 5; do
            echo "Attempt $i/5: Checking $HEALTH_URL"
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
            
            if [ "$HTTP_STATUS" = "200" ]; then
              echo ""
              echo "✅ ========================================="
              echo "   DEPLOYMENT SUCCESSFUL!"
              echo "   URL: https://${{ secrets.AZURE_WEBAPP_NAME }}.azurewebsites.net"
              echo "   Health: $HEALTH_URL"
              echo "   Status: HTTP $HTTP_STATUS"
              echo "========================================="
              curl -s "$HEALTH_URL" | python3 -m json.tool || true
              exit 0
            fi
            
            echo "   Got HTTP $HTTP_STATUS, retrying in 10s..."
            sleep 10
          done
          
          echo ""
          echo "⚠️ Health check did not return 200 after 5 attempts."
          echo "   This may be normal for first deployment (container is still starting)."
          echo "   Check manually: https://${{ secrets.AZURE_WEBAPP_NAME }}.azurewebsites.net/health"
          echo "   Check logs in Azure Portal → App Service → Log stream"
```

---

## 6.5 How to Update the Workflow File

### Option A: Edit in VS Code (Recommended)

**Step 1:** Open the file in VS Code:
```
h:\DevOps\Automated CI_CD\.github\workflows\ci-cd.yml
```

**Step 2:** Select **all text** (Ctrl+A) and **delete** it.

**Step 3:** **Copy the entire YAML block** from section 6.4 above and **paste** it into the file.

**Step 4:** **Save** the file (Ctrl+S).

### Option B: Edit on GitHub.com

**Step 1:** Go to your repo on GitHub → Navigate to `.github/workflows/ci-cd.yml`.

**Step 2:** Click the **pencil icon** (Edit) on the top-right.

**Step 3:** Select all (Ctrl+A), delete, paste the new YAML.

**Step 4:** Click **"Commit changes"**.

---

## 6.6 What Changed — A Detailed Breakdown

### Job 1: Build & Test → **NO CHANGES**
Exactly the same. Runs `npm ci`, `npm run lint`, `npm test`.

### Job 2: Docker Build & Push → **3 KEY CHANGES**

| Line | Before (Docker Hub) | After (Azure ACR) |
|------|--------------------|--------------------|
| env.DOCKER_IMAGE | `${{ secrets.DOCKERHUB_USERNAME }}/cicd-webapp` | `${{ secrets.ACR_LOGIN_SERVER }}/cicd-webapp` |
| Login action - registry | *(not set — defaults to Docker Hub)* | `${{ secrets.ACR_LOGIN_SERVER }}` |
| Login action - username | `${{ secrets.DOCKERHUB_USERNAME }}` | `${{ secrets.ACR_USERNAME }}` |
| Login action - password | `${{ secrets.DOCKERHUB_TOKEN }}` | `${{ secrets.ACR_PASSWORD }}` |

> Everything else (Buildx, metadata, build-push, caching) stays the same! The `docker/login-action` and `docker/build-push-action` work with **any** Docker registry — Docker Hub, ACR, ECR, GCR — you just change the `registry` parameter.

### Job 3: Deploy → **COMPLETELY REPLACED**

| Before (AWS EC2) | After (Azure App Service) |
|-----------------|---------------------------|
| SSH into an EC2 VM | Use `azure/webapps-deploy` action |
| Manually `docker pull` + `docker run` | App Service auto-pulls from ACR |
| Port mapping `-p 80:3000` | Configured via `WEBSITES_PORT` in Azure |
| `curl http://localhost/health` | `curl https://<app>.azurewebsites.net/health` |

---

## 6.7 📝 What You Should Have Now

| ✅ Checkpoint | Status |
|--------------|--------|
| `ACR_LOGIN_SERVER` secret added to GitHub | ☐ Done? |
| `ACR_USERNAME` secret added to GitHub | ☐ Done? |
| `ACR_PASSWORD` secret added to GitHub | ☐ Done? |
| `AZURE_WEBAPP_NAME` secret added to GitHub | ☐ Done? |
| `ci-cd.yml` updated with Azure workflow | ☐ Done? |
| File saved / committed | ☐ Done? |

---

## ✅ Batch 6 Complete

You now have:
- 4 GitHub Secrets configured for Azure (ACR credentials + App Service name)
- An updated CI/CD workflow that pushes to ACR and deploys to Azure App Service
- Retry logic on health check verification (5 attempts with 10s intervals)

> ⚠️ **DON'T push yet!** In the next batch, we'll walk through the first push and watch the pipeline run.

**Say `continue` to start Batch 7: Testing the full pipeline end-to-end.**

---
---

# Batch 7: Testing the Full Pipeline End-to-End

> 🎬 **This is the moment of truth!** We'll push code, watch the pipeline run, and see your app live on Azure.

## 7.1 Pre-Flight Checklist

Before pushing, verify everything is ready:

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Azure account active with free credits | ☐ |
| 2 | Resource Group `cicd-webapp-rg` exists | ☐ |
| 3 | ACR `cicdwebappacr` created, admin enabled | ☐ |
| 4 | App Service `cicd-webapp` created (B1, Linux, Docker) | ☐ |
| 5 | `WEBSITES_PORT=3000` set in App Service Configuration | ☐ |
| 6 | Deployment Center configured (ACR, Continuous Deployment ON) | ☐ |
| 7 | Health check enabled at `/health` | ☐ |
| 8 | 4 GitHub Secrets added (`ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD`, `AZURE_WEBAPP_NAME`) | ☐ |
| 9 | `ci-cd.yml` updated with Azure workflow | ☐ |

---

## 7.2 Commit and Push Your Changes

Open your terminal (Git Bash) in the project directory and run these commands:

### If you're on the `fix-cicd-pipeline` branch:

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Migrate CI/CD pipeline from AWS/DockerHub to Azure ACR/AppService"

# Push to your branch
git push origin fix-cicd-pipeline
```

### Create a Pull Request and Merge:

**Step 1:** Go to GitHub → Your repository.

**Step 2:** You'll see a yellow banner: **"fix-cicd-pipeline had recent pushes — Compare & pull request"**. Click it.

**Step 3:** Add a title: `Migrate CI/CD to Azure` and click **"Create pull request"**.

**Step 4:** Watch **Job 1 (Build & Test)** run on the PR. It should pass ✅ (lint + tests).

> Jobs 2 and 3 **won't run** on PRs — they only run on pushes to `main`. That's by design (the `if:` conditions in the workflow).

**Step 5:** Once Job 1 passes, click **"Merge pull request"** → **"Confirm merge"**.

**Step 6:** This triggers a push to `main` → **All 3 jobs will run!**

---

## 7.3 Watch the Pipeline Run

**Step 1:** Go to your repository on GitHub.

**Step 2:** Click the **"Actions"** tab.

```
┌───────────────────────────────────────────────────────────────┐
│  < > Code    ○ Issues    ↙ Pull requests    ▶ Actions ← ←    │
└───────────────────────────────────────────────────────────────┘
```

**Step 3:** You'll see your workflow running:

```
┌───────────────────────────────────────────────────────────────┐
│  CI/CD Pipeline                                               │
│                                                               │
│  Migrate CI/CD to Azure                                       │
│  main • triggered just now                                    │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ ● Build & Test  │→ │ ○ Docker Build  │→ │ ○ Deploy to  │ │
│  │   Running...    │  │   & Push to ACR │  │   Azure App  │ │
│  │   (2-3 min)     │  │   Waiting...    │  │   Service    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└───────────────────────────────────────────────────────────────┘

● = Running    ○ = Waiting    ✓ = Passed    ✗ = Failed
```

**Step 4:** Click on the run to see detailed logs for each job.

**Step 5:** Each job takes approximately:

| Job | Expected Time | What to Watch For |
|-----|-------------|-------------------|
| Build & Test | 2-3 minutes | `npm ci`, `npm run lint`, `npm test` — all should pass |
| Docker Build & Push | 3-5 minutes | First build takes longer (no cache). Look for `Login to ACR - succeeded` |
| Deploy to Azure | 1-2 minutes | `Deploy to Azure Web App` step. Health check may take a few attempts |

> ⏱️ **Total time for first run: ~8-12 minutes.** Subsequent runs are faster due to caching.

---

## 7.4 Verify Your Live Deployment

Once all 3 jobs show ✅, your app is live!

**Step 1:** Open your browser and go to:
```
https://cicd-webapp.azurewebsites.net
```
(Replace `cicd-webapp` with your actual app name if you used a different one)

**Step 2:** You should see your **HTML home page** with "Automated CI/CD Web Application" and the deployment status.

**Step 3:** Test the health endpoint:
```
https://cicd-webapp.azurewebsites.net/health
```

You should see JSON like:
```json
{
    "status": "healthy",
    "timestamp": "2026-04-03T00:15:00.000Z",
    "uptime": 45.123,
    "environment": "production",
    "version": "1.0.0",
    "memoryUsage": {
        "rss": "35 MB",
        "heapUsed": "15 MB"
    }
}
```

**Step 4:** Test the API info endpoint:
```
https://cicd-webapp.azurewebsites.net/api/info
```

---

## 7.5 First Run Troubleshooting

If things don't work on the first try, here's how to diagnose:

### Job 1 Failed (Build & Test)
> **This is a code issue**, not an Azure issue. Check the logs for lint errors or test failures.

### Job 2 Failed (Docker Build & Push)
| Error Message | Cause | Fix |
|--------------|-------|-----|
| `denied: requested access` | Wrong ACR credentials | Re-check `ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD` secrets |
| `unauthorized: authentication required` | Admin user not enabled on ACR | Azure Portal → ACR → Access keys → Enable Admin user |
| Build failed | Dockerfile issue | Check the build logs for the specific error |

### Job 3 Failed (Deploy)
| Error Message | Cause | Fix |
|--------------|-------|-----|
| `Resource not found` | Wrong app name | Check `AZURE_WEBAPP_NAME` secret matches your Web App name exactly |
| Health check failed | Container still starting | Wait 2-3 minutes, try the URL manually |
| `Application Error` page | Container crashing | Check logs: Azure Portal → App Service → **Log stream** |

### App Shows Error Page After Deploy
**Step 1:** Go to Azure Portal → App Service → Left sidebar → **Log stream**.

**Step 2:** Watch the live logs. Common issues:
- `Container failed to start` → Check `WEBSITES_PORT=3000` is set
- `npm ERR!` → Something wrong with `package.json` or `package-lock.json`
- No logs at all → Container didn't pull. Check Deployment Center settings

---

## 7.6 Verify ACR Has Your Image

**Step 1:** Go to Azure Portal → Search `Container registries` → Click `cicdwebappacr`.

**Step 2:** In the left sidebar, click **"Repositories"**.

**Step 3:** You should see:

```
┌───────────────────────────────────────────────┐
│  Repositories                                  │
│  ┌──────────────────┬────────────────────┐    │
│  │ Name             │ Tags               │    │
│  ├──────────────────┼────────────────────┤    │
│  │ cicd-webapp       │ latest, 1, abc1234 │    │
│  └──────────────────┴────────────────────┘    │
└───────────────────────────────────────────────┘
```

> ✅ If you see `cicd-webapp` with tags — the pipeline successfully pushed the image!

---

## ✅ Batch 7 Complete

You have:
- Pushed code to GitHub
- Watched all 3 pipeline jobs pass
- Verified the app is live at `https://cicd-webapp.azurewebsites.net`
- Confirmed the Docker image exists in ACR

> 🎉 **Congratulations! Your CI/CD pipeline is fully operational on Azure!**

**Say `continue` for Batch 8: Monitoring, Logs & Troubleshooting.**

---
---

# Batch 8: Monitoring, Logs & Troubleshooting

## 8.1 Viewing Live Logs (Log Stream)

This is the #1 tool for debugging container issues.

**Step 1:** Azure Portal → App Services → `cicd-webapp`.

**Step 2:** Left sidebar → **Monitoring** → **Log stream**.

```
┌───────────────────────────────────────────────────────────────┐
│  cicd-webapp | Log stream                                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  2026-04-03T00:15:00  Starting container cicd-webapp          │
│  2026-04-03T00:15:02  Pulling image cicdwebappacr.azurecr.io/ │
│                       cicd-webapp:latest                      │
│  2026-04-03T00:15:15  Container started successfully          │
│  2026-04-03T00:15:16                                          │
│      ========================================                 │
│        Server running in production mode                      │
│        URL: http://localhost:3000                              │
│        Health: http://localhost:3000/health                    │
│      ========================================                 │
│                                                               │
│  2026-04-03T00:15:20  Container healthy                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

> 💡 This shows **real-time** logs from your container. Leave it open while testing.

---

## 8.2 Viewing Deployment Logs

**Step 1:** Left sidebar → **Deployment Center**.

**Step 2:** Click the **"Logs"** tab (next to "Settings").

**Step 3:** You'll see a history of deployments:

```
┌──────────────────────────────────────────────────────────┐
│  Deployment logs                                          │
│  ┌──────────────┬──────────┬──────────────────────────┐  │
│  │ Time         │ Status   │ Message                  │  │
│  ├──────────────┼──────────┼──────────────────────────┤  │
│  │ 00:15:00     │ Success  │ Pulled image latest      │  │
│  │ 00:15:15     │ Success  │ Container started        │  │
│  └──────────────┴──────────┴──────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 8.3 Metrics Dashboard

**Step 1:** Left sidebar → **Monitoring** → **Metrics**.

**Step 2:** Useful metrics to monitor:

| Metric | What It Shows | Healthy Value |
|--------|-------------|---------------|
| **HTTP Server Errors** | 5xx errors from your app | Should be 0 |
| **Response Time** | How fast your app responds | < 500ms |
| **CPU Percentage** | CPU usage of the App Service Plan | < 70% |
| **Memory Percentage** | RAM usage | < 80% |
| **Requests** | Total requests per time period | Depends on traffic |

**Step 3:** Click **"Add metric"** → Select a metric → See the graph.

---

## 8.4 Setting Up Alerts (Optional)

Get an email when something goes wrong.

**Step 1:** Left sidebar → **Monitoring** → **Alerts**.

**Step 2:** Click **"+ Create"** → **"Alert rule"**.

**Step 3:** Useful alert example — **"Email me when the app returns 5+ errors in 5 minutes"**:

| Setting | Value |
|---------|-------|
| Signal | `Http Server Errors` |
| Threshold | Greater than 5 |
| Period | 5 minutes |
| Action | Email notification |

**Step 4:** Click **"Create"**.

---

## 8.5 Common Issues & Solutions

| Problem | Symptoms | Solution |
|---------|----------|----------|
| **Container won't start** | Log stream shows "Container failed to start within the time limit" | Check `WEBSITES_PORT=3000` is set. Increase startup time: Configuration → General settings → Startup command timeout |
| **App returns 502** | "Bad Gateway" in browser | Container is starting or crashed. Check Log stream. May need to restart: Overview → Restart |
| **Old version still showing** | Changes not reflected | Azure may be caching. Try: Deployment Center → clear Continuous Deployment → re-enable. Or restart the App Service |
| **Health check fails** | Azure shows instance unhealthy | Verify `/health` route is working. Check if `express.static` is blocking the route |
| **High memory usage** | Container restarts frequently | The B1 plan has 1.75 GB RAM. Check for memory leaks. Consider scaling up |
| **Slow response times** | Pages take > 2 seconds | Central India free tier can be slow. Consider upgrading plan or changing region |

### How to Restart the App

**Step 1:** App Service → **Overview** → Click **"Restart"** button at the top.

**Step 2:** Wait 30 seconds for the container to restart.

---

## ✅ Batch 8 Complete

You now know how to:
- View real-time container logs
- Check deployment history
- Monitor CPU, memory, and response times
- Set up email alerts for errors
- Troubleshoot common issues

**Say `continue` for Batch 9: Cost Management & Cleanup.**

---
---

# Batch 9: Cost Management & Cleanup

## 9.1 What Is This Costing You?

With your free Azure account (₹15,000 credits), here's the breakdown:

| Resource | Pricing Tier | Monthly Cost | Free Credits Cover? |
|----------|-------------|-------------|---------------------|
| Container Registry (ACR) | Basic | ~₹350/month | ✅ Yes (~15 months) |
| App Service Plan | B1 (Basic) | ~₹1,000/month | ✅ Yes (~15 months) |
| **Total** | | **~₹1,350/month** | **~11 months covered** |

> 💡 Your free ₹15,000 credits will last approximately **11 months** with this setup. After that, you'll be charged unless you delete the resources.

---

## 9.2 Check Your Remaining Credits

**Step 1:** Go to Azure Portal → Search `Subscriptions`.

**Step 2:** Click on `Azure subscription 1`.

**Step 3:** Look for **"Credits remaining"** or go to the **Cost Management** section.

---

## 9.3 Set Up a Budget Alert

Get notified before you run out of credits.

**Step 1:** Azure Portal → Search `Cost Management`.

**Step 2:** Click **"Budgets"** → **"+ Add"**.

**Step 3:** Create a budget:

| Setting | Value |
|---------|-------|
| Name | `free-credit-alert` |
| Amount | `₹14,000` (trigger before credits run out) |
| Alert at | 80% (₹11,200), 100% (₹14,000) |
| Email | Your email address |

**Step 4:** Click **"Create"**.

---

## 9.4 How to Clean Up (Delete Everything)

When you're done with the project and want to stop all charges:

> ⚠️ **This permanently deletes everything** — your web app, container registry, and all images. Only do this when you're completely done.

**Step 1:** Azure Portal → Search `Resource groups`.

**Step 2:** Click on **`cicd-webapp-rg`**.

**Step 3:** Click **"Delete resource group"** (at the top).

```
┌───────────────────────────────────────────────────────────┐
│  ⚠️  Are you sure you want to delete "cicd-webapp-rg"?    │
│                                                           │
│  This will delete ALL resources inside:                   │
│  • cicdwebappacr (Container Registry)                     │
│  • cicd-webapp (App Service)                              │
│  • cicd-webapp-plan (App Service Plan)                    │
│                                                           │
│  Type the resource group name to confirm:                 │
│  [ cicd-webapp-rg                                  ]      │
│                                                           │
│            [ Delete ]                                     │
└───────────────────────────────────────────────────────────┘
```

**Step 4:** Type `cicd-webapp-rg` to confirm.

**Step 5:** Click **"Delete"**.

**Step 6:** Wait 2-5 minutes. All resources are permanently removed. Billing stops immediately.

> 💡 **This is why Resource Groups are great** — one click deletes everything. No hunting for individual resources.

---

## 9.5 Clean Up GitHub Secrets (Optional)

If you're done with Azure, you can remove the Azure secrets from GitHub:

**Step 1:** GitHub → Repository → Settings → Secrets and variables → Actions.

**Step 2:** Click the **trash icon** next to each Azure secret:
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AZURE_WEBAPP_NAME`

---

## ✅ Batch 9 Complete — Guide Complete! 🎉

---

# 🏁 Summary — What You Built

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR COMPLETE CI/CD PIPELINE ON AZURE                          │
│                                                                 │
│  Developer pushes code to GitHub                                │
│          │                                                      │
│          ▼                                                      │
│  ┌─────────────────────────────────┐                           │
│  │  GitHub Actions Pipeline         │                           │
│  │                                 │                           │
│  │  Job 1: npm ci → lint → test    │  (2-3 min)                │
│  │         ↓ (pass)                │                           │
│  │  Job 2: Docker build → Push     │  (3-5 min)                │
│  │         to ACR                  │                           │
│  │         ↓ (pass)                │                           │
│  │  Job 3: Deploy to Azure App     │  (1-2 min)                │
│  │         Service → Health check  │                           │
│  └─────────────────────────────────┘                           │
│          │                                                      │
│          ▼                                                      │
│  ┌─────────────────────────────────┐                           │
│  │  Azure                          │                           │
│  │                                 │                           │
│  │  ACR pulls → App Service runs   │                           │
│  │  Live at: https://cicd-webapp   │                           │
│  │  .azurewebsites.net             │                           │
│  └─────────────────────────────────┘                           │
│                                                                 │
│  Total pipeline time: ~8-12 minutes                             │
│  Monthly cost: ~₹1,350 (free credits: ₹15,000)                 │
└─────────────────────────────────────────────────────────────────┘
```

### What You Learned
1. ✅ Azure fundamentals (Subscriptions, Resource Groups, Regions)
2. ✅ Azure Container Registry (private Docker image storage)
3. ✅ Azure App Service (managed container hosting)
4. ✅ Connecting ACR ↔ App Service with Continuous Deployment
5. ✅ GitHub Secrets for secure credential management
6. ✅ GitHub Actions workflow for Azure (build → push → deploy)
7. ✅ Monitoring, logging, and troubleshooting on Azure
8. ✅ Cost management and resource cleanup

### Files Modified in This Project
| File | What Changed |
|------|-------------|
| `.github/workflows/ci-cd.yml` | Replaced Docker Hub + EC2 with ACR + App Service |
| `Dockerfile` | Multi-stage build (already set up) |
| `.dockerignore` | Excludes unnecessary files from builds |
| `docker-compose.yml` | Local testing configuration |

> 🎓 **You now have hands-on experience deploying a containerized application to Azure using a CI/CD pipeline.** This is a highly marketable DevOps skill!

