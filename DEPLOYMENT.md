# Deployment Guide - Smart Inventory Forecasting MVP

This guide covers deploying the Smart Inventory Forecasting application to production.

## Architecture Overview

- **Frontend & API**: Next.js deployed on Vercel
- **Database & Auth**: Supabase (managed PostgreSQL)
- **Forecasting Service**: Python microservice on Google Cloud Run
- **CDN & SSL**: Managed by Vercel

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Supabase Account**: Sign up at https://supabase.com
3. **Google Cloud Account**: Sign up at https://cloud.google.com
4. **Domain Name**: (Optional) Custom domain for production

## Part 1: Supabase Production Setup

### 1.1 Create Production Project

```bash
# Navigate to https://app.supabase.com
# Click "New Project"
# Fill in:
#   - Project name: smart-inventory-forecasting-prod
#   - Database password: [Generate strong password]
#   - Region: Choose closest to your users
```

### 1.2 Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your production project
cd smart-inventory-forecasting
supabase link --project-ref your-project-ref

# Push migrations to production
supabase db push

# Verify migrations
supabase db diff
```

### 1.3 Configure Security Rules

The security policies are automatically applied via migration `002_security_policies.sql`.

Verify Row Level Security is enabled:
```sql
-- Run in Supabase SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 1.4 Configure Authentication

In Supabase Dashboard → Authentication → Settings:

1. **Site URL**: Set to your production domain (e.g., `https://your-domain.com`)
2. **Redirect URLs**: Add:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`
3. **Email Templates**: Customize confirmation and password reset emails
4. **Rate Limiting**: Enable to prevent abuse

### 1.5 Get API Keys

From Supabase Dashboard → Settings → API:
- Copy `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
- Copy `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Copy `service_role` key (SUPABASE_SERVICE_ROLE_KEY) - Keep secret!

## Part 2: Google Cloud Run Setup (Forecasting Service)

### 2.1 Install Google Cloud SDK

```bash
# Download from https://cloud.google.com/sdk/docs/install
# Or use package manager:
# Windows: choco install gcloudsdk
# Mac: brew install google-cloud-sdk

# Initialize and authenticate
gcloud init
gcloud auth login
```

### 2.2 Create Google Cloud Project

```bash
# Create new project
gcloud projects create smart-inventory-forecast --name="Smart Inventory Forecasting"

# Set as active project
gcloud config set project smart-inventory-forecast

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2.3 Deploy Forecasting Service

```bash
# Navigate to forecasting service directory
cd forecasting-service

# Build and deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml

# Alternative: Manual deployment
gcloud run deploy forecasting-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 1
```

### 2.4 Get Service URL

```bash
# Get the deployed service URL
gcloud run services describe forecasting-service \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'

# Save this URL as FORECASTING_SERVICE_URL for Vercel
```

### 2.5 Configure Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=forecasting-service" --limit 50

# Set up alerts (optional)
# Navigate to Cloud Console → Monitoring → Alerting
```

## Part 3: Vercel Deployment

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Link Project

```bash
cd smart-inventory-forecasting

# Login to Vercel
vercel login

# Link project (follow prompts)
vercel link
```

### 3.3 Configure Environment Variables

```bash
# Add environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add FORECASTING_SERVICE_URL production
vercel env add NEXTAUTH_SECRET production

# Or add via Vercel Dashboard:
# https://vercel.com/your-team/your-project/settings/environment-variables
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: From Supabase (Part 1.5)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase (Part 1.5)
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase (Part 1.5)
- `OPENAI_API_KEY`: Your OpenAI API key
- `FORECASTING_SERVICE_URL`: From Cloud Run (Part 2.4)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

### 3.4 Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if Git integration enabled)
git push origin main
```

### 3.5 Configure Custom Domain (Optional)

```bash
# Add domain via CLI
vercel domains add your-domain.com

# Or via Vercel Dashboard:
# Settings → Domains → Add Domain

# Update DNS records as instructed by Vercel
# Vercel automatically provisions SSL certificate
```

## Part 4: Post-Deployment Configuration

### 4.1 Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Add your production domain to allowed redirect URLs
- Update site URL to production domain

### 4.2 Test Production Deployment

```bash
# Test health endpoints
curl https://your-domain.com/api/health
curl https://forecasting-service-url.run.app/health

# Test authentication flow
# 1. Visit https://your-domain.com
# 2. Sign up with test account
# 3. Verify email confirmation
# 4. Test login flow
```

### 4.3 Configure Monitoring & Logging

#### Vercel Analytics
```bash
# Enable in Vercel Dashboard
# Settings → Analytics → Enable
```

#### Supabase Monitoring
- Navigate to Supabase Dashboard → Reports
- Monitor database performance, API usage, and auth metrics

#### Google Cloud Monitoring
```bash
# View Cloud Run metrics
gcloud monitoring dashboards list

# Set up uptime checks
gcloud monitoring uptime-checks create forecasting-service-health \
  --resource-type=uptime-url \
  --host=forecasting-service-url.run.app \
  --path=/health
```

### 4.4 Set Up Error Tracking (Optional)

Consider integrating error tracking services:
- **Sentry**: For frontend and API error tracking
- **LogRocket**: For session replay and debugging
- **Google Cloud Error Reporting**: For Cloud Run errors

## Part 5: Performance Optimization

### 5.1 Vercel Configuration

The `vercel.json` file includes:
- Security headers (XSS protection, frame options)
- CDN configuration (automatic via Vercel)
- API route rewrites for forecasting service

### 5.2 Database Optimization

```sql
-- Run in Supabase SQL Editor
-- Verify indexes are created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Monitor slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### 5.3 Cloud Run Optimization

Current configuration:
- **Memory**: 2Gi (sufficient for ML models)
- **CPU**: 2 cores (parallel processing)
- **Min instances**: 1 (reduces cold starts)
- **Max instances**: 10 (handles traffic spikes)
- **Timeout**: 300s (for complex forecasts)

Adjust based on usage patterns:
```bash
gcloud run services update forecasting-service \
  --min-instances 2 \
  --max-instances 20 \
  --region us-central1
```

## Part 6: Security Checklist

- [x] Row Level Security enabled on all Supabase tables
- [x] Environment variables stored securely (not in code)
- [x] HTTPS enforced (automatic via Vercel)
- [x] Security headers configured (vercel.json)
- [x] Service role key kept secret (server-side only)
- [x] API rate limiting enabled (Supabase)
- [x] Authentication required for all user data
- [x] CORS configured properly
- [ ] Regular security audits scheduled
- [ ] Backup strategy implemented

## Part 7: Backup & Disaster Recovery

### 7.1 Database Backups

Supabase automatically backs up your database daily. To create manual backup:

```bash
# Export database
supabase db dump -f backup.sql

# Restore from backup (if needed)
supabase db reset
psql -h db.your-project.supabase.co -U postgres -d postgres -f backup.sql
```

### 7.2 Code Backups

- Code is version controlled in Git
- Vercel maintains deployment history
- Can rollback to previous deployment instantly

## Part 8: Scaling Considerations

### When to Scale

Monitor these metrics:
- **Vercel**: Response times, function duration
- **Supabase**: Database CPU, connection count
- **Cloud Run**: Request latency, instance count

### Scaling Options

1. **Vercel**: Automatic scaling (no action needed)
2. **Supabase**: Upgrade plan for more resources
3. **Cloud Run**: Increase max instances or resources

```bash
# Scale Cloud Run
gcloud run services update forecasting-service \
  --memory 4Gi \
  --cpu 4 \
  --max-instances 50
```

## Troubleshooting

### Common Issues

**Issue**: 500 errors on API routes
- Check Vercel logs: `vercel logs`
- Verify environment variables are set
- Check Supabase connection

**Issue**: Forecasting service timeout
- Increase Cloud Run timeout
- Optimize ML model performance
- Check data volume being processed

**Issue**: Authentication not working
- Verify Supabase redirect URLs
- Check NEXTAUTH_URL matches domain
- Confirm NEXTAUTH_SECRET is set

**Issue**: Slow database queries
- Review query execution plans
- Add missing indexes
- Consider upgrading Supabase plan

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Google Cloud Run Docs**: https://cloud.google.com/run/docs
- **Next.js Docs**: https://nextjs.org/docs

## Maintenance Schedule

- **Daily**: Monitor error logs and performance metrics
- **Weekly**: Review database performance and optimize queries
- **Monthly**: Security audit and dependency updates
- **Quarterly**: Backup verification and disaster recovery test
