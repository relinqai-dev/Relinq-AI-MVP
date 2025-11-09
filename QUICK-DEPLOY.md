# Quick Deployment Guide

Fast-track guide for deploying Smart Inventory Forecasting to production.

## Prerequisites

```bash
# Install required tools
npm install -g vercel supabase
# Install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install
```

## 1. Supabase (5 minutes)

```bash
# 1. Create project at https://app.supabase.com
# 2. Get credentials from Settings → API
# 3. Run migrations
cd smart-inventory-forecasting
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**Save these values:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2. Google Cloud Run (10 minutes)

```bash
# 1. Create project
gcloud projects create smart-inventory-forecast
gcloud config set project smart-inventory-forecast

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# 3. Deploy
cd forecasting-service
gcloud builds submit --config cloudbuild.yaml

# 4. Get service URL
gcloud run services describe forecasting-service \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

**Save this value:**
- `FORECASTING_SERVICE_URL`

## 3. Vercel (5 minutes)

```bash
cd smart-inventory-forecasting

# 1. Login and link
vercel login
vercel link

# 2. Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add FORECASTING_SERVICE_URL production
vercel env add NEXTAUTH_SECRET production  # Generate with: openssl rand -base64 32

# 3. Deploy
vercel --prod
```

## 4. Verify Deployment

```bash
# Check health endpoints
curl https://your-domain.vercel.app/api/health
curl https://your-forecasting-service.run.app/health

# Test the application
# 1. Visit your domain
# 2. Sign up with test account
# 3. Complete onboarding
# 4. Upload sample CSV
# 5. Generate forecast
```

## 5. Post-Deployment

1. **Update Supabase redirect URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add: `https://your-domain.vercel.app/auth/callback`

2. **Configure custom domain** (optional)
   - Vercel Dashboard → Settings → Domains
   - Add your domain and update DNS

3. **Enable monitoring**
   - Vercel Dashboard → Analytics → Enable
   - Set up error tracking (Sentry, etc.)

## Automated Setup

Use the automated setup script:

```bash
bash scripts/setup-production.sh
```

This script will guide you through all steps interactively.

## Environment Variables Reference

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |
| `FORECASTING_SERVICE_URL` | Cloud Run service URL | After deploying to Cloud Run |
| `NEXTAUTH_SECRET` | Auth secret | Generate with `openssl rand -base64 32` |

## Troubleshooting

**Build fails on Vercel**
- Check environment variables are set
- Verify TypeScript has no errors: `npm run build`

**Health check fails**
- Verify all environment variables are configured
- Check service URLs are correct
- Review logs: `vercel logs`

**Forecasting service timeout**
- Increase Cloud Run timeout: `gcloud run services update forecasting-service --timeout 300`
- Check service logs: `gcloud logging read "resource.type=cloud_run_revision"`

**Authentication not working**
- Verify Supabase redirect URLs include production domain
- Check NEXTAUTH_SECRET is set
- Confirm NEXTAUTH_URL matches production domain

## Support

- Full documentation: See `DEPLOYMENT.md`
- Checklist: See `PRODUCTION-CHECKLIST.md`
- Issues: Create GitHub issue or contact team

## Estimated Time

- **First-time setup**: 30-45 minutes
- **Subsequent deployments**: 5-10 minutes
- **With automation script**: 15-20 minutes
