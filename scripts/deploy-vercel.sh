#!/bin/bash

# Vercel Deployment Script
# This script deploys the Smart Inventory Forecasting application to Vercel

set -e

echo "🚀 Starting Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to the Next.js application directory
cd smart-inventory-forecasting

# Check if environment variables are set
echo "📋 Checking environment variables..."
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
    "FORECASTING_SERVICE_URL"
    "NEXTAUTH_SECRET"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! vercel env ls production | grep -q "$var"; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "⚠️  Missing environment variables in Vercel:"
    printf '   - %s\n' "${missing_vars[@]}"
    echo ""
    echo "Please add them using:"
    echo "  vercel env add <VARIABLE_NAME> production"
    exit 1
fi

echo "✅ All required environment variables are configured"

# Run tests before deployment
echo "🧪 Running tests..."
npm run test:run

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Aborting deployment."
    exit 1
fi

echo "✅ Tests passed"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

echo "✅ Build successful"

# Deploy to production
echo "🚢 Deploying to Vercel production..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔍 Verifying deployment..."
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls --prod | grep "smart-inventory-forecasting" | head -n 1 | awk '{print $2}')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        echo "🌐 Production URL: https://$DEPLOYMENT_URL"
        
        # Health check
        echo "🏥 Running health check..."
        sleep 5  # Wait for deployment to be fully ready
        
        HEALTH_RESPONSE=$(curl -s "https://$DEPLOYMENT_URL/api/health")
        
        if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
            echo "✅ Health check passed"
            echo ""
            echo "🎉 Deployment complete and verified!"
        else
            echo "⚠️  Health check returned unexpected response:"
            echo "$HEALTH_RESPONSE"
        fi
    fi
else
    echo "❌ Deployment failed"
    exit 1
fi
