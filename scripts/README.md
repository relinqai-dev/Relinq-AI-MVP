# Deployment Scripts

This directory contains automated deployment scripts for the Smart Inventory Forecasting application.

## Scripts Overview

### 🚀 setup-production.sh
**Interactive production setup wizard**

Guides you through the complete production deployment process, including:
- Prerequisites checking
- Supabase project setup
- Database migrations
- Google Cloud Run deployment
- Vercel configuration
- Environment variable setup

**Usage:**
```bash
bash scripts/setup-production.sh
```

**Time:** 15-20 minutes (first time)

---

### 📦 deploy-vercel.sh
**Automated Vercel deployment**

Deploys the Next.js frontend to Vercel with:
- Environment variable validation
- Test execution
- Build verification
- Health check after deployment

**Usage:**
```bash
cd smart-inventory-forecasting
bash ../scripts/deploy-vercel.sh
```

**Prerequisites:**
- Vercel CLI installed
- Project linked to Vercel
- Environment variables configured

**Time:** 5-10 minutes

---

### ☁️ deploy-cloud-run.sh
**Automated Cloud Run deployment**

Deploys the Python forecasting service to Google Cloud Run with:
- API enablement
- Docker image build
- Service deployment
- Health check verification

**Usage:**
```bash
export GCP_PROJECT_ID="your-project-id"
bash scripts/deploy-cloud-run.sh
```

**Prerequisites:**
- Google Cloud SDK installed
- Authenticated with gcloud
- Project created in GCP

**Time:** 10-15 minutes

---

## Quick Start

### First-Time Deployment

Use the interactive setup script:

```bash
bash scripts/setup-production.sh
```

This will guide you through all steps and configure everything automatically.

### Subsequent Deployments

Deploy individual services as needed:

```bash
# Deploy frontend only
bash scripts/deploy-vercel.sh

# Deploy forecasting service only
bash scripts/deploy-cloud-run.sh
```

## Prerequisites

All scripts require:
- Bash shell (Git Bash on Windows, native on Mac/Linux)
- Node.js 20+
- npm

### Additional Requirements by Script

**setup-production.sh:**
- Vercel CLI: `npm install -g vercel`
- Supabase CLI: `npm install -g supabase`
- Google Cloud SDK: https://cloud.google.com/sdk/docs/install

**deploy-vercel.sh:**
- Vercel CLI installed and authenticated

**deploy-cloud-run.sh:**
- Google Cloud SDK installed and authenticated
- Docker (installed with Cloud SDK)

## Environment Variables

Scripts use these environment variables:

| Variable | Used By | Description |
|----------|---------|-------------|
| `GCP_PROJECT_ID` | deploy-cloud-run.sh | Google Cloud project ID |
| `SUPABASE_PROJECT_REF` | setup-production.sh | Supabase project reference |

## Troubleshooting

### Permission Denied

If you get "Permission denied" errors:

```bash
chmod +x scripts/*.sh
```

### Command Not Found

If commands like `vercel` or `gcloud` are not found:

1. Install the required CLI tool
2. Restart your terminal
3. Verify installation: `vercel --version` or `gcloud --version`

### Script Fails Midway

All scripts are designed to be idempotent (safe to run multiple times). If a script fails:

1. Fix the reported issue
2. Run the script again
3. It will skip completed steps and continue

### Windows Users

Use Git Bash or WSL to run these scripts. PowerShell/CMD are not supported.

## CI/CD Integration

These scripts are also used in GitHub Actions workflows:

- `.github/workflows/deploy-production.yml` - Automated deployment on push to main
- `.github/workflows/monitoring.yml` - Continuous health monitoring

## Manual Deployment

If you prefer manual deployment, see:
- `DEPLOYMENT.md` - Comprehensive step-by-step guide
- `QUICK-DEPLOY.md` - Fast-track manual deployment

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `DEPLOYMENT.md` for detailed instructions
3. Check script output for specific error messages
4. Create a GitHub issue with error details

## Script Maintenance

When updating scripts:
1. Test in a clean environment
2. Update this README if behavior changes
3. Update related documentation (DEPLOYMENT.md, etc.)
4. Verify CI/CD workflows still work
