#!/bin/bash

# Production Setup Script
# This script guides you through the complete production setup process

set -e

echo "🎯 Smart Inventory Forecasting - Production Setup"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo "ℹ️  $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 20 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check Vercel CLI
if command -v vercel &> /dev/null; then
    print_success "Vercel CLI installed"
else
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check gcloud CLI
if command -v gcloud &> /dev/null; then
    print_success "Google Cloud SDK installed"
else
    print_warning "Google Cloud SDK not found."
    print_info "Install from: https://cloud.google.com/sdk/docs/install"
fi

# Check Supabase CLI
if command -v supabase &> /dev/null; then
    print_success "Supabase CLI installed"
else
    print_warning "Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo ""
echo "=================================================="
echo "📝 Production Setup Checklist"
echo "=================================================="
echo ""

# Step 1: Supabase Setup
echo "1️⃣  SUPABASE SETUP"
echo "   ----------------"
print_info "Create a production project at https://app.supabase.com"
echo ""
read -p "   Have you created a Supabase project? (y/n): " supabase_created

if [ "$supabase_created" != "y" ]; then
    print_warning "Please create a Supabase project first, then run this script again."
    exit 0
fi

read -p "   Enter your Supabase Project URL: " SUPABASE_URL
read -p "   Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
read -sp "   Enter your Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
echo ""
read -p "   Enter your Supabase Project Ref: " SUPABASE_PROJECT_REF

print_success "Supabase credentials collected"
echo ""

# Step 2: Run Database Migrations
echo "2️⃣  DATABASE MIGRATIONS"
echo "   --------------------"
read -p "   Run database migrations now? (y/n): " run_migrations

if [ "$run_migrations" = "y" ]; then
    print_info "Linking to Supabase project..."
    cd smart-inventory-forecasting
    supabase link --project-ref $SUPABASE_PROJECT_REF
    
    print_info "Pushing migrations..."
    supabase db push
    
    print_success "Database migrations completed"
    cd ..
else
    print_warning "Skipping migrations. Remember to run them manually!"
fi
echo ""

# Step 3: Google Cloud Setup
echo "3️⃣  GOOGLE CLOUD SETUP"
echo "   -------------------"
read -p "   Have you created a Google Cloud project? (y/n): " gcp_created

if [ "$gcp_created" = "y" ]; then
    read -p "   Enter your GCP Project ID: " GCP_PROJECT_ID
    
    print_info "Setting active project..."
    gcloud config set project $GCP_PROJECT_ID
    
    print_info "Enabling required APIs..."
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    print_success "Google Cloud configured"
else
    print_warning "Please create a Google Cloud project first."
    print_info "Visit: https://console.cloud.google.com"
fi
echo ""

# Step 4: OpenAI API Key
echo "4️⃣  OPENAI API KEY"
echo "   ---------------"
read -sp "   Enter your OpenAI API Key: " OPENAI_API_KEY
echo ""
print_success "OpenAI API key collected"
echo ""

# Step 5: Deploy Forecasting Service
echo "5️⃣  DEPLOY FORECASTING SERVICE"
echo "   ---------------------------"
read -p "   Deploy forecasting service to Cloud Run now? (y/n): " deploy_forecasting

if [ "$deploy_forecasting" = "y" ]; then
    print_info "Deploying to Cloud Run..."
    export GCP_PROJECT_ID
    bash scripts/deploy-cloud-run.sh
    
    print_info "Retrieving service URL..."
    FORECASTING_SERVICE_URL=$(gcloud run services describe forecasting-service \
        --platform managed \
        --region us-central1 \
        --format 'value(status.url)')
    
    print_success "Forecasting service deployed: $FORECASTING_SERVICE_URL"
else
    read -p "   Enter your Forecasting Service URL: " FORECASTING_SERVICE_URL
fi
echo ""

# Step 6: Vercel Setup
echo "6️⃣  VERCEL SETUP"
echo "   -------------"
print_info "Logging into Vercel..."
vercel login

print_info "Linking project..."
cd smart-inventory-forecasting
vercel link

print_info "Setting environment variables..."
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production
echo "$FORECASTING_SERVICE_URL" | vercel env add FORECASTING_SERVICE_URL production

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production

print_success "Vercel environment variables configured"
cd ..
echo ""

# Step 7: Deploy to Vercel
echo "7️⃣  DEPLOY TO VERCEL"
echo "   -----------------"
read -p "   Deploy to Vercel production now? (y/n): " deploy_vercel

if [ "$deploy_vercel" = "y" ]; then
    print_info "Deploying to Vercel..."
    bash scripts/deploy-vercel.sh
    print_success "Application deployed to Vercel"
else
    print_warning "Skipping Vercel deployment. Deploy manually when ready."
fi
echo ""

# Step 8: Summary
echo "=================================================="
echo "🎉 SETUP COMPLETE!"
echo "=================================================="
echo ""
print_success "Your production environment is configured!"
echo ""
echo "📝 Summary:"
echo "   - Supabase: $SUPABASE_URL"
echo "   - Forecasting Service: $FORECASTING_SERVICE_URL"
echo "   - Vercel: Check your Vercel dashboard for deployment URL"
echo ""
echo "📚 Next Steps:"
echo "   1. Configure custom domain in Vercel (optional)"
echo "   2. Update Supabase redirect URLs with production domain"
echo "   3. Test the production deployment"
echo "   4. Set up monitoring and alerts"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
