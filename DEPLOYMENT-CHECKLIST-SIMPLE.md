# Simple Deployment Checklist

Print this out or keep it open while deploying!

---

## ☐ PHASE 1: Get Your Accounts (20 minutes)

### ☐ Supabase (5 min)
- [ ] Go to https://app.supabase.com
- [ ] Create new project
- [ ] Copy Project URL → Save as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy anon key → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy service_role key → Save as `SUPABASE_SERVICE_ROLE_KEY` ⚠️ SECRET

### ☐ OpenAI (2 min)
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Create new API key
- [ ] Copy key → Save as `OPENAI_API_KEY` ⚠️ SECRET
- [ ] Add payment method (required for production)

### ☐ Google Cloud (5 min)
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project
- [ ] Note Project ID → Save as `GCP_PROJECT_ID`
- [ ] Install Google Cloud SDK
- [ ] Run: `gcloud auth login`

### ☐ Vercel (3 min)
- [ ] Go to https://vercel.com
- [ ] Sign up (free)
- [ ] Install CLI: `npm install -g vercel`
- [ ] Run: `vercel login`

### ☐ Generate Secret (30 sec)
- [ ] Run: `openssl rand -base64 32`
- [ ] Copy output → Save as `NEXTAUTH_SECRET` ⚠️ SECRET

---

## ☐ PHASE 2: Install Tools (5 minutes)

- [ ] Node.js 20+ installed
- [ ] Vercel CLI: `npm install -g vercel`
- [ ] Supabase CLI: `npm install -g supabase`
- [ ] Google Cloud SDK installed
- [ ] Git installed

---

## ☐ PHASE 3: Deploy (15 minutes)

### Option A: Automated (Recommended)
- [ ] Run: `bash scripts/setup-production.sh`
- [ ] Follow prompts
- [ ] Enter credentials when asked
- [ ] Wait for completion

### Option B: Manual
- [ ] Deploy forecasting service: `bash scripts/deploy-cloud-run.sh`
- [ ] Note the service URL → Save as `FORECASTING_SERVICE_URL`
- [ ] Add all env vars to Vercel
- [ ] Deploy frontend: `bash scripts/deploy-vercel.sh`

---

## ☐ PHASE 4: Verify (5 minutes)

- [ ] Visit your Vercel URL
- [ ] Check health: `curl https://your-domain.vercel.app/api/health`
- [ ] Should return: `"status": "healthy"`
- [ ] Test user registration
- [ ] Test login
- [ ] Upload sample CSV
- [ ] Generate a forecast

---

## ☐ PHASE 5: Configure (5 minutes)

### Supabase Settings
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Add redirect URL: `https://your-domain.vercel.app/auth/callback`
- [ ] Update site URL: `https://your-domain.vercel.app`

### Optional: Custom Domain
- [ ] Go to Vercel Dashboard → Settings → Domains
- [ ] Add your domain
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate (automatic)

---

## ☐ PHASE 6: Monitor (Ongoing)

### Daily
- [ ] Check error logs in Vercel Dashboard
- [ ] Monitor performance metrics

### Weekly
- [ ] Review database performance in Supabase
- [ ] Check API usage and costs

### Monthly
- [ ] Review and optimize costs
- [ ] Update dependencies
- [ ] Security audit

---

## 🎯 Quick Reference

### Health Check URLs
```
Frontend: https://your-domain.vercel.app/api/health
Forecasting: https://your-service.run.app/health
```

### Important Commands
```bash
# Deploy frontend
bash scripts/deploy-vercel.sh

# Deploy forecasting service
bash scripts/deploy-cloud-run.sh

# View logs
vercel logs
gcloud logging read "resource.type=cloud_run_revision"

# Run migrations
cd smart-inventory-forecasting
supabase db push
```

### Where to Find Things
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Google Cloud Console: https://console.cloud.google.com
- OpenAI Usage: https://platform.openai.com/usage

---

## 🆘 Troubleshooting

### Build Fails
- [ ] Check all environment variables are set in Vercel
- [ ] Run `npm run build` locally to see errors
- [ ] Check `vercel logs` for details

### Health Check Fails
- [ ] Verify all environment variables are correct
- [ ] Check service URLs are accessible
- [ ] Review error logs

### Authentication Not Working
- [ ] Verify Supabase redirect URLs include your domain
- [ ] Check `NEXTAUTH_SECRET` is set
- [ ] Confirm `NEXTAUTH_URL` matches your domain

### Forecasting Service Timeout
- [ ] Increase Cloud Run timeout: `--timeout 300`
- [ ] Check service logs for errors
- [ ] Verify service has enough memory (2Gi)

---

## ✅ Success Criteria

You're done when:
- [ ] Health endpoint returns "healthy"
- [ ] You can register a new user
- [ ] You can log in
- [ ] You can upload a CSV file
- [ ] You can generate a forecast
- [ ] You can see AI recommendations
- [ ] No errors in logs

---

## 📊 Expected Costs

| Service | Monthly Cost |
|---------|--------------|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Google Cloud Run | $10-50 |
| OpenAI API | $5-20 |
| **Total** | **$60-115** |

Start with free tiers, upgrade when ready!

---

## 📞 Need Help?

1. Check `DEPLOYMENT.md` for detailed instructions
2. Check `YOUR-CREDENTIALS-GUIDE.md` for credential help
3. Check `WHAT-YOU-NEED.md` for account setup
4. Review error logs in respective dashboards
5. Create GitHub issue with error details

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URL:** _______________  
**Status:** ☐ In Progress  ☐ Complete  ☐ Issues

---

**Pro Tip:** Take screenshots of each dashboard as you go. Makes troubleshooting easier!
