# Production Deployment Checklist

Use this checklist to ensure all steps are completed before and after production deployment.

## Pre-Deployment

### 1. Code Quality
- [ ] All tests passing (`npm run test:run`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Code reviewed and approved
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed or documented

### 2. Environment Configuration
- [ ] Supabase production project created
- [ ] All environment variables configured in Vercel
- [ ] NEXTAUTH_SECRET generated and set
- [ ] OpenAI API key configured
- [ ] Forecasting service URL configured
- [ ] Production domain configured (if using custom domain)

### 3. Database
- [ ] Database schema migrations tested
- [ ] Row Level Security policies enabled
- [ ] Database indexes created
- [ ] Seed data prepared (if needed)
- [ ] Backup strategy configured

### 4. Security
- [ ] Environment variables not committed to Git
- [ ] Service role key kept secret (server-side only)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Authentication flows tested

### 5. Performance
- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] API response times tested
- [ ] Database queries optimized
- [ ] Caching strategy implemented

## Deployment Steps

### 1. Supabase Setup
- [ ] Create production project
- [ ] Run database migrations
- [ ] Configure authentication settings
- [ ] Set up redirect URLs
- [ ] Test database connection

### 2. Google Cloud Run Setup
- [ ] Create GCP project
- [ ] Enable required APIs
- [ ] Deploy forecasting service
- [ ] Configure service settings (memory, CPU, scaling)
- [ ] Test service health endpoint
- [ ] Note service URL for Vercel configuration

### 3. Vercel Deployment
- [ ] Link project to Vercel
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Configure custom domain (optional)
- [ ] Test deployment

## Post-Deployment

### 1. Verification
- [ ] Frontend loads successfully
- [ ] Health check endpoint returns 200
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] POS connection wizard works
- [ ] CSV upload works
- [ ] Data cleanup works
- [ ] Forecasting generates predictions
- [ ] AI recommendations display
- [ ] Purchase order generation works
- [ ] Email templates generate correctly

### 2. Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring active
- [ ] Log aggregation configured
- [ ] Alert notifications set up

### 3. Performance Testing
- [ ] Load testing completed
- [ ] API response times acceptable
- [ ] Database query performance verified
- [ ] Forecasting service performance tested
- [ ] Mobile responsiveness verified

### 4. Security Audit
- [ ] SSL certificate active
- [ ] Security headers verified
- [ ] Authentication flows secure
- [ ] API endpoints protected
- [ ] Rate limiting working
- [ ] CORS configuration correct

### 5. Documentation
- [ ] Deployment documentation updated
- [ ] API documentation current
- [ ] User guide available
- [ ] Troubleshooting guide created
- [ ] Runbook for common issues

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review user feedback
- [ ] Check uptime status

### Weekly
- [ ] Review database performance
- [ ] Analyze API usage patterns
- [ ] Check for security updates
- [ ] Review and optimize slow queries

### Monthly
- [ ] Security audit
- [ ] Dependency updates
- [ ] Performance optimization review
- [ ] Backup verification
- [ ] Cost analysis and optimization

### Quarterly
- [ ] Disaster recovery test
- [ ] Full security audit
- [ ] Architecture review
- [ ] Capacity planning

## Rollback Plan

If issues are detected after deployment:

1. **Immediate Actions**
   - [ ] Identify the issue scope
   - [ ] Check error logs and monitoring
   - [ ] Notify team members

2. **Rollback Steps**
   - [ ] Revert to previous Vercel deployment
   - [ ] Rollback database migrations (if needed)
   - [ ] Revert forecasting service (if needed)
   - [ ] Verify rollback successful

3. **Post-Rollback**
   - [ ] Document the issue
   - [ ] Create fix plan
   - [ ] Test fix in staging
   - [ ] Schedule new deployment

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Google Cloud Support**: https://cloud.google.com/support
- **Team Lead**: [Add contact]
- **DevOps**: [Add contact]

## Notes

Add any deployment-specific notes or observations here:

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Status**: _______________
