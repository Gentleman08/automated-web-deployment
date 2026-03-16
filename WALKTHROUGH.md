# Automated CI/CD for Web Application Deployment

## Complete Project Walkthrough

---

> **Project Abstract:** This project focuses on the design and implementation of an automated
> Continuous Integration and Continuous Deployment (CI/CD) pipeline for web application deployment.
> Traditional deployment processes are manual, time-consuming, and prone to errors. The proposed
> system automates the software delivery lifecycle by integrating source code management, automated
> build, testing, containerization, and deployment using modern DevOps tools and practices.

---

## Table of Contents

| #   | Section                                | Status  |
| --- | -------------------------------------- | ------- |
| 1   | Project Overview                       | Batch 1 |
| 2   | Objectives & Scope                     | Batch 1 |
| 3   | Architecture & System Design           | Batch 1 |
| 4   | Prerequisites & Tool Stack             | Batch 2 |
| 5   | Phase 1 - Version Control Setup        | Batch 2 |
| 6   | Phase 2 - Sample Web Application       | Batch 3 |
| 7   | Phase 3 - Containerization with Docker | Batch 3 |
| 8   | Phase 4 - CI Pipeline (GitHub Actions) | Batch 4 |
| 9   | Phase 5 - Automated Testing            | Batch 5 |
| 10  | Phase 6 - Container Registry           | Batch 5 |
| 11  | Phase 7 - Cloud Deployment (AWS)       | Batch 6 |
| 12  | Phase 8 - Continuous Deployment        | Batch 6 |
| 13  | Phase 9 - End-to-End Pipeline Demo     | Batch 7 |
| 14  | Gotchas & Troubleshooting              | Batch 7 |
| 15  | Future Enhancements                    | Batch 8 |
| 16  | References & Conclusion                | Batch 8 |

---

## 1. Project Overview

### 1.1 What is CI/CD?

**Continuous Integration (CI)** is the practice of frequently merging code changes into a shared
repository, where automated builds and tests verify every change. **Continuous Deployment (CD)**
extends this by automatically deploying validated code to production environments.

```
  MENTAL MODEL: The CI/CD Spectrum
  =================================

  Manual World (Before CI/CD)
  +--------+    +--------+    +---------+    +--------+    +---------+
  | Write  |--->| Email  |--->| Manual  |--->| Manual |--->| Manual  |
  | Code   |    | Patch  |    | Build   |    | Test   |    | Deploy  |
  +--------+    +--------+    +---------+    +--------+    +---------+
       |                           |              |              |
       |     Hours/Days            |   Hours      |  Hours       |  Hours
       +---(Error-prone, slow, inconsistent)------+--------------+

  CI/CD World (After)
  +--------+    +--------+    +---------+    +--------+    +---------+
  | Write  |--->|  Git   |--->|  Auto   |--->|  Auto  |--->|  Auto   |
  | Code   |    |  Push  |    |  Build  |    |  Test  |    |  Deploy |
  +--------+    +--------+    +---------+    +--------+    +---------+
       |             |              |              |              |
       |   Seconds   |   Minutes    |   Minutes    |   Minutes    |
       +---(Automated, consistent, repeatable)----+--------------+
```

### 1.2 Why This Project Matters

| Problem (Manual)                   | Solution (CI/CD)                      |
| ---------------------------------- | ------------------------------------- |
| "It works on my machine" syndrome  | Containerized consistent environments |
| Deployments take hours/days        | Deployments in minutes                |
| Human errors in build steps        | Automated, repeatable pipelines       |
| No test enforcement                | Mandatory automated testing gates     |
| Rollback is painful                | One-click rollback via container tags |
| Configuration drift across servers | Infrastructure as Code (IaC)          |

### 1.3 Key Terminology

| Term                   | Definition                                                               |
| ---------------------- | ------------------------------------------------------------------------ |
| **Pipeline**           | A series of automated steps that code goes through from commit to deploy |
| **Stage**              | A logical grouping of jobs in a pipeline (build, test, deploy)           |
| **Job**                | A single unit of work in a pipeline (e.g., run unit tests)               |
| **Artifact**           | Output of a build step (e.g., Docker image, compiled binary)             |
| **Runner/Agent**       | The machine/environment that executes pipeline jobs                      |
| **Trigger**            | An event that starts the pipeline (e.g., git push, pull request)         |
| **Environment**        | A target deployment destination (dev, staging, production)               |
| **Container Registry** | A storage service for Docker images (Docker Hub, AWS ECR)                |

---

## 2. Objectives & Scope

### 2.1 Primary Objectives

1. **Automate the Build Process** - Every git push triggers an automatic build
2. **Integrate Automated Testing** - Unit tests and linting run on every commit
3. **Containerize the Application** - Package the app as a Docker image for portability
4. **Implement Continuous Deployment** - Auto-deploy passing builds to cloud infrastructure
5. **Ensure Reproducibility** - Same pipeline produces identical results every time

### 2.2 Project Scope

```
  IN SCOPE                              OUT OF SCOPE (Future Work)
  +----------------------------------+  +----------------------------------+
  | - Git-based source control       |  | - Kubernetes orchestration       |
  | - Node.js sample web application |  | - Blue/Green deployments         |
  | - Dockerfile & containerization  |  | - Canary releases                |
  | - GitHub Actions CI pipeline     |  | - Full monitoring stack          |
  | - Automated unit testing         |  | - Secret rotation automation     |
  | - Docker Hub image registry      |  | - Multi-region deployment        |
  | - AWS EC2 deployment             |  | - Database migration automation  |
  | - Basic health checks            |  | - Load testing                   |
  +----------------------------------+  +----------------------------------+
```

### 2.3 Technology Stack Overview

```
  TOOL STACK MAP
  ===============

  Layer 0: Source Code
  +--------------------------------------------------+
  | Git + GitHub (Version Control & Collaboration)    |
  +--------------------------------------------------+
                          |
                          v
  Layer 1: CI Engine
  +--------------------------------------------------+
  | GitHub Actions (Build, Test, Lint Automation)     |
  +--------------------------------------------------+
                          |
                          v
  Layer 2: Containerization
  +--------------------------------------------------+
  | Docker (Package App + Dependencies into Image)    |
  +--------------------------------------------------+
                          |
                          v
  Layer 3: Registry
  +--------------------------------------------------+
  | Docker Hub (Store & Version Docker Images)        |
  +--------------------------------------------------+
                          |
                          v
  Layer 4: Deployment Target
  +--------------------------------------------------+
  | AWS EC2 Instance (Cloud Virtual Machine)          |
  +--------------------------------------------------+
                          |
                          v
  Layer 5: Runtime
  +--------------------------------------------------+
  | Docker Engine on EC2 (Pull & Run Container)       |
  +--------------------------------------------------+
```

---

## 3. Architecture & System Design

### 3.1 High-Level Pipeline Architecture

```
  +===========================================================================+
  |                    AUTOMATED CI/CD PIPELINE - OVERVIEW                     |
  +===========================================================================+
  |                                                                           |
  |  DEVELOPER WORKSTATION            GITHUB                                  |
  |  +--------------------+          +----------------------------+           |
  |  |                    |   push   |                            |           |
  |  |  Code Editor       |--------->|  GitHub Repository         |           |
  |  |  (VS Code)         |          |                            |           |
  |  |                    |<---------|  - Source Code              |           |
  |  |  Local Git Repo    |   pull   |  - Dockerfile              |           |
  |  |  Docker (local     |          |  - .github/workflows/      |           |
  |  |   testing)         |          |  - package.json             |           |
  |  +--------------------+          |  - tests/                   |           |
  |                                  +----------------------------+           |
  |                                             |                             |
  |                                             | (webhook trigger)           |
  |                                             v                             |
  |                                  +----------------------------+           |
  |                                  |  GITHUB ACTIONS RUNNER     |           |
  |                                  |                            |           |
  |                                  |  Stage 1: CHECKOUT         |           |
  |                                  |    - Clone repo            |           |
  |                                  |                            |           |
  |                                  |  Stage 2: INSTALL          |           |
  |                                  |    - npm install           |           |
  |                                  |                            |           |
  |                                  |  Stage 3: LINT             |           |
  |                                  |    - npm run lint          |           |
  |                                  |                            |           |
  |                                  |  Stage 4: TEST             |           |
  |                                  |    - npm test              |           |
  |                                  |                            |           |
  |                                  |  Stage 5: BUILD IMAGE      |           |
  |                                  |    - docker build          |           |
  |                                  |                            |           |
  |                                  |  Stage 6: PUSH IMAGE       |           |
  |                                  |    - docker push           |           |
  |                                  +----------------------------+           |
  |                                             |                             |
  |                                             | (on success)                |
  |                                             v                             |
  |        +--------------------+    +----------------------------+           |
  |        |   DOCKER HUB       |<---|  Push tagged image         |           |
  |        |                    |    |  user/app:latest           |           |
  |        |  Image Registry    |    |  user/app:v1.0.3           |           |
  |        +--------------------+    +----------------------------+           |
  |                 |                                                         |
  |                 | (deploy stage - SSH to EC2)                             |
  |                 v                                                         |
  |        +--------------------------------------------+                    |
  |        |          AWS EC2 INSTANCE                   |                    |
  |        |                                             |                    |
  |        |  1. docker pull user/app:latest             |                    |
  |        |  2. docker stop old-container               |                    |
  |        |  3. docker run -d -p 80:3000 user/app       |                    |
  |        |  4. Health check: curl http://localhost      |                    |
  |        |                                             |                    |
  |        |  +---------------------------------------+  |                    |
  |        |  |  Docker Container                     |  |                    |
  |        |  |  +-------------------------------+    |  |                    |
  |        |  |  |  Node.js Web Application      |    |  |                    |
  |        |  |  |  Listening on port 3000       |    |  |                    |
  |        |  |  +-------------------------------+    |  |                    |
  |        |  +---------------------------------------+  |                    |
  |        +--------------------------------------------+                    |
  |                                                                           |
  +===========================================================================+
```

### 3.2 Pipeline Flow - Sequence Diagram

```
  Developer        GitHub         GitHub Actions      Docker Hub       AWS EC2
     |                |                |                  |                |
     |--- git push -->|                |                  |                |
     |                |--- webhook --->|                  |                |
     |                |                |                  |                |
     |                |                |-- checkout ------>                |
     |                |                |-- npm install -->|                |
     |                |                |-- npm lint ----->|                |
     |                |                |-- npm test ----->|                |
     |                |                |                  |                |
     |                |                |    [Tests Pass?] |                |
     |                |                |       |          |                |
     |                |                |   YES |    NO--->X (Pipeline      |
     |                |                |       |            Stops, notify) |
     |                |                |       v          |                |
     |                |                |-- docker build ->|                |
     |                |                |-- docker push ---|-->  Store     |
     |                |                |                  |    Image      |
     |                |                |                  |                |
     |                |                |-------- SSH -----|--> docker pull |
     |                |                |                  |    docker run  |
     |                |                |                  |                |
     |                |                |<--- health check result ---------|
     |                |                |                  |                |
     |<-- status -----|<-- status -----|                  |                |
     |   (pass/fail)  |               |                  |                |
     |                |                |                  |                |
```

### 3.3 Environment Architecture

```
  ENVIRONMENT PROMOTION MODEL
  ============================

  +-------------------+     +-------------------+     +-------------------+
  |   DEVELOPMENT     |     |    STAGING         |     |   PRODUCTION      |
  |                   |     |                    |     |                   |
  |  - feature/*      |---->|  - main branch     |---->|  - tagged release |
  |  - Local Docker   |     |  - Auto-deploy     |     |  - Manual approve |
  |  - Unit tests     |     |  - Integration     |     |  - Full deploy    |
  |  - Linting        |     |    tests           |     |  - Health checks  |
  |                   |     |  - Smoke tests     |     |  - Monitoring     |
  +-------------------+     +-------------------+     +-------------------+
         |                         |                          |
         |  PR merged to main      |  Tests pass              |  Tag created
         +--- triggers CI -------->+--- triggers deploy ----->+--- triggers prod
                                                                   deploy
```

> **GOTCHA: Environment Parity**
> Your local dev, CI runner, and production environments WILL drift apart over time.
> Docker helps, but watch out for:
>
> - Different Node.js versions between local and CI
> - OS-level differences (Alpine vs Ubuntu in Docker)
> - Environment variables that exist locally but not in CI
> - File system case sensitivity (Windows vs Linux)
>
> **Mitigation:** Always use the SAME Docker image for testing and deployment.
> Never install dependencies outside the Dockerfile.

### 3.4 Data Flow Diagram

```
  +============================================================+
  |                      DATA FLOW                              |
  +============================================================+
  |                                                             |
  |  SOURCE CODE (.js, .json, Dockerfile, .yml)                 |
  |       |                                                     |
  |       v                                                     |
  |  GIT COMMIT (sha: a1b2c3d)                                  |
  |       |                                                     |
  |       v                                                     |
  |  GITHUB REPOSITORY (remote origin)                           |
  |       |                                                     |
  |       v                                                     |
  |  CI PIPELINE TRIGGER (push/PR event)                         |
  |       |                                                     |
  |       +---> npm install ---> node_modules/                   |
  |       |                                                     |
  |       +---> npm test ------> Test Results (pass/fail)        |
  |       |                                                     |
  |       +---> npm run lint --> Lint Results (pass/fail)         |
  |       |                                                     |
  |       +---> docker build --> Docker Image (tagged)           |
  |       |                         |                            |
  |       |                         v                            |
  |       |                    DOCKER HUB                        |
  |       |                    (image stored)                    |
  |       |                         |                            |
  |       |                         v                            |
  |       |                    EC2 pulls image                   |
  |       |                    Runs container                    |
  |       |                         |                            |
  |       |                         v                            |
  |       |                    WEB APP LIVE                      |
  |       |                    http://ec2-ip:80                  |
  |       |                                                     |
  +============================================================+
```

### 3.5 Security Architecture

```
  SECRET MANAGEMENT FLOW
  =======================

  +---------------------------+
  |  GitHub Repository        |
  |  Settings > Secrets       |
  |                           |
  |  DOCKERHUB_USERNAME  = ** |
  |  DOCKERHUB_TOKEN     = ** |
  |  EC2_SSH_PRIVATE_KEY = ** |
  |  EC2_HOST            = ** |
  |  EC2_USER            = ** |
  +---------------------------+
            |
            | (injected at runtime)
            v
  +---------------------------+
  |  GitHub Actions Runner    |
  |                           |
  |  ${{ secrets.XXX }}       |
  |  - Never printed in logs  |
  |  - Masked if echoed       |
  |  - Scoped to repo/env     |
  +---------------------------+
            |
            | (used for)
            v
  +---------------------------+
  |  docker login             |
  |  ssh -i key ec2-user@host |
  +---------------------------+
```

> **GOTCHA: Secret Leakage**
>
> - NEVER hardcode secrets in code, Dockerfiles, or workflow files
> - GitHub Actions masks secrets in logs BUT structured output (JSON) can leak them
> - Use `echo "::add-mask::$MY_SECRET"` for dynamic secrets
> - Rotate Docker Hub tokens regularly (they don't expire by default)
> - EC2 SSH keys: use Ed25519 over RSA for better security
> - NEVER commit `.env` files — add to `.gitignore` immediately

### 3.6 Project Directory Structure (What We Will Build)

```
  automated-cicd-webapp/
  |
  +-- .github/
  |   +-- workflows/
  |       +-- ci-cd.yml              # GitHub Actions pipeline definition
  |
  +-- src/
  |   +-- app.js                     # Express.js application entry point
  |   +-- routes/
  |   |   +-- index.js               # Route definitions
  |   |   +-- health.js              # Health check endpoint
  |   +-- controllers/
  |   |   +-- homeController.js      # Business logic
  |   +-- middleware/
  |       +-- errorHandler.js        # Error handling middleware
  |
  +-- tests/
  |   +-- app.test.js                # Unit tests (Jest)
  |   +-- routes.test.js             # Route tests
  |
  +-- public/
  |   +-- index.html                 # Static frontend page
  |   +-- styles.css                 # Stylesheet
  |
  +-- Dockerfile                     # Container build instructions
  +-- .dockerignore                  # Files excluded from Docker build
  +-- docker-compose.yml             # Local development compose file
  +-- package.json                   # Node.js project manifest
  +-- package-lock.json              # Locked dependency versions
  +-- .gitignore                     # Git exclusion rules
  +-- .eslintrc.json                 # Linting configuration
  +-- .env.example                   # Environment variable template
  +-- README.md                      # Project documentation
  +-- deploy.sh                      # Deployment helper script
  +-- WALKTHROUGH.md                 # This file
```

---

<!-- BATCH 1 END -->

---

## 4. Prerequisites & Environment Setup

### 4.1 Required Accounts (Free Tier)

| Service        | URL                    | Purpose                    | Free Tier                        |
| -------------- | ---------------------- | -------------------------- | -------------------------------- |
| **GitHub**     | https://github.com     | Source code + CI/CD engine | Unlimited public repos           |
| **Docker Hub** | https://hub.docker.com | Container image registry   | 1 private repo, unlimited public |
| **AWS**        | https://aws.amazon.com | Cloud deployment target    | 12-month free tier (t2.micro)    |

> **GOTCHA: AWS Free Tier Billing**
>
> - t2.micro gives you **750 hours/month** free for 12 months
> - If you leave an EC2 instance running 24/7, that's ~730 hours — barely within limits
> - **Elastic IPs cost money if NOT attached** to a running instance ($0.005/hr)
> - Set up AWS Billing Alerts immediately: AWS Console > Billing > Budgets
> - Use `aws configure` with IAM user, NEVER use root account credentials
> - **Stop your EC2 instance when not in use during development**

### 4.2 Software Installation (Windows)

#### Step 1: Install Git

```bash
# Download from: https://git-scm.com/download/win
# During installation, select:
#   - "Use Git from the Windows Command Prompt"
#   - "Checkout as-is, commit Unix-style line endings"
#   - "Use Windows' default console window"

# Verify installation
git --version
# Expected: git version 2.4x.x

# Configure identity (use YOUR details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name to 'main'
git config --global init.defaultBranch main

# Verify configuration
git config --list
```

> **GOTCHA: Line Endings (CRLF vs LF)**
> Windows uses CRLF (`\r\n`), Linux/Mac uses LF (`\n`).
> Docker containers run Linux. If your files have CRLF line endings,
> shell scripts inside containers WILL break with cryptic errors like:
> `/bin/bash^M: bad interpreter`
>
> **Fix:** Add a `.gitattributes` file to your repo:
>
> ```
> * text=auto
> *.sh text eol=lf
> *.yml text eol=lf
> Dockerfile text eol=lf
> ```

#### Step 2: Install Node.js

```bash
# Download LTS from: https://nodejs.org/en/download/
# Choose: Windows Installer (.msi), LTS version (20.x or 22.x)

# Verify installation
node --version
# Expected: v20.x.x or v22.x.x

npm --version
# Expected: 10.x.x
```

> **GOTCHA: Node.js Version Management**
>
> - Use the **LTS** (Long Term Support) version, NOT "Current"
> - For multiple projects needing different Node versions, install **nvm-windows**:
>   https://github.com/coreybutler/nvm-windows
> - Your CI pipeline MUST use the same Node version as local development
> - Pin the version in your workflow file: `node-version: '20'`

#### Step 3: Install Docker Desktop

```bash
# Download from: https://www.docker.com/products/docker-desktop/
# Requirements:
#   - Windows 10/11 64-bit (Pro, Enterprise, or Education for Hyper-V)
#   - OR Windows 10/11 Home with WSL 2 backend
#   - Minimum 4GB RAM (8GB+ recommended)

# During installation:
#   - Enable WSL 2 backend (recommended over Hyper-V)
#   - You may need to install WSL 2 Linux kernel update package

# After installation, restart your computer
# Open Docker Desktop and wait for it to start (whale icon in taskbar)

# Verify installation
docker --version
# Expected: Docker version 2x.x.x

docker compose version
# Expected: Docker Compose version v2.x.x

# Test Docker works
docker run hello-world
# Should pull image and print "Hello from Docker!"
```

> **GOTCHA: Docker Desktop on Windows**
>
> - Docker Desktop requires either **Hyper-V** or **WSL 2**
> - WSL 2 is recommended — better performance and works on Windows Home
> - If Docker fails to start, run in PowerShell (Admin):
>   ```powershell
>   wsl --install
>   wsl --set-default-version 2
>   ```
> - Docker Desktop may conflict with VirtualBox/VMware — you can't run both Hyper-V
>   and VirtualBox simultaneously
> - Docker consumes significant RAM — allocate 2-4GB in Docker Desktop Settings > Resources
> - If builds are slow, increase CPU and memory allocation in Docker Desktop settings

#### Step 4: Install VS Code (Recommended Editor)

```bash
# Download from: https://code.visualstudio.com/

# Recommended Extensions (install from VS Code):
#   - Docker (ms-azuretools.vscode-docker)
#   - GitHub Actions (github.vscode-github-actions)
#   - ESLint (dbaeumer.vscode-eslint)
#   - GitLens (eamodio.gitlens)
#   - Remote - SSH (ms-vscode-remote.remote-ssh)
```

#### Step 5: Install AWS CLI

```bash
# Download from: https://aws.amazon.com/cli/
# Choose: Windows 64-bit MSI installer

# Verify installation
aws --version
# Expected: aws-cli/2.x.x

# Configure (after creating IAM user in AWS Console)
aws configure
# AWS Access Key ID: your-access-key
# AWS Secret Access Key: your-secret-key
# Default region name: us-east-1  (or your preferred region)
# Default output format: json
```

### 4.3 Verification Checklist

Run these commands to verify your environment is ready:

```bash
# Run all verification commands
echo "=== Environment Verification ==="
echo "Git:" && git --version
echo "Node:" && node --version
echo "NPM:" && npm --version
echo "Docker:" && docker --version
echo "Docker Compose:" && docker compose version
echo "AWS CLI:" && aws --version
echo "=== All checks passed ==="
```

```
  EXPECTED OUTPUT:
  ================
  === Environment Verification ===
  Git: git version 2.43.0
  Node: v20.11.0
  NPM: 10.2.4
  Docker: Docker version 25.0.3
  Docker Compose: Docker Compose version v2.24.5
  AWS CLI: aws-cli/2.15.10
  === All checks passed ===
```

> **GOTCHA: PATH Issues on Windows**
> If any command is "not recognized", the installer didn't add it to your PATH.
> Fix: Add the tool's installation directory to your System PATH:
>
> - Right-click "This PC" > Properties > Advanced System Settings
> - Environment Variables > System Variables > Path > Edit
> - Add the missing path (e.g., `C:\Program Files\Git\cmd`)
> - **Restart your terminal** after modifying PATH

---

## 5. Phase 1 — Version Control Setup (Git + GitHub)

### 5.1 Understanding Git Workflow for CI/CD

```
  GIT BRANCHING MODEL FOR CI/CD
  ==============================

  main (production-ready)
  |
  |-----> feature/add-login -----> PR -----> merge to main
  |                                              |
  |-----> feature/fix-header ---> PR -----> merge to main
  |                                              |
  |-----> hotfix/security-patch -> PR ----> merge to main
  |                                              |
  v                                              v
  Each merge to 'main' triggers              CI/CD Pipeline
  the full pipeline automatically             runs on every
                                              push/PR event

  BRANCH NAMING CONVENTION:
  +-------------------+------------------------------------------+
  | Pattern           | Example                                  |
  +-------------------+------------------------------------------+
  | feature/<name>    | feature/user-authentication               |
  | bugfix/<name>     | bugfix/login-redirect-loop                |
  | hotfix/<name>     | hotfix/xss-vulnerability-fix              |
  | release/<version> | release/v1.2.0                            |
  +-------------------+------------------------------------------+
```

### 5.2 Create the GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `automated-cicd-webapp`
3. Description: `Automated CI/CD Pipeline for Web Application Deployment`
4. Visibility: **Public** (free GitHub Actions minutes)
5. Check: **Add a README file**
6. Add `.gitignore`: Select **Node**
7. License: **MIT License**
8. Click **Create repository**

> **GOTCHA: Public vs Private Repos & GitHub Actions**
>
> - **Public repos**: Unlimited free GitHub Actions minutes
> - **Private repos**: 2,000 minutes/month free (then $0.008/min)
> - For this project, use a **public repo** to avoid billing surprises
> - GitHub Actions runners for public repos use `ubuntu-latest` (2-core, 7GB RAM)

### 5.3 Clone and Initialize Locally

```bash
# Navigate to your projects directory
cd C:\Users\YourName\Projects

# Clone the repository (replace with YOUR GitHub username)
git clone https://github.com/YOUR_USERNAME/automated-cicd-webapp.git

# Enter the project directory
cd automated-cicd-webapp

# Verify you're on the main branch
git branch
# * main

# Check remote is configured
git remote -v
# origin  https://github.com/YOUR_USERNAME/automated-cicd-webapp.git (fetch)
# origin  https://github.com/YOUR_USERNAME/automated-cicd-webapp.git (push)
```

### 5.4 Set Up .gitignore

Replace the default `.gitignore` with a comprehensive one:

```bash
# .gitignore
# ===============================

# Dependencies
node_modules/
package-lock.json

# Environment files (NEVER commit secrets)
.env
.env.local
.env.production

# Build output
dist/
build/
coverage/

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo

# Docker
docker-compose.override.yml

# AWS
.aws/
```

### 5.5 Set Up .gitattributes (Critical for Docker)

```bash
# .gitattributes
# Ensures consistent line endings across OS

# Auto detect text files and normalize
* text=auto

# Force LF line endings for scripts and configs
# (Docker containers run Linux - CRLF will break things)
*.sh text eol=lf
*.bash text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
Dockerfile text eol=lf
.dockerignore text eol=lf
*.json text eol=lf
*.js text eol=lf
*.md text eol=lf
*.css text eol=lf
*.html text eol=lf

# Binary files (don't modify)
*.png binary
*.jpg binary
*.gif binary
*.ico binary
```

### 5.6 First Commit and Push

```bash
# Create the .gitattributes file
# (use your editor to create the file with content from 5.5)

# Update .gitignore with content from 5.4

# Stage all changes
git add .

# Commit
git commit -m "chore: initialize project with gitignore and gitattributes"

# Push to GitHub
git push origin main

# Verify on GitHub: refresh your repo page, you should see the new files
```

### 5.7 Set Up Branch Protection (Important for CI/CD)

On GitHub, go to: **Settings > Branches > Add rule**

| Setting                               | Value                  |
| ------------------------------------- | ---------------------- |
| Branch name pattern                   | `main`                 |
| Require a pull request before merging | ✅ Checked             |
| Require status checks to pass         | ✅ Checked (add later) |
| Require branches to be up to date     | ✅ Checked             |
| Include administrators                | ✅ Checked             |

> **GOTCHA: Branch Protection & Solo Development**
>
> - If you're the sole developer, branch protection means you CANNOT push
>   directly to `main` — you must use Pull Requests
> - This is intentional! It forces every change through the CI pipeline
> - Create feature branches for all changes: `git checkout -b feature/my-change`
> - If you accidentally commit to main locally, use:
>   ```bash
>   git stash
>   git checkout -b feature/accidental-commit
>   git stash pop
>   git commit -am "fix: moved commit to feature branch"
>   ```

### 5.8 Git Workflow Quick Reference

```
  DEVELOPER WORKFLOW (Day-to-Day)
  ================================

  1. Create feature branch
     $ git checkout -b feature/add-header

  2. Make changes, test locally
     $ npm test
     $ docker build -t myapp .
     $ docker run -p 3000:3000 myapp

  3. Commit with conventional message
     $ git add .
     $ git commit -m "feat: add responsive header component"

  4. Push feature branch
     $ git push origin feature/add-header

  5. Create Pull Request on GitHub
     -> CI pipeline runs automatically
     -> Tests must pass
     -> Review code

  6. Merge PR to main
     -> CD pipeline deploys to cloud
     -> Application updated automatically

  COMMIT MESSAGE CONVENTION:
  +----------+----------------------------------------+
  | Prefix   | Use for                                |
  +----------+----------------------------------------+
  | feat:    | New feature                            |
  | fix:     | Bug fix                                |
  | docs:    | Documentation only                     |
  | style:   | Formatting (no code change)            |
  | refactor:| Code restructuring                     |
  | test:    | Adding/fixing tests                    |
  | chore:   | Maintenance (deps, configs)            |
  | ci:      | CI/CD pipeline changes                 |
  +----------+----------------------------------------+
```

---

<!-- BATCH 2 END -->

---

## 6. Phase 2 — Sample Web Application (Node.js + Express)

### 6.1 Why Node.js + Express?

```
  TECH CHOICE RATIONALE
  ======================

  +------------------+----------------------------------------------------+
  | Criterion        | Why Node.js + Express                              |
  +------------------+----------------------------------------------------+
  | Lightweight      | Small footprint, fast startup (ideal for containers)|
  | Ecosystem        | npm has 2M+ packages, pre-built middleware          |
  | JSON native      | JavaScript = JSON (perfect for REST APIs)           |
  | Single language  | Same JS for frontend + backend                     |
  | Docker-friendly  | Official Docker images, small Alpine variants      |
  | CI/CD fast       | npm install + test runs in <2 minutes              |
  +------------------+----------------------------------------------------+
```

### 6.2 Initialize the Node.js Project

```bash
# Make sure you're in the project root
cd automated-cicd-webapp

# Initialize package.json
npm init -y

# Install production dependencies
npm install express dotenv

# Install development dependencies
npm install --save-dev jest supertest eslint nodemon
```

> **GOTCHA: package-lock.json**
>
> - `package-lock.json` locks exact dependency versions for reproducible builds
> - ALWAYS commit `package-lock.json` to Git (remove from `.gitignore` if present)
> - In CI, use `npm ci` instead of `npm install` — it's faster and uses lockfile exactly
> - `npm install` can UPDATE lockfile; `npm ci` uses it as-is (reproducible!)

### 6.3 Update package.json

Edit `package.json` to add scripts and configuration:

```json
{
  "name": "automated-cicd-webapp",
  "version": "1.0.0",
  "description": "Automated CI/CD Pipeline for Web Application Deployment",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --coverage --forceExit --detectOpenHandles",
    "test:watch": "jest --watch",
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix"
  },
  "keywords": ["cicd", "docker", "devops", "express"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  }
}
```

### 6.4 Create the Application Files

#### `src/app.js` — Main Application Entry Point

```javascript
// src/app.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
const indexRoutes = require("./routes/index");
const healthRoutes = require("./routes/health");

app.use("/", indexRoutes);
app.use("/health", healthRoutes);

// Error handling middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`
    ========================================
      Server running in ${NODE_ENV} mode
      URL: http://localhost:${PORT}
      Health: http://localhost:${PORT}/health
    ========================================
    `);
  });
}

// Export for testing
module.exports = app;
```

#### `src/routes/index.js` — Main Routes

```javascript
// src/routes/index.js
const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// Home page
router.get("/", homeController.getHome);

// API info endpoint
router.get("/api/info", homeController.getInfo);

module.exports = router;
```

#### `src/routes/health.js` — Health Check Endpoint

```javascript
// src/routes/health.js
const express = require("express");
const router = express.Router();

// Health check - used by CI/CD pipeline to verify deployment
router.get("/", (req, res) => {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: require("../../package.json").version,
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
  };

  res.status(200).json(healthCheck);
});

module.exports = router;
```

> **GOTCHA: Why a Health Check Endpoint Matters**
>
> - CI/CD pipelines use health checks to verify deployment succeeded
> - Load balancers (ALB/ELB) route traffic only to healthy instances
> - Docker HEALTHCHECK instruction uses this endpoint
> - Always return a **200 status code** with a JSON body
> - Include `version` field so you can verify which version is deployed
> - Keep the endpoint lightweight — no database calls, no heavy computation

#### `src/controllers/homeController.js` — Business Logic

```javascript
// src/controllers/homeController.js

const getHome = (req, res) => {
  res.json({
    message: "Welcome to the Automated CI/CD Web Application!",
    documentation: "/api/info",
    health: "/health",
    version: require("../../package.json").version,
  });
};

const getInfo = (req, res) => {
  res.json({
    application: "Automated CI/CD Web Application",
    version: require("../../package.json").version,
    description:
      "A demonstration of automated CI/CD pipeline for web deployment",
    technology: {
      runtime: "Node.js",
      framework: "Express.js",
      containerization: "Docker",
      ci_cd: "GitHub Actions",
      deployment: "AWS EC2",
    },
    endpoints: [
      { method: "GET", path: "/", description: "Home page" },
      { method: "GET", path: "/api/info", description: "Application info" },
      { method: "GET", path: "/health", description: "Health check" },
    ],
  });
};

module.exports = { getHome, getInfo };
```

#### `src/middleware/errorHandler.js` — Error Handling

```javascript
// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;

  res.status(statusCode).json({
    error: {
      message: message,
      status: statusCode,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = errorHandler;
```

#### `public/index.html` — Static Frontend

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CI/CD Web Application</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <header>
        <h1>Automated CI/CD Web Application</h1>
        <p class="subtitle">Deployed via GitHub Actions + Docker + AWS</p>
      </header>

      <main>
        <section class="status-card">
          <h2>Deployment Status</h2>
          <div id="health-status">Loading...</div>
        </section>

        <section class="info-card">
          <h2>Pipeline Info</h2>
          <ul>
            <li><strong>Source Control:</strong> GitHub</li>
            <li><strong>CI/CD Engine:</strong> GitHub Actions</li>
            <li><strong>Container:</strong> Docker</li>
            <li><strong>Registry:</strong> Docker Hub</li>
            <li><strong>Deployment:</strong> AWS EC2</li>
          </ul>
        </section>

        <section class="endpoints-card">
          <h2>API Endpoints</h2>
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GET</td>
                <td>/</td>
                <td>Home (this page)</td>
              </tr>
              <tr>
                <td>GET</td>
                <td>/api/info</td>
                <td>Application info</td>
              </tr>
              <tr>
                <td>GET</td>
                <td>/health</td>
                <td>Health check</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <footer>
        <p>Automated CI/CD Pipeline Project &copy; 2026</p>
      </footer>
    </div>

    <script>
      // Fetch health status on load
      fetch("/health")
        .then((res) => res.json())
        .then((data) => {
          document.getElementById("health-status").innerHTML = `
          <p class="status-ok">&#10003; ${data.status.toUpperCase()}</p>
          <p>Version: ${data.version}</p>
          <p>Environment: ${data.environment}</p>
          <p>Uptime: ${Math.floor(data.uptime)}s</p>
        `;
        })
        .catch((err) => {
          document.getElementById("health-status").innerHTML =
            '<p class="status-error">&#10007; Unable to reach health endpoint</p>';
        });
    </script>
  </body>
</html>
```

#### `public/styles.css` — Stylesheet

```css
/* public/styles.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #0d1117;
  color: #c9d1d9;
  line-height: 1.6;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: #161b22;
  border-radius: 8px;
  border: 1px solid #30363d;
}

h1 {
  color: #58a6ff;
  margin-bottom: 0.5rem;
}
.subtitle {
  color: #8b949e;
  font-size: 1.1rem;
}

h2 {
  color: #58a6ff;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

section {
  background: #161b22;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #30363d;
}

ul {
  list-style: none;
}
li {
  padding: 0.3rem 0;
}
li strong {
  color: #58a6ff;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #30363d;
}
th {
  color: #58a6ff;
}

.status-ok {
  color: #3fb950;
  font-size: 1.3rem;
  font-weight: bold;
}
.status-error {
  color: #f85149;
  font-size: 1.3rem;
  font-weight: bold;
}

footer {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  color: #8b949e;
}
```

#### `.env.example` — Environment Variable Template

```bash
# .env.example
# Copy this file to .env and fill in your values
# NEVER commit .env to git!

PORT=3000
NODE_ENV=development
```

#### `.eslintrc.json` — Linting Configuration

```json
{
  "env": {
    "node": true,
    "jest": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2]
  }
}
```

### 6.5 Test the Application Locally

```bash
# Create .env from template
copy .env.example .env

# Install dependencies
npm install

# Start in development mode (with auto-reload)
npm run dev

# In another terminal, test the endpoints:
curl http://localhost:3000/
curl http://localhost:3000/api/info
curl http://localhost:3000/health

# Or open http://localhost:3000 in your browser

# Stop the server: Ctrl+C
```

### 6.6 Commit the Application Code

```bash
git add .
git commit -m "feat: add Express.js web application with health check"
git push origin main
```

---

## 7. Phase 3 — Containerization with Docker

### 7.1 Docker Mental Model

```
  HOW DOCKER WORKS - MENTAL MODEL
  =================================

  Your Code + Dependencies + Runtime = REPRODUCIBLE Environment

  WITHOUT Docker:                     WITH Docker:
  +--------------------+              +--------------------+
  | Your Laptop        |              | Docker Container   |
  |                    |              |                    |
  | Node 20.11.0       |              | Node 20.11.0       |
  | npm 10.2.4         |              | npm 10.2.4         |
  | Windows 11         |              | Alpine Linux       |
  | 47 global packages |              | ONLY your deps     |
  | Random env vars    |              | Explicit env vars  |
  | Works here...      |              | Works EVERYWHERE   |
  +--------------------+              +--------------------+

  BUILD PROCESS:
  ==============

  Dockerfile (recipe)    docker build     Docker Image (blueprint)
  +------------------+   ==========>     +------------------+
  | FROM node:20     |                   | Layered FS       |
  | COPY package*    |                   | Layer 1: OS      |
  | RUN npm ci       |                   | Layer 2: Node    |
  | COPY src/        |                   | Layer 3: deps    |
  | CMD ["node"...]  |                   | Layer 4: code    |
  +------------------+                   +------------------+
                                                 |
                                           docker run
                                                 |
                                                 v
                                         +------------------+
                                         | Container        |
                                         | (running process)|
                                         | Port 3000        |
                                         +------------------+

  KEY CONCEPTS:
  +------------------+----------------------------------------------+
  | Image            | Read-only template (like a class)            |
  | Container        | Running instance of an image (like an object)|
  | Dockerfile       | Build instructions (like a recipe)           |
  | Layer            | A cached step in the build (reused if same)  |
  | Registry         | Storage for images (Docker Hub, ECR)         |
  | Tag              | Version label for an image (e.g., v1.0.0)    |
  +------------------+----------------------------------------------+
```

### 7.2 Create the Dockerfile

```dockerfile
# Dockerfile
# Multi-stage build for production-optimized image

# ============================================
# Stage 1: Build / Install Dependencies
# ============================================
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests FIRST (layer caching optimization)
COPY package.json package-lock.json ./

# Install production dependencies only
# npm ci = clean install (uses lockfile exactly, faster, reproducible)
RUN npm ci --only=production

# ============================================
# Stage 2: Production Image
# ============================================
FROM node:20-alpine AS production

# Add labels for metadata
LABEL maintainer="Your Name <your.email@example.com>"
LABEL description="Automated CI/CD Web Application"
LABEL version="1.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY package.json ./
COPY src/ ./src/
COPY public/ ./public/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Expose the application port (documentation only)
EXPOSE 3000

# Health check - Docker will ping this every 30s
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/app.js"]
```

> **GOTCHA: Dockerfile Best Practices (Critical for CI/CD)**
>
> 1. **Layer Caching:** Copy `package.json` and `package-lock.json` BEFORE copying source code.
>    Dependencies change less often than code. Docker caches unchanged layers, so if only
>    your code changed, it skips `npm ci` (saves 30-60 seconds per build).
> 2. **Multi-stage Build:** The `builder` stage installs dependencies, the `production` stage
>    copies only what's needed. This keeps the final image small (no build tools, no dev deps).
> 3. **Alpine Linux:** `node:20-alpine` is ~50MB vs `node:20` at ~350MB.
>    Smaller images = faster pull/push = faster deployments.
>    BUT: Alpine uses `musl` instead of `glibc` — some npm packages with C bindings
>    may fail. If you hit issues, switch to `node:20-slim`.
> 4. **Non-root User:** NEVER run containers as root in production.
>    A container escape vulnerability + root = full host compromise.
> 5. **HEALTHCHECK:** Docker uses this to monitor container health.
>    We use `wget` because Alpine doesn't have `curl` by default.
> 6. **EXPOSE vs -p:** `EXPOSE 3000` is only documentation.
>    You still need `-p 80:3000` in `docker run` to map ports.

### 7.3 Create .dockerignore

```bash
# .dockerignore
# Files/folders excluded from the Docker build context
# This makes docker build faster and images smaller

node_modules
npm-debug.log*
.git
.gitignore
.github
.env
.env.*
docker-compose*.yml
Dockerfile
.dockerignore
README.md
WALKTHROUGH.md
tests/
coverage/
.eslintrc.json
.vscode
*.md
```

> **GOTCHA: .dockerignore is Critical for Performance**
>
> - Without `.dockerignore`, Docker sends the ENTIRE directory as "build context"
> - `node_modules/` alone can be 200MB+ — this is sent on EVERY build
> - `.git/` directory can be huge in mature repos
> - Always exclude `tests/` from production images (security + size)
> - Forgetting `.dockerignore` is the #1 reason for slow Docker builds

### 7.4 Create docker-compose.yml (Local Development)

```yaml
# docker-compose.yml
# Used for LOCAL development only (not for production deployment)

version: "3.8"

services:
  webapp:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: cicd-webapp
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/health",
        ]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
```

### 7.5 Build and Test Docker Image Locally

```bash
# Build the Docker image
docker build -t cicd-webapp:latest .

# Verify the image was created
docker images | findstr cicd-webapp
# Expected output:
# cicd-webapp   latest   abc123def456   10 seconds ago   ~125MB

# Run the container
docker run -d --name cicd-webapp -p 3000:3000 cicd-webapp:latest

# Check container is running
docker ps
# Should show cicd-webapp container with status "Up X seconds"

# Test the application
curl http://localhost:3000/
curl http://localhost:3000/health

# View container logs
docker logs cicd-webapp

# Check container health status
docker inspect --format='{{.State.Health.Status}}' cicd-webapp
# Expected: healthy (wait 30s after starting)

# Stop and remove the container
docker stop cicd-webapp
docker rm cicd-webapp
```

```
  DOCKER COMMANDS CHEAT SHEET
  ============================

  BUILD & RUN:
  docker build -t name:tag .          Build image from Dockerfile
  docker run -d -p 80:3000 name:tag   Run container in background
  docker run -it name:tag /bin/sh     Open shell inside container

  INSPECT:
  docker ps                            List running containers
  docker ps -a                         List ALL containers (incl. stopped)
  docker images                        List local images
  docker logs <container>              View container output
  docker inspect <container>           Full container details

  CLEANUP:
  docker stop <container>              Stop running container
  docker rm <container>                Remove stopped container
  docker rmi <image>                   Remove image
  docker system prune -af              Remove ALL unused resources (CAREFUL!)

  TROUBLESHOOT:
  docker exec -it <container> /bin/sh  Open shell in running container
  docker logs -f <container>           Follow logs (tail -f equivalent)
  docker stats                         Live resource usage
```

### 7.6 Using Docker Compose

```bash
# Build and start with docker-compose
docker compose up --build

# Run in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Rebuild without cache (if you change Dockerfile)
docker compose build --no-cache
docker compose up -d
```

### 7.7 Commit Docker Configuration

```bash
git add Dockerfile .dockerignore docker-compose.yml
git commit -m "feat: add Docker containerization with multi-stage build"
git push origin main
```

---

<!-- BATCH 3 END -->

---

## 8. Phase 4 — CI Pipeline with GitHub Actions

### 8.1 GitHub Actions Mental Model

```
  GITHUB ACTIONS - CONCEPTUAL MODEL
  ===================================

  A WORKFLOW is a configurable automated process.

  +-- WORKFLOW (.github/workflows/ci-cd.yml) -----+
  |                                                 |
  |  Triggered by: push, pull_request, schedule     |
  |                                                 |
  |  +-- JOB: build-and-test -------------------+  |
  |  |   Runs on: ubuntu-latest                 |  |
  |  |                                          |  |
  |  |   +-- STEP 1: Checkout code           +  |  |
  |  |   +-- STEP 2: Setup Node.js           +  |  |
  |  |   +-- STEP 3: Install dependencies    +  |  |
  |  |   +-- STEP 4: Run linter              +  |  |
  |  |   +-- STEP 5: Run tests               +  |  |
  |  +------------------------------------------+  |
  |           | (on success)                        |
  |           v                                     |
  |  +-- JOB: build-and-push-docker ------------+  |
  |  |   Runs on: ubuntu-latest                 |  |
  |  |   Needs: build-and-test                  |  |
  |  |                                          |  |
  |  |   +-- STEP 1: Checkout code           +  |  |
  |  |   +-- STEP 2: Login to Docker Hub     +  |  |
  |  |   +-- STEP 3: Build Docker image      +  |  |
  |  |   +-- STEP 4: Push image to registry  +  |  |
  |  +------------------------------------------+  |
  |           | (on success)                        |
  |           v                                     |
  |  +-- JOB: deploy-to-ec2 --------------------+  |
  |  |   Runs on: ubuntu-latest                 |  |
  |  |   Needs: build-and-push-docker           |  |
  |  |                                          |  |
  |  |   +-- STEP 1: SSH to EC2              +  |  |
  |  |   +-- STEP 2: Pull new image          +  |  |
  |  |   +-- STEP 3: Stop old container      +  |  |
  |  |   +-- STEP 4: Run new container       +  |  |
  |  |   +-- STEP 5: Health check            +  |  |
  |  +------------------------------------------+  |
  +------------------------------------------------+

  JOB DEPENDENCY GRAPH:
  =====================

  build-and-test -------> build-and-push-docker -------> deploy-to-ec2
       (CI)                    (Package)                     (CD)

  If ANY step fails, the pipeline STOPS.
  Subsequent jobs that depend on it are SKIPPED.
```

### 8.2 Configure GitHub Secrets

Before creating the workflow, set up secrets in your GitHub repository.

**Navigate to:** Repository > Settings > Secrets and variables > Actions > New repository secret

Add these secrets:

| Secret Name           | Value                                   | Purpose      |
| --------------------- | --------------------------------------- | ------------ |
| `DOCKERHUB_USERNAME`  | Your Docker Hub username                | Docker login |
| `DOCKERHUB_TOKEN`     | Docker Hub Access Token (not password!) | Docker login |
| `EC2_SSH_PRIVATE_KEY` | Contents of your SSH private key file   | SSH into EC2 |
| `EC2_HOST`            | EC2 public IP or DNS                    | SSH target   |
| `EC2_USER`            | `ec2-user` (Amazon Linux) or `ubuntu`   | SSH username |

> **Create Docker Hub Access Token:**
>
> 1. Go to https://hub.docker.com/settings/security
> 2. Click "New Access Token"
> 3. Name: `github-actions-cicd`
> 4. Permissions: Read & Write
> 5. Copy the token immediately (shown only once!)

> **GOTCHA: GitHub Secrets**
>
> - Secrets are NOT available in pull requests from forks (security measure)
> - Secret names are case-sensitive
> - Secrets cannot be viewed after creation — only updated or deleted
> - If a secret value is accidentally printed in logs, GitHub masks it with `***`
> - Use **Environment secrets** for production (requires approval before deploy)
> - Maximum secret size: 48KB (for SSH keys, this is usually fine)

### 8.3 Create the CI/CD Workflow File

```bash
# Create the directory structure
mkdir -p .github/workflows
```

Create the file `.github/workflows/ci-cd.yml`:

```yaml
# .github/workflows/ci-cd.yml
# Automated CI/CD Pipeline for Web Application Deployment

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
  DOCKER_IMAGE: ${{ secrets.DOCKERHUB_USERNAME }}/cicd-webapp
  NODE_VERSION: "20"

# ============================================
# JOBS: The work units of the pipeline
# ============================================
jobs:
  # ------------------------------------------
  # JOB 1: Build, Lint, and Test
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
          cache: "npm" # Cache npm dependencies for faster builds

      # Step 3: Install dependencies
      - name: Install dependencies
        run: npm ci
        # npm ci = clean install from lockfile (faster, deterministic)

      # Step 4: Run linter
      - name: Run ESLint
        run: npm run lint

      # Step 5: Run tests with coverage
      - name: Run tests
        run: npm test

      # Step 6: Upload test coverage as artifact
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always() # Upload even if tests fail
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  # ------------------------------------------
  # JOB 2: Build and Push Docker Image
  # ------------------------------------------
  build-and-push-docker:
    name: Docker Build & Push
    runs-on: ubuntu-latest
    needs: build-and-test # Only run if tests pass

    # Only build Docker image on push to main (not on PRs)
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      # Step 1: Check out code
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Set up Docker Buildx (advanced builder)
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Step 3: Login to Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

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

      # Step 5: Build and push Docker image
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha # Use GitHub Actions cache
          cache-to: type=gha,mode=max

      # Step 6: Verify the pushed image
      - name: Verify image
        run: |
          echo "Image pushed successfully!"
          echo "Tags: ${{ steps.meta.outputs.tags }}"

  # ------------------------------------------
  # JOB 3: Deploy to AWS EC2
  # ------------------------------------------
  deploy-to-ec2:
    name: Deploy to EC2
    runs-on: ubuntu-latest
    needs: build-and-push-docker # Only deploy if image was pushed

    # Only deploy on push to main
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      # Step 1: Deploy via SSH
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_PRIVATE_KEY }}
          script: |
            echo "=== Deployment Started ==="
            echo "Timestamp: $(date)"

            # Login to Docker Hub
            echo ${{ secrets.DOCKERHUB_TOKEN }} | docker login -u ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin

            # Pull the latest image
            docker pull ${{ env.DOCKER_IMAGE }}:latest

            # Stop and remove old container (ignore error if not exists)
            docker stop cicd-webapp 2>/dev/null || true
            docker rm cicd-webapp 2>/dev/null || true

            # Run new container
            docker run -d \
              --name cicd-webapp \
              --restart unless-stopped \
              -p 80:3000 \
              -e NODE_ENV=production \
              ${{ env.DOCKER_IMAGE }}:latest

            # Wait for container to be healthy
            echo "Waiting for health check..."
            sleep 10

            # Verify deployment
            if curl -f http://localhost/health; then
              echo ""
              echo "=== Deployment Successful ==="
            else
              echo "=== DEPLOYMENT FAILED - Health check failed ==="
              docker logs cicd-webapp
              exit 1
            fi

            # Cleanup old images (keep last 3)
            docker image prune -af --filter "until=72h"

            echo "=== Deployment Complete ==="

      # Step 2: Verify deployment from runner
      - name: Verify deployment externally
        run: |
          echo "Waiting for deployment to stabilize..."
          sleep 15
          echo "Checking health endpoint..."
          curl -f http://${{ secrets.EC2_HOST }}/health || echo "External check failed (may need security group update)"
```

### 8.4 Workflow YAML Explained

```
  YAML STRUCTURE BREAKDOWN
  =========================

  on:                    <-- WHEN does the pipeline trigger?
    push:                <-- On git push events
      branches: [main]   <-- Only for the main branch

  jobs:                  <-- WHAT work to perform?
    job-name:            <-- Unique job identifier
      runs-on:           <-- WHERE to run (runner type)
      needs:             <-- Dependencies (wait for other jobs)
      if:                <-- Conditional execution
      steps:             <-- Sequential steps within the job
        - name:          <-- Human-readable step name
          uses:          <-- Pre-built action to use
          run:           <-- Shell command to execute
          with:          <-- Input parameters for the action
          env:           <-- Environment variables for the step

  EXECUTION FLOW:
  ===============

  push to main
       |
       v
  +----------------+     PASS     +------------------+    PASS    +-----------+
  | build-and-test |------------>| build-push-docker |---------->| deploy-ec2|
  +----------------+              +------------------+            +-----------+
       |                               |                              |
       | FAIL                          | FAIL                         | FAIL
       v                               v                              v
    [Pipeline stops]            [Pipeline stops]              [Pipeline stops]
    [PR cannot merge]           [No image pushed]             [Rollback needed]
```

> **GOTCHA: GitHub Actions Common Pitfalls**
>
> 1. **YAML Indentation:** YAML uses spaces, NOT tabs. 2 spaces per level.
>    A single wrong indent = pipeline fails with cryptic YAML parse error.
>    Use a YAML validator: https://www.yamllint.com/
> 2. **`npm ci` vs `npm install`:**
>    - `npm ci` deletes `node_modules/` and installs from lockfile exactly
>    - `npm install` may update lockfile, causing non-deterministic builds
>    - ALWAYS use `npm ci` in CI pipelines
> 3. **Caching:** The `actions/setup-node@v4` with `cache: 'npm'` caches the
>    npm global cache (~/.npm), NOT node_modules. This saves download time
>    but still runs `npm ci` every time. This is correct behavior.
> 4. **`if:` conditions:** The deploy jobs have `if: github.event_name == 'push'`
>    to prevent deploying on PR checks. PRs should only run tests.
> 5. **Secret masking edge case:** If you echo a JSON object containing a secret,
>    GitHub may NOT mask it correctly. Never log structured data from secrets.
> 6. **Runner limits:**
>    - Public repos: Unlimited minutes
>    - Private repos: 2,000 min/month free
>    - Each job has a 6-hour timeout
>    - Artifacts are stored for 90 days (configurable)
> 7. **Concurrency:** By default, multiple pushes trigger multiple pipeline runs.
>    Add concurrency control to avoid deploying outdated code:
>    ```yaml
>    concurrency:
>      group: deploy-${{ github.ref }}
>      cancel-in-progress: true
>    ```

### 8.5 Test the CI Pipeline

```bash
# Create a feature branch
git checkout -b feature/add-ci-pipeline

# Add the workflow file
git add .github/workflows/ci-cd.yml
git commit -m "ci: add GitHub Actions CI/CD pipeline"
git push origin feature/add-ci-pipeline

# Go to GitHub and create a Pull Request
# Watch the "Checks" tab - the CI pipeline will run automatically

# After PR tests pass, merge to main
# The full pipeline (CI + Docker build + Deploy) will run
```

### 8.6 Monitor Pipeline Execution

```
  WHERE TO MONITOR:
  =================

  GitHub > Your Repo > Actions tab

  +---------------------------------------------------+
  | CI/CD Pipeline                                     |
  | Run #12  -  main  -  feat: add header              |
  +---------------------------------------------------+
  |                                                     |
  |  [✓] Build & Test ............... 1m 23s            |
  |    [✓] Checkout code ............ 3s                |
  |    [✓] Setup Node.js ........... 5s                 |
  |    [✓] Install dependencies .... 28s                |
  |    [✓] Run ESLint .............. 4s                 |
  |    [✓] Run tests ............... 12s                |
  |    [✓] Upload coverage ......... 2s                 |
  |                                                     |
  |  [✓] Docker Build & Push ........ 2m 45s            |
  |    [✓] Checkout code ............ 2s                |
  |    [✓] Set up Docker Buildx .... 4s                 |
  |    [✓] Login to Docker Hub ..... 1s                 |
  |    [✓] Extract metadata ........ 1s                 |
  |    [✓] Build and push .......... 2m 31s             |
  |    [✓] Verify image ............ 1s                 |
  |                                                     |
  |  [✓] Deploy to EC2 .............. 0m 35s            |
  |    [✓] Deploy via SSH .......... 28s                |
  |    [✓] Verify deployment ....... 7s                 |
  |                                                     |
  +---------------------------------------------------+
```

---

<!-- BATCH 4 END -->

---

## 9. Phase 5 — Automated Testing

### 9.1 Testing Pyramid in CI/CD

```
  THE TESTING PYRAMID
  ====================

                    /\
                   /  \           End-to-End Tests
                  / E2E\          (Slow, Expensive, Few)
                 /------\         Selenium, Cypress
                /        \
               / Integr-  \      Integration Tests
              /   ation    \     (Medium speed, Some)
             /--------------\    API tests, DB tests
            /                \
           /   Unit Tests     \  Unit Tests
          /                    \ (Fast, Cheap, Many)
         /______________________\ Jest, Mocha

  FOR THIS PROJECT:
  ==================

  +-- Unit Tests (Jest + Supertest) ----+  <-- We implement these
  |  - Test individual routes           |
  |  - Test controller logic            |
  |  - Test health endpoint             |
  |  - Test error handling              |
  |  - Run in CI on every push/PR       |
  +-------------------------------------+
  |
  |  FAST (~5-15 seconds)
  |  HIGH confidence for code changes
  |  LOW infrastructure requirements
```

### 9.2 Create Test Files

#### `tests/app.test.js` — Main Application Tests

```javascript
// tests/app.test.js
const request = require("supertest");
const app = require("../src/app");

describe("Application Routes", () => {
  // ---- Home Route Tests ----
  describe("GET /", () => {
    it("should return 200 status code", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
    });

    it("should return JSON content type", async () => {
      const res = await request(app).get("/");
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    it("should contain welcome message", async () => {
      const res = await request(app).get("/");
      expect(res.body.message).toContain("Welcome");
    });

    it("should include version information", async () => {
      const res = await request(app).get("/");
      expect(res.body).toHaveProperty("version");
    });
  });

  // ---- API Info Route Tests ----
  describe("GET /api/info", () => {
    it("should return 200 status code", async () => {
      const res = await request(app).get("/api/info");
      expect(res.statusCode).toBe(200);
    });

    it("should return application information", async () => {
      const res = await request(app).get("/api/info");
      expect(res.body).toHaveProperty("application");
      expect(res.body).toHaveProperty("version");
      expect(res.body).toHaveProperty("technology");
      expect(res.body).toHaveProperty("endpoints");
    });

    it("should list technology stack", async () => {
      const res = await request(app).get("/api/info");
      expect(res.body.technology).toHaveProperty("runtime");
      expect(res.body.technology).toHaveProperty("framework");
      expect(res.body.technology).toHaveProperty("containerization");
    });

    it("should list available endpoints", async () => {
      const res = await request(app).get("/api/info");
      expect(Array.isArray(res.body.endpoints)).toBe(true);
      expect(res.body.endpoints.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ---- Health Check Route Tests ----
  describe("GET /health", () => {
    it("should return 200 status code", async () => {
      const res = await request(app).get("/health");
      expect(res.statusCode).toBe(200);
    });

    it("should return healthy status", async () => {
      const res = await request(app).get("/health");
      expect(res.body.status).toBe("healthy");
    });

    it("should include timestamp", async () => {
      const res = await request(app).get("/health");
      expect(res.body).toHaveProperty("timestamp");
      // Verify it's a valid ISO date
      expect(new Date(res.body.timestamp).toISOString()).toBe(
        res.body.timestamp,
      );
    });

    it("should include uptime", async () => {
      const res = await request(app).get("/health");
      expect(res.body).toHaveProperty("uptime");
      expect(typeof res.body.uptime).toBe("number");
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include version", async () => {
      const res = await request(app).get("/health");
      expect(res.body).toHaveProperty("version");
    });

    it("should include memory usage", async () => {
      const res = await request(app).get("/health");
      expect(res.body).toHaveProperty("memoryUsage");
      expect(res.body.memoryUsage).toHaveProperty("rss");
      expect(res.body.memoryUsage).toHaveProperty("heapUsed");
    });
  });

  // ---- 404 Route Tests ----
  describe("GET /nonexistent", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/this-route-does-not-exist");
      expect(res.statusCode).toBe(404);
    });
  });

  // ---- Static Files ----
  describe("Static Files", () => {
    it("should serve index.html", async () => {
      const res = await request(app).get("/index.html");
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/html/);
    });

    it("should serve styles.css", async () => {
      const res = await request(app).get("/styles.css");
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/css/);
    });
  });
});
```

> **GOTCHA: Testing with Supertest**
>
> - `supertest` spins up the Express app on a random port for each test
> - This is why we `module.exports = app` in app.js instead of calling `app.listen()` in test mode
> - The `NODE_ENV=test` check prevents the server from binding to a port during tests
> - `--forceExit` flag in Jest prevents tests from hanging (open handles)
> - `--detectOpenHandles` helps debug which handles are keeping Jest alive
> - If tests hang, it's usually because a database connection or HTTP server isn't closed

### 9.3 Run Tests Locally

```bash
# Run tests
npm test

# Expected output:
#  PASS  tests/app.test.js
#   Application Routes
#     GET /
#       ✓ should return 200 status code (45 ms)
#       ✓ should return JSON content type (8 ms)
#       ✓ should contain welcome message (7 ms)
#       ✓ should include version information (6 ms)
#     GET /api/info
#       ✓ should return 200 status code (6 ms)
#       ✓ should return application information (5 ms)
#       ...
#     GET /health
#       ✓ should return 200 status code (5 ms)
#       ✓ should return healthy status (5 ms)
#       ...
#
#  Test Suites: 1 passed, 1 total
#  Tests:       12 passed, 12 total
#  Coverage:    85% Statements, 90% Branches

# Run with watch mode (for development)
npm run test:watch
```

### 9.4 Code Coverage Report

```
  TEST COVERAGE OUTPUT
  =====================

  ------------|---------|----------|---------|---------|-------------------
  File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
  ------------|---------|----------|---------|---------|-------------------
  All files   |   88.23 |    66.67 |     100 |   88.23 |
   src        |         |          |         |         |
    app.js    |   92.31 |      100 |     100 |   92.31 | 35-38
   src/ctrl   |         |          |         |         |
    homeCt... |     100 |      100 |     100 |     100 |
   src/routes |         |          |         |         |
    health.js |     100 |      100 |     100 |     100 |
    index.js  |     100 |      100 |     100 |     100 |
   src/middle |         |          |         |         |
    errorH... |      60 |       50 |     100 |      60 | 4-5
  ------------|---------|----------|---------|---------|-------------------

  WHAT THESE METRICS MEAN:
  +-------------+---------------------------------------------+
  | Metric      | Meaning                                     |
  +-------------+---------------------------------------------+
  | % Stmts     | Percentage of code statements executed      |
  | % Branch    | Percentage of if/else branches taken        |
  | % Funcs     | Percentage of functions called              |
  | % Lines     | Percentage of lines executed                |
  +-------------+---------------------------------------------+

  AIM FOR: >80% coverage as a CI quality gate
```

### 9.5 Commit Tests

```bash
git add tests/
git commit -m "test: add comprehensive unit tests with Jest and Supertest"
git push origin main
```

---

## 10. Phase 6 — Container Registry (Docker Hub)

### 10.1 Container Registry Mental Model

```
  CONTAINER REGISTRY - MENTAL MODEL
  ===================================

  Think of it as "GitHub for Docker Images"

  +--------------------+      docker push      +--------------------+
  |  Local Machine     |--------------------->|  Docker Hub         |
  |  (or CI Runner)    |                       |  (Registry)         |
  |                    |      docker pull      |                    |
  |  docker build -t   |<---------------------|  Stores images     |
  |  user/app:v1.0     |                       |  by name:tag       |
  +--------------------+                       +--------------------+

  IMAGE NAMING CONVENTION:
  ========================

  registry / username / repository : tag
  -------- / -------- / ---------- : ---
  (default)  (your     (image       (version)
  docker.io   Docker    name)
              Hub
              user)

  EXAMPLES:
  docker.io/johndoe/cicd-webapp:latest
  docker.io/johndoe/cicd-webapp:v1.0.0
  docker.io/johndoe/cicd-webapp:a1b2c3d    (git commit SHA)
  docker.io/johndoe/cicd-webapp:42          (build number)

  TAGGING STRATEGY FOR CI/CD:
  ============================

  Every build produces an image tagged with:
  +-------------------+----------------------------------------------+
  | Tag               | Purpose                                      |
  +-------------------+----------------------------------------------+
  | :latest           | Most recent build (mutable, overwritten)      |
  | :v1.2.3           | Semantic version (for releases)               |
  | :a1b2c3d          | Git commit SHA (immutable, traceable)         |
  | :42               | Build number (sequential, easy to reference)  |
  +-------------------+----------------------------------------------+
```

> **GOTCHA: The `:latest` Tag**
>
> - `:latest` does NOT mean "the most recent version" automatically
> - It's just a tag name — Docker doesn't sort or auto-update it
> - If you push `myapp:v2.0` without also pushing `myapp:latest`,
>   then `:latest` still points to the old image
> - In production, NEVER deploy `:latest` — use commit SHA or version tags
> - `:latest` is useful for development but dangerous for production
>   (you don't know WHAT version is running)

### 10.2 Set Up Docker Hub Repository

1. Go to **https://hub.docker.com**
2. Click **Create Repository**
3. Repository name: `cicd-webapp`
4. Description: `Automated CI/CD Web Application`
5. Visibility: **Public** (free, unlimited pulls)
6. Click **Create**

Your image will be accessible as: `YOUR_USERNAME/cicd-webapp`

### 10.3 Test Image Push Locally

```bash
# Login to Docker Hub
docker login
# Enter your Docker Hub username and access token (NOT password)

# Tag your local image for Docker Hub
docker tag cicd-webapp:latest YOUR_USERNAME/cicd-webapp:latest
docker tag cicd-webapp:latest YOUR_USERNAME/cicd-webapp:v1.0.0

# Push to Docker Hub
docker push YOUR_USERNAME/cicd-webapp:latest
docker push YOUR_USERNAME/cicd-webapp:v1.0.0

# Verify on Docker Hub: https://hub.docker.com/r/YOUR_USERNAME/cicd-webapp/tags
```

```
  IMAGE LIFECYCLE IN CI/CD
  =========================

  Developer pushes code
       |
       v
  CI builds Docker image         <--- Uses Dockerfile
       |
       v
  CI tags image                   <--- :latest, :sha, :build#
       |
       v
  CI pushes to Docker Hub         <--- docker push
       |
       v
  CD pulls from Docker Hub        <--- docker pull (on EC2)
       |
       v
  CD runs container               <--- docker run
       |
       v
  Old image pruned                <--- docker image prune (cleanup)
```

> **GOTCHA: Docker Hub Rate Limits**
>
> - Anonymous pulls: 100 pulls / 6 hours (per IP)
> - Authenticated pulls: 200 pulls / 6 hours
> - CI runners share IPs — you may hit limits on GitHub-hosted runners
> - **Fix:** Always authenticate with `docker login` in CI (we do this in our workflow)
> - For high-volume projects, consider **GitHub Container Registry** (ghcr.io) —
>   free and no rate limits for public repos

---

<!-- BATCH 5 END -->

---

## 11. Phase 7 — Cloud Deployment (AWS EC2)

### 11.1 AWS Architecture for This Project

```
  AWS INFRASTRUCTURE LAYOUT
  ==========================

  +======================================================+
  |  AWS Account (Free Tier)                              |
  |                                                       |
  |  Region: us-east-1 (N. Virginia)                      |
  |                                                       |
  |  +-- VPC (Default) ----------------------------+      |
  |  |                                              |      |
  |  |  +-- Subnet (Public) -------------------+   |      |
  |  |  |                                       |  |      |
  |  |  |  +-- EC2 Instance ---------------+   |  |      |     INTERNET
  |  |  |  |  Type: t2.micro (Free Tier)   |   |  |      |        |
  |  |  |  |  OS: Amazon Linux 2023        |   |  |      |        |
  |  |  |  |  Docker installed             |   |  |  +--------+   |
  |  |  |  |                               |   |  |  |Security|   |
  |  |  |  |  +-- Docker Container ----+   |   |  |  | Group  |<--+
  |  |  |  |  |  cicd-webapp:latest    |   |   |  |  |        |
  |  |  |  |  |  Port 3000 (internal)  |   |   |  |  | Inbound|
  |  |  |  |  +------------------------+   |   |  |  | :22 SSH|
  |  |  |  |                               |   |  |  | :80 HTTP
  |  |  |  |  Port 80 --> Port 3000        |   |  |  | :443HTTPS
  |  |  |  +-------------------------------+   |  |  +--------+
  |  |  |                                       |  |      |
  |  |  +-- Elastic IP (static) ---------------+  |      |
  |  |                                              |      |
  |  +----------------------------------------------+      |
  +========================================================+
```

### 11.2 Step-by-Step: Launch EC2 Instance

#### Step 1: Launch Instance via AWS Console

1. Go to **AWS Console > EC2 > Launch Instance**
2. Configure:

| Setting               | Value                         | Reason                           |
| --------------------- | ----------------------------- | -------------------------------- |
| Name                  | `cicd-webapp-server`          | Identification                   |
| AMI                   | Amazon Linux 2023             | Free tier eligible, Docker-ready |
| Instance Type         | t2.micro                      | Free tier (750 hrs/month)        |
| Key Pair              | Create new: `cicd-webapp-key` | SSH access                       |
| Network               | Default VPC                   | Simplicity                       |
| Auto-assign Public IP | Enable                        | Internet access                  |
| Storage               | 8 GB gp3                      | Free tier allows up to 30GB      |

#### Step 2: Configure Security Group

Create a new security group named `cicd-webapp-sg`:

| Type  | Protocol | Port Range | Source          | Purpose                |
| ----- | -------- | ---------- | --------------- | ---------------------- |
| SSH   | TCP      | 22         | My IP only      | Remote administration  |
| HTTP  | TCP      | 80         | 0.0.0.0/0 (All) | Web application access |
| HTTPS | TCP      | 443        | 0.0.0.0/0 (All) | Future SSL/TLS support |

> **GOTCHA: Security Groups**
>
> - NEVER open SSH (port 22) to `0.0.0.0/0` (all IPs) in production
> - Use "My IP" which auto-detects your current IP address
> - Your IP may change (ISP, VPN, mobile) — update the rule when it does
> - If you can't SSH after IP change, update the security group in AWS Console
> - For CI/CD SSH from GitHub Actions, you need to allow GitHub's IP ranges
>   OR use `0.0.0.0/0` for port 22 (acceptable for this project with key-based auth)
> - Better alternative: Use AWS Systems Manager Session Manager (no open ports needed)

#### Step 3: Download Key Pair

```bash
# The .pem file downloads automatically when you create the key pair
# Move it to a secure location
move %USERPROFILE%\Downloads\cicd-webapp-key.pem %USERPROFILE%\.ssh\

# Set correct permissions (PowerShell)
icacls "%USERPROFILE%\.ssh\cicd-webapp-key.pem" /inheritance:r /grant:r "%USERNAME%:R"
```

> **GOTCHA: SSH Key Permissions**
>
> - On Windows, SSH key permissions are managed via NTFS ACLs
> - If SSH says "WARNING: UNPROTECTED PRIVATE KEY FILE!", run the icacls command above
> - On Linux/Mac, use `chmod 400 cicd-webapp-key.pem`
> - The GitHub Actions secret `EC2_SSH_PRIVATE_KEY` stores the ENTIRE content
>   of the .pem file (including the BEGIN/END lines)

#### Step 4: Allocate Elastic IP (Optional but Recommended)

1. Go to **EC2 > Elastic IPs > Allocate Elastic IP address**
2. Click **Allocate**
3. Select the new EIP > **Actions > Associate Elastic IP address**
4. Choose your EC2 instance
5. Click **Associate**

> **GOTCHA: Elastic IP Billing**
>
> - Elastic IPs are FREE when associated with a RUNNING instance
> - An unassociated EIP costs $0.005/hour (~$3.60/month)
> - If you stop your EC2 instance, the EIP becomes unassociated and starts costing
> - Release the EIP if you're done with the project

### 11.3 Configure EC2 Instance

SSH into your instance and install Docker:

```bash
# SSH into EC2 (from your local machine)
ssh -i ~/.ssh/cicd-webapp-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# ============================================
# Run these commands ON THE EC2 INSTANCE
# ============================================

# Update system packages
sudo yum update -y

# Install Docker
sudo yum install -y docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker    # Auto-start on boot

# Add ec2-user to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker ec2-user

# IMPORTANT: Log out and log back in for group changes to take effect
exit

# SSH back in
ssh -i ~/.ssh/cicd-webapp-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Verify Docker works (without sudo)
docker --version
docker run hello-world

# Verify Docker is running
sudo systemctl status docker
```

```
  EC2 SETUP VERIFICATION CHECKLIST
  ==================================
  [x] EC2 instance running (t2.micro, Amazon Linux 2023)
  [x] Security Group: SSH(22) + HTTP(80) + HTTPS(443)
  [x] SSH access working with .pem key
  [x] Docker installed and running
  [x] ec2-user in docker group (no sudo needed)
  [x] Elastic IP associated (static address)
```

> **GOTCHA: EC2 Common Issues**
>
> 1. **"Connection timed out" on SSH:**
>    - Security group doesn't allow port 22 from your IP
>    - Instance is in a private subnet (needs public subnet)
>    - Instance is stopped
> 2. **"Permission denied (publickey)":**
>    - Wrong username (use `ec2-user` for Amazon Linux, `ubuntu` for Ubuntu)
>    - Wrong .pem file
>    - .pem file permissions too open
> 3. **Docker commands need sudo:**
>    - You forgot to log out and back in after `usermod`
>    - Run: `newgrp docker` as a quick fix (or just re-SSH)
> 4. **Free tier monitoring:**
>    - Set up a billing alert: AWS Console > Billing > Budgets
>    - Create a $5 budget with email notification
>    - Check "Free Tier Usage" dashboard monthly

### 11.4 Test Manual Deployment to EC2

Before automating, verify the deployment works manually:

```bash
# ON EC2 INSTANCE:

# Pull your image from Docker Hub
docker pull YOUR_DOCKERHUB_USERNAME/cicd-webapp:latest

# Run the container
docker run -d \
  --name cicd-webapp \
  --restart unless-stopped \
  -p 80:3000 \
  -e NODE_ENV=production \
  YOUR_DOCKERHUB_USERNAME/cicd-webapp:latest

# Verify it's running
docker ps

# Test locally on EC2
curl http://localhost/health

# Test from your browser
# Open: http://YOUR_EC2_PUBLIC_IP
# You should see the web application!
```

### 11.5 Create Deployment Script

Create `deploy.sh` for EC2 (used by the CI/CD pipeline):

```bash
#!/bin/bash
# deploy.sh - Deployment script for EC2
# This script is executed via SSH from GitHub Actions

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
IMAGE_NAME="${DOCKER_IMAGE:-your-username/cicd-webapp}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="cicd-webapp"
HOST_PORT=80
CONTAINER_PORT=3000

echo "========================================"
echo "  Deployment Started"
echo "  Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "  Time: $(date)"
echo "========================================"

# Step 1: Pull the latest image
echo "[1/5] Pulling latest image..."
docker pull "${IMAGE_NAME}:${IMAGE_TAG}"

# Step 2: Stop existing container (if running)
echo "[2/5] Stopping existing container..."
docker stop "${CONTAINER_NAME}" 2>/dev/null || echo "No container to stop"

# Step 3: Remove existing container
echo "[3/5] Removing old container..."
docker rm "${CONTAINER_NAME}" 2>/dev/null || echo "No container to remove"

# Step 4: Start new container
echo "[4/5] Starting new container..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  -e NODE_ENV=production \
  "${IMAGE_NAME}:${IMAGE_TAG}"

# Step 5: Health check
echo "[5/5] Running health check..."
sleep 5

MAX_RETRIES=6
RETRY_INTERVAL=5
for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf http://localhost:${HOST_PORT}/health > /dev/null 2>&1; then
    echo ""
    echo "========================================"
    echo "  Deployment Successful!"
    echo "  Health check passed on attempt ${i}"
    echo "========================================"

    # Cleanup old images
    docker image prune -af --filter "until=72h" 2>/dev/null || true

    exit 0
  fi
  echo "Health check attempt ${i}/${MAX_RETRIES} failed, retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "========================================"
echo "  DEPLOYMENT FAILED!"
echo "  Health check failed after ${MAX_RETRIES} attempts"
echo "========================================"
docker logs "${CONTAINER_NAME}"
exit 1
```

> **GOTCHA: Deployment Script Best Practices**
>
> - `set -euo pipefail` — fail fast on any error (critical for deployment scripts)
> - Always health-check after deployment — don't assume the container is healthy
> - Use `|| true` on stop/rm commands to avoid failing when container doesn't exist
> - `docker image prune` prevents disk space from filling up with old images
> - The `--restart unless-stopped` flag ensures the container restarts after EC2 reboot
> - Log the deployment timestamp for debugging (when was this version deployed?)

---

## 12. Phase 8 — Continuous Deployment (Tying It All Together)

### 12.1 CD Flow Overview

```
  CONTINUOUS DEPLOYMENT - COMPLETE FLOW
  =======================================

  TRIGGER: Merge PR to main (or direct push)
       |
       v
  +---------------------------------------+
  | GITHUB ACTIONS: CI STAGE              |
  |                                       |
  | 1. Checkout code                      |
  | 2. Install dependencies (npm ci)      |
  | 3. Lint code (eslint)                 |
  | 4. Run tests (jest)                   |
  |                                       |
  | Result: PASS / FAIL                   |
  +---------------------------------------+
       |
       | PASS only
       v
  +---------------------------------------+
  | GITHUB ACTIONS: DOCKER STAGE          |
  |                                       |
  | 1. Build Docker image                 |
  | 2. Tag: latest, sha, build#           |
  | 3. Push to Docker Hub                 |
  |                                       |
  | Result: Image available in registry   |
  +---------------------------------------+
       |
       | SUCCESS only
       v
  +---------------------------------------+
  | GITHUB ACTIONS: DEPLOY STAGE          |
  |                                       |
  | 1. SSH into EC2                       |
  | 2. docker pull latest                 |
  | 3. docker stop old                    |
  | 4. docker run new                     |
  | 5. Health check                       |
  |                                       |
  | Result: New version LIVE              |
  +---------------------------------------+
       |
       v
  +---------------------------------------+
  | VERIFICATION                          |
  |                                       |
  | - GitHub shows green checkmark        |
  | - http://EC2-IP/health returns 200    |
  | - Version field matches new version   |
  +---------------------------------------+
```

### 12.2 Adding GitHub Secrets for CI/CD

Before the pipeline can deploy, ensure all secrets are configured:

```
  REQUIRED GITHUB SECRETS CHECKLIST
  ===================================

  Repository > Settings > Secrets and variables > Actions

  +-------------------------+--------------------------------------+
  | Secret Name             | How to Get the Value                 |
  +-------------------------+--------------------------------------+
  | DOCKERHUB_USERNAME      | Your Docker Hub username             |
  +-------------------------+--------------------------------------+
  | DOCKERHUB_TOKEN         | Docker Hub > Settings > Security >   |
  |                         | New Access Token > Read/Write        |
  +-------------------------+--------------------------------------+
  | EC2_SSH_PRIVATE_KEY     | Contents of cicd-webapp-key.pem      |
  |                         | (Open in Notepad, copy ALL text      |
  |                         |  including BEGIN/END lines)          |
  +-------------------------+--------------------------------------+
  | EC2_HOST                | Your EC2 public IP or Elastic IP     |
  |                         | (e.g., 54.123.45.67)                |
  +-------------------------+--------------------------------------+
  | EC2_USER                | ec2-user (Amazon Linux)              |
  |                         | ubuntu (Ubuntu AMI)                  |
  +-------------------------+--------------------------------------+
```

### 12.3 Enable CI/CD SSH Access

For GitHub Actions to SSH into EC2, the security group must allow it:

```
  OPTION A: Allow All IPs for SSH (Simple, Less Secure)
  =====================================================
  Security Group Rule:
    Type: SSH, Port: 22, Source: 0.0.0.0/0 (Anywhere)

  - Acceptable for learning projects with key-based auth
  - GitHub Actions runners use many different IPs
  - Password auth is disabled by default (key-only = reasonably safe)

  OPTION B: GitHub Meta API (Advanced, More Secure)
  ==================================================
  Fetch GitHub's IP ranges: https://api.github.com/meta
  Look for "actions" IP ranges and add them to security group

  - More secure but IPs change periodically
  - Requires periodic updates to security group
  - Better for production environments
```

### 12.4 Trigger the Full Pipeline

```bash
# Make a small code change
# Edit src/controllers/homeController.js
# Change the version or message text

# Create feature branch
git checkout -b feature/update-welcome-message

# Stage and commit
git add .
git commit -m "feat: update welcome message for v1.1.0"

# Push feature branch
git push origin feature/update-welcome-message

# Create Pull Request on GitHub
# -> CI runs (lint + test)
# -> Review and approve

# Merge PR to main
# -> Full pipeline runs: CI + Docker Build + Deploy

# Watch the pipeline: GitHub > Actions tab
# After ~4-5 minutes, your EC2 should be running the new version

# Verify:
curl http://YOUR_EC2_IP/health
# version should show the new version
```

### 12.5 Rollback Strategy

```
  ROLLBACK PROCEDURE
  ====================

  If a deployment breaks production:

  QUICK ROLLBACK (< 1 minute):
  =============================

  SSH into EC2:
  $ ssh -i ~/.ssh/cicd-webapp-key.pem ec2-user@YOUR_EC2_IP

  # Find the previous working image tag
  $ docker images | grep cicd-webapp

  # Stop current (broken) container
  $ docker stop cicd-webapp
  $ docker rm cicd-webapp

  # Run the previous working version
  $ docker run -d --name cicd-webapp --restart unless-stopped \
      -p 80:3000 -e NODE_ENV=production \
      YOUR_USERNAME/cicd-webapp:PREVIOUS_TAG

  # Verify
  $ curl http://localhost/health


  GIT REVERT (Triggers pipeline for clean rollback):
  ====================================================

  # Revert the bad commit
  $ git revert HEAD
  $ git push origin main

  # This triggers the pipeline with the reverted code
  # A new image is built and deployed automatically
```

> **GOTCHA: Rollback Considerations**
>
> - Always keep at least 3 previous image tags available
> - The `docker image prune --filter "until=72h"` in our deploy script keeps
>   images younger than 72 hours
> - Docker's `--restart unless-stopped` means a crashed container auto-restarts
>   but a manually stopped container STAYS stopped
> - For database changes, rollback is much harder — this project doesn't use
>   a database, but in real projects, always make DB migrations backward-compatible

---

<!-- BATCH 6 END -->

---

## 13. Phase 9 — End-to-End Pipeline Demonstration

### 13.1 Complete Demo Walkthrough

This section walks through the entire pipeline from a code change to live deployment.

```
  END-TO-END DEMO TIMELINE
  =========================

  T+0:00  Developer makes a code change
  T+0:30  git push to feature branch
  T+1:00  Pull Request created on GitHub
  T+1:05  CI Pipeline starts automatically
  T+1:10  Code checked out on runner
  T+1:25  Dependencies installed (npm ci)
  T+1:30  Linter runs (eslint)
  T+1:45  Tests run (jest)
  T+2:00  CI PASSES - Green checkmark on PR
  T+2:05  Developer merges PR to main
  T+2:10  Full pipeline triggers (CI + CD)
  T+2:15  CI stage runs again (lint + test)
  T+3:00  Docker image built
  T+3:45  Docker image pushed to Docker Hub
  T+4:00  SSH deploy to EC2 starts
  T+4:15  Old container stopped, new container started
  T+4:25  Health check passes
  T+4:30  DEPLOYMENT COMPLETE - New version live!

  Total time: ~4-5 minutes from merge to live
```

### 13.2 Step-by-Step Demo

#### Step 1: Make a Code Change

```javascript
// Edit src/controllers/homeController.js
// Change the welcome message:

const getHome = (req, res) => {
  res.json({
    message: "Welcome to CI/CD v1.1.0 - Automated Pipeline Demo!", // <-- Changed
    documentation: "/api/info",
    health: "/health",
    version: require("../../package.json").version,
  });
};
```

Also bump version in `package.json`:

```json
{
  "version": "1.1.0"
}
```

#### Step 2: Create Feature Branch and Push

```bash
# Create feature branch
git checkout -b feature/v1.1.0-demo

# Stage changes
git add .

# Commit with conventional message
git commit -m "feat: update to v1.1.0 with new welcome message"

# Push to GitHub
git push origin feature/v1.1.0-demo
```

#### Step 3: Create Pull Request

1. Go to GitHub repository
2. You'll see a banner: "feature/v1.1.0-demo had recent pushes"
3. Click **Compare & pull request**
4. Title: `feat: update to v1.1.0 with new welcome message`
5. Description: `Updates welcome message and bumps version for pipeline demo`
6. Click **Create pull request**

#### Step 4: Watch CI Run

```
  GitHub PR Page > Checks Tab:
  ============================

  Status checks
  +--------------------------------------------------+
  | CI/CD Pipeline / Build & Test                     |
  |                                                   |
  |  [spinning] In progress...                        |
  |                                                   |
  |  ✓ Checkout code           3s                     |
  |  ✓ Setup Node.js 20       5s                      |
  |  ✓ Install dependencies   28s                     |
  |  [spinning] Run ESLint    ...                     |
  |  ○ Run tests              (pending)               |
  |  ○ Upload coverage        (pending)               |
  +--------------------------------------------------+
```

#### Step 5: Merge After CI Passes

1. Wait for all checks to show green (✓)
2. Click **Merge pull request**
3. Click **Confirm merge**
4. Optionally: Delete the feature branch

#### Step 6: Full Pipeline Runs on Main

Go to **Actions** tab to watch the complete pipeline:

```
  Actions > CI/CD Pipeline > Run #15
  ====================================

  [✓] Build & Test               1m 05s
  [✓] Docker Build & Push        2m 30s
  [spinning] Deploy to EC2       ...

  Live log output:
  ================
  === Deployment Started ===
  Timestamp: Wed Mar 11 14:25:30 UTC 2026
  [1/5] Pulling latest image...
  latest: Pulling from youruser/cicd-webapp
  Digest: sha256:abc123...
  Status: Image is up to date
  [2/5] Stopping existing container...
  cicd-webapp
  [3/5] Removing old container...
  cicd-webapp
  [4/5] Starting new container...
  f7a8b9c0d1e2f3...
  [5/5] Running health check...
  {"status":"healthy","version":"1.1.0",...}
  === Deployment Successful! ===
```

#### Step 7: Verify Live Deployment

```bash
# From your local machine:
curl http://YOUR_EC2_IP/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-03-11T14:26:15.123Z",
  "uptime": 45,
  "environment": "production",
  "version": "1.1.0",                          <-- NEW VERSION!
  "memoryUsage": {
    "rss": "35 MB",
    "heapUsed": "15 MB"
  }
}

# Check the main endpoint:
curl http://YOUR_EC2_IP/

# Expected:
{
  "message": "Welcome to CI/CD v1.1.0 - Automated Pipeline Demo!",
  "version": "1.1.0"
}
```

### 13.3 Pipeline Status Badges

Add status badges to your README.md:

```markdown
<!-- Add to the top of README.md -->

![CI/CD Pipeline](https://github.com/YOUR_USERNAME/automated-cicd-webapp/actions/workflows/ci-cd.yml/badge.svg)
![Docker Image](https://img.shields.io/docker/v/YOUR_USERNAME/cicd-webapp?label=Docker%20Hub)
```

---

## 14. Gotchas & Troubleshooting (Comprehensive Reference)

### 14.1 Pipeline Failure Decision Tree

```
  PIPELINE FAILED - TROUBLESHOOTING TREE
  ========================================

  Pipeline failed
       |
       +-- Which STAGE failed?
            |
            +-- [Checkout] --------> GitHub is down / repo deleted / permissions
            |
            +-- [npm ci] ----------> package-lock.json out of sync
            |                        FIX: Run 'npm install' locally, commit lockfile
            |
            +-- [ESLint] ----------> Code style violations
            |                        FIX: Run 'npm run lint:fix' locally
            |
            +-- [Jest Tests] ------> Test failures
            |   |                    FIX: Run 'npm test' locally, fix failing tests
            |   |
            |   +-- "Cannot find module" --> Missing dependency in package.json
            |   +-- "ECONNREFUSED" -------> Test trying to connect to DB/service
            |   +-- "Timeout" ------------> Async test without done()/await
            |
            +-- [Docker Build] ----> Dockerfile error
            |   |
            |   +-- "COPY failed" ------> File not found (check .dockerignore)
            |   +-- "npm ERR!" ---------> package-lock.json not in Docker context
            |   +-- "ENOMEM" -----------> Runner out of memory (rare)
            |
            +-- [Docker Push] -----> Auth failure
            |   |
            |   +-- "denied" -----------> DOCKERHUB_TOKEN expired or wrong
            |   +-- "unauthorized" -----> DOCKERHUB_USERNAME wrong
            |   +-- "rate limit" -------> Docker Hub pull limit hit
            |
            +-- [Deploy SSH] ------> Connection failure
            |   |
            |   +-- "Connection timed out" -> EC2 stopped or SG blocks port 22
            |   +-- "Permission denied" ----> Wrong SSH key or username
            |   +-- "Host key verification" -> Known hosts issue (use StrictHostKeyChecking=no)
            |
            +-- [Health Check] ----> App not responding
                |
                +-- "Connection refused" ---> Container crashed (check docker logs)
                +-- "Timeout" --------------> Port mapping wrong (-p 80:3000)
                +-- "502 Bad Gateway" ------> App crashed on startup (check logs)
```

### 14.2 Docker-Specific Gotchas

```
  DOCKER GOTCHAS REFERENCE
  =========================

  1. "COPY failed: file not found"
     - File is in .dockerignore
     - File path is wrong (Docker paths are case-sensitive on Linux)
     - File hasn't been committed to git (Docker build context = git checkout)

  2. "npm ERR! could not determine executable to run"
     - package-lock.json missing from Docker build context
     - Fix: Ensure package-lock.json is NOT in .dockerignore

  3. Image size too large (>500MB)
     - Not using multi-stage build
     - Not using Alpine base image
     - node_modules included in build context (check .dockerignore)
     - Fix: Use our multi-stage Dockerfile pattern

  4. Container exits immediately (Exit code 1)
     - Application crashes on startup
     - Check: docker logs <container_name>
     - Common: Missing environment variables
     - Common: Port already in use (another container)

  5. "exec format error"
     - Built image on Mac M1/M2 (ARM), running on x86 EC2
     - Fix: Build with --platform linux/amd64
     - Our GitHub Actions builds on x86, so this is handled

  6. Build cache not working
     - Changing COPY order invalidates all subsequent layers
     - Always COPY package*.json before COPY source code
     - Use specific COPY targets, not COPY . .
```

### 14.3 AWS/EC2-Specific Gotchas

```
  AWS GOTCHAS REFERENCE
  ======================

  1. "Unable to connect to EC2"
     +-- Is the instance running? (check EC2 console)
     +-- Is your IP in the security group? (changes when ISP reassigns)
     +-- Is the Elastic IP associated?
     +-- Are you using the right .pem file?
     +-- Are you using the right username? (ec2-user vs ubuntu)

  2. "Disk space full"
     - Docker images accumulate over time
     - Fix: Add 'docker system prune -af' to deploy script
     - Monitor: 'df -h' on EC2

  3. "EC2 instance stopped unexpectedly"
     - AWS may retire instances (rare, usually with notice)
     - Spot instances can be reclaimed (don't use for production)
     - Check: EC2 > Instance > Monitoring > Status checks

  4. "t2.micro running slow"
     - t2.micro has CPU credits that deplete under load
     - Check: CloudWatch > CPU Credit Balance
     - If credits hit 0, instance is throttled to baseline
     - Fix: Use t3.micro (unlimited mode by default) or upgrade

  5. "High AWS bill!"
     - Elastic IP not associated with running instance ($3.60/month)
     - EBS volumes not deleted after terminating instance
     - Multiple instances running
     - Fix: Use AWS Cost Explorer, set up Budget alerts
```

### 14.4 GitHub Actions-Specific Gotchas

| Issue                                       | Cause                                      | Fix                                               |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Pipeline runs on wrong branch               | `on:` trigger misconfigured                | Check branches filter in workflow YAML            |
| Secrets are empty/undefined                 | Typo in secret name                        | Secret names are case-sensitive                   |
| Pipeline runs twice on merge                | Triggers on both `push` and `pull_request` | Add `if:` condition to skip duplicate             |
| Old workflow still running                  | Concurrency not set                        | Add `concurrency` group to cancel old runs        |
| Actions minutes depleted                    | Private repo, heavy usage                  | Switch to public repo for free minutes            |
| "Error: Process completed with exit code 1" | Generic script failure                     | Check the specific step's log output              |
| Matrix builds timeout                       | Too many variants                          | Reduce matrix or increase timeout                 |
| Cache miss every time                       | Cache key mismatch                         | Verify `hashFiles('**/package-lock.json')` exists |

### 14.5 Quick Fix Commands

```bash
# =============================================
# EMERGENCY COMMANDS CHEAT SHEET
# =============================================

# --- Git Emergencies ---
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git checkout -- .

# Force push (DANGEROUS - only for personal branches)
git push --force origin feature/my-branch

# --- Docker Emergencies ---
# Kill all containers
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -aq) --force

# Nuclear option: remove EVERYTHING
docker system prune -af --volumes

# --- EC2 Emergencies ---
# Restart Docker
sudo systemctl restart docker

# Check disk space
df -h

# Check memory
free -m

# Check what's running
docker ps -a
docker logs cicd-webapp --tail 50

# --- GitHub Actions ---
# Re-run failed pipeline:
# Go to Actions > failed run > "Re-run failed jobs"

# Cancel running pipeline:
# Go to Actions > running workflow > "Cancel workflow"
```

---

<!-- BATCH 7 END -->

---

## 15. Future Enhancements

### 15.1 Enhancement Roadmap

```
  FUTURE ENHANCEMENTS ROADMAP
  =============================

  CURRENT STATE (This Project)
  +--------------------------------------------------+
  | Git -> GitHub Actions -> Docker Hub -> EC2        |
  | Basic CI/CD with single instance deployment       |
  +--------------------------------------------------+
          |
          v
  PHASE 2: MONITORING & OBSERVABILITY
  +--------------------------------------------------+
  | + Prometheus (metrics collection)                 |
  | + Grafana (dashboards & visualization)            |
  | + ELK Stack (centralized logging)                 |
  | + Uptime monitoring (UptimeRobot/Pingdom)         |
  | + Slack/Discord notifications on deploy           |
  +--------------------------------------------------+
          |
          v
  PHASE 3: SECURITY HARDENING
  +--------------------------------------------------+
  | + Trivy/Snyk (container vulnerability scanning)    |
  | + OWASP ZAP (security testing in pipeline)        |
  | + AWS Secrets Manager (replace GitHub Secrets)     |
  | + SSL/TLS with Let's Encrypt (HTTPS)              |
  | + Container image signing (Cosign/Notary)         |
  +--------------------------------------------------+
          |
          v
  PHASE 4: ADVANCED DEPLOYMENT
  +--------------------------------------------------+
  | + Kubernetes (EKS) for container orchestration    |
  | + Blue/Green deployments (zero downtime)          |
  | + Canary releases (gradual rollout)               |
  | + Feature flags (LaunchDarkly/Unleash)            |
  | + Multiple environments (dev/staging/prod)        |
  +--------------------------------------------------+
          |
          v
  PHASE 5: INFRASTRUCTURE AS CODE
  +--------------------------------------------------+
  | + Terraform (provision AWS resources)             |
  | + Ansible (configuration management)              |
  | + AWS CDK (Cloud Development Kit)                 |
  | + Auto-scaling groups (handle traffic spikes)     |
  | + Multi-region deployment (high availability)     |
  +--------------------------------------------------+
```

### 15.2 Adding Notifications (Quick Win)

Add Slack/Discord notifications to the workflow:

```yaml
# Add to the end of .github/workflows/ci-cd.yml

# ------------------------------------------
# JOB 4: Notify (runs after deploy)
# ------------------------------------------
notify:
  name: Send Notification
  runs-on: ubuntu-latest
  needs: [build-and-test, build-and-push-docker, deploy-to-ec2]
  if: always() # Run even if previous jobs fail

  steps:
    - name: Notify on Success
      if: needs.deploy-to-ec2.result == 'success'
      run: |
        curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
          -H 'Content-type: application/json' \
          -d '{
            "text": "✅ Deployment Successful!\nRepo: ${{ github.repository }}\nBranch: ${{ github.ref_name }}\nCommit: ${{ github.sha }}\nBy: ${{ github.actor }}"
          }'

    - name: Notify on Failure
      if: needs.build-and-test.result == 'failure' || needs.deploy-to-ec2.result == 'failure'
      run: |
        curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
          -H 'Content-type: application/json' \
          -d '{
            "text": "❌ Pipeline Failed!\nRepo: ${{ github.repository }}\nBranch: ${{ github.ref_name }}\nRun: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          }'
```

### 15.3 Adding Container Security Scanning

```yaml
# Add as a step in the build-and-push-docker job:

- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.DOCKER_IMAGE }}:latest
    format: "table"
    exit-code: "1" # Fail pipeline on HIGH/CRITICAL vulnerabilities
    severity: "CRITICAL,HIGH"
    ignore-unfixed: true
```

### 15.4 Adding HTTPS with Nginx Reverse Proxy

```
  HTTPS ARCHITECTURE (Future Enhancement)
  =========================================

  Internet
     |
     | HTTPS (port 443)
     v
  +----------------------------+
  |  Nginx Reverse Proxy       |
  |  (SSL/TLS termination)     |
  |  - Let's Encrypt cert      |
  |  - Auto-renewal via certbot|
  +----------------------------+
     |
     | HTTP (port 3000, internal only)
     v
  +----------------------------+
  |  Node.js Application       |
  |  (Docker container)        |
  +----------------------------+
```

### 15.5 Kubernetes Migration Path

```
  KUBERNETES EVOLUTION
  =====================

  CURRENT:
  1 EC2 Instance -> 1 Docker Container -> 1 Application

  KUBERNETES:
  +-- EKS Cluster (managed Kubernetes) ----------------------+
  |                                                           |
  |  +-- Deployment (3 replicas) -----------------------+    |
  |  |  +-- Pod 1 --+  +-- Pod 2 --+  +-- Pod 3 --+   |    |
  |  |  | Container |  | Container |  | Container |   |    |
  |  |  | cicd-app  |  | cicd-app  |  | cicd-app  |   |    |
  |  |  +-----------+  +-----------+  +-----------+   |    |
  |  +--------------------------------------------------+    |
  |                         |                                 |
  |  +-- Service (Load Balancer) --------+                    |
  |  |  Distributes traffic to healthy   |                    |
  |  |  pods automatically               |                    |
  |  +-----------------------------------+                    |
  |                         |                                 |
  |  +-- Ingress (HTTPS + routing) ------+                    |
  |  |  example.com -> cicd-webapp svc   |                    |
  |  |  api.example.com -> api svc       |                    |
  |  +-----------------------------------+                    |
  |                                                           |
  |  Benefits:                                                |
  |  - Auto-scaling (scale pods based on CPU/memory)          |
  |  - Self-healing (restart crashed pods automatically)      |
  |  - Rolling updates (zero-downtime deployments)            |
  |  - Service discovery (pods find each other by name)       |
  +-----------------------------------------------------------+
```

---

## 16. References & Conclusion

### 16.1 References

| Resource               | URL                                                                             | Purpose                  |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------ |
| GitHub Actions Docs    | https://docs.github.com/en/actions                                              | CI/CD workflow reference |
| Docker Documentation   | https://docs.docker.com                                                         | Containerization guide   |
| Docker Hub             | https://hub.docker.com                                                          | Container registry       |
| Express.js Guide       | https://expressjs.com/en/guide/routing.html                                     | Web framework docs       |
| Jest Testing           | https://jestjs.io/docs/getting-started                                          | Test framework docs      |
| AWS EC2 User Guide     | https://docs.aws.amazon.com/ec2/                                                | Cloud deployment         |
| Node.js Best Practices | https://github.com/goldbergyoni/nodebestpractices                               | Production patterns      |
| 12-Factor App          | https://12factor.net                                                            | Modern app methodology   |
| Conventional Commits   | https://www.conventionalcommits.org                                             | Commit message standard  |
| Docker Security        | https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html | Container hardening      |

### 16.2 Project Implementation Checklist

```
  FINAL IMPLEMENTATION CHECKLIST
  ================================

  Phase 1: Version Control
  [_] GitHub repository created
  [_] .gitignore configured
  [_] .gitattributes configured (LF line endings)
  [_] Branch protection rules set on 'main'
  [_] First commit + push successful

  Phase 2: Web Application
  [_] Node.js + Express application created
  [_] Health check endpoint (/health) working
  [_] API info endpoint (/api/info) working
  [_] Static HTML frontend served
  [_] ESLint configured and passing
  [_] Application runs locally (npm run dev)

  Phase 3: Docker
  [_] Dockerfile created (multi-stage build)
  [_] .dockerignore configured
  [_] docker-compose.yml for local dev
  [_] Docker image builds successfully
  [_] Container runs and serves app on port 3000
  [_] HEALTHCHECK passes inside container

  Phase 4: CI Pipeline
  [_] .github/workflows/ci-cd.yml created
  [_] Pipeline triggers on push/PR to main
  [_] Lint stage passes
  [_] Test stage passes
  [_] Coverage report uploaded as artifact

  Phase 5: Testing
  [_] Jest + Supertest test suite created
  [_] All routes tested (/, /api/info, /health, 404)
  [_] Tests pass locally and in CI
  [_] Coverage > 80%

  Phase 6: Container Registry
  [_] Docker Hub account and repository created
  [_] Access token generated for CI
  [_] Image pushes to Docker Hub from pipeline
  [_] Multiple tags applied (latest, sha, build#)

  Phase 7: Cloud Deployment
  [_] AWS EC2 instance launched (t2.micro)
  [_] Security group configured (SSH + HTTP)
  [_] Docker installed on EC2
  [_] SSH key pair created and stored as GitHub Secret
  [_] Manual deployment verified

  Phase 8: Continuous Deployment
  [_] All GitHub Secrets configured
  [_] Pipeline deploys to EC2 on merge to main
  [_] Health check verification in pipeline
  [_] Full end-to-end pipeline working
  [_] Rollback procedure documented and tested

  BONUS:
  [_] README with status badge
  [_] Commit messages follow conventional format
  [_] Pipeline completes in < 5 minutes
```

### 16.3 Key DevOps Principles Demonstrated

```
  DEVOPS PRINCIPLES APPLIED IN THIS PROJECT
  ============================================

  +---------------------------+------------------------------------------+
  | Principle                 | How We Applied It                        |
  +---------------------------+------------------------------------------+
  | Automation                | GitHub Actions automates build/test/     |
  |                           | deploy on every code change              |
  +---------------------------+------------------------------------------+
  | Continuous Integration    | Every push runs lint + tests             |
  |                           | PRs require passing checks               |
  +---------------------------+------------------------------------------+
  | Continuous Deployment     | Merges to main auto-deploy to EC2        |
  +---------------------------+------------------------------------------+
  | Infrastructure as Code    | Dockerfile, docker-compose.yml,          |
  |                           | workflow YAML define infrastructure      |
  +---------------------------+------------------------------------------+
  | Immutable Infrastructure  | Docker images are immutable artifacts    |
  |                           | Deploy new container, don't patch old    |
  +---------------------------+------------------------------------------+
  | Version Control           | Everything in Git (code, config,         |
  |                           | pipeline definitions)                    |
  +---------------------------+------------------------------------------+
  | Shift Left                | Testing happens early in pipeline        |
  |                           | (not after deployment)                   |
  +---------------------------+------------------------------------------+
  | Fast Feedback             | Pipeline results in minutes, not hours   |
  |                           | Developer notified immediately           |
  +---------------------------+------------------------------------------+
  | Reproducibility           | npm ci + Docker = identical builds       |
  |                           | Same image runs in test and production   |
  +---------------------------+------------------------------------------+
```

### 16.4 Conclusion

This project demonstrated a complete, production-relevant CI/CD pipeline covering:

1. **Source Code Management** — Git + GitHub with branching strategy and protection rules
2. **Web Application Development** — Node.js/Express with REST API and health monitoring
3. **Containerization** — Docker with multi-stage builds, security hardening, and optimization
4. **Continuous Integration** — Automated linting, testing, and build verification
5. **Container Registry** — Versioned image storage and distribution via Docker Hub
6. **Cloud Deployment** — AWS EC2 with Docker runtime and automated deployment
7. **Continuous Deployment** — End-to-end automation from code commit to live application

The pipeline transforms a manual, error-prone process into an automated, reliable delivery system that runs in under 5 minutes. Every code change is validated, packaged, and deployed with zero human intervention after the initial pull request merge.

This foundation can be extended with monitoring (Prometheus/Grafana), security scanning (Trivy), container orchestration (Kubernetes), and infrastructure provisioning (Terraform) to build enterprise-grade deployment systems.

---

**End of Walkthrough**

_Built iteratively using the batch state management system._
_Run `build_walkthrough.bat` to check progress status._

<!-- BATCH 8 END - WALKTHROUGH COMPLETE -->
