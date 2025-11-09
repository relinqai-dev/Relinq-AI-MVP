#!/bin/bash

# Google Cloud Run Deployment Script
# This script deploys the forecasting service to Google Cloud Run

set -e

echo "🚀 Starting Cloud Run deployment..."

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"smart-inventory-forecast"}
SERVICE_NAME="forecasting-service"
REGION="us-central1"
MEMORY="2Gi"
CPU="2"
MAX_INSTANCES="10"
MIN_INSTANCES="1"
TIMEOUT="300"

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Memory: $MEMORY"
echo "   CPU: $CPU"
echo ""

# Set the active project
echo "🔧 Setting active project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Navigate to forecasting service directory
cd forecasting-service

# Build and deploy using Cloud Build
echo "🔨 Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml

if [ $? -eq 0 ]; then
    echo "✅ Build and deployment successful!"
    echo ""
    
    # Get the service URL
    echo "🔍 Retrieving service URL..."
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
        --platform managed \
        --region $REGION \
        --format 'value(status.url)')
    
    if [ -n "$SERVICE_URL" ]; then
        echo "🌐 Service URL: $SERVICE_URL"
        echo ""
        
        # Health check
        echo "🏥 Running health check..."
        sleep 5  # Wait for service to be fully ready
        
        HEALTH_RESPONSE=$(curl -s "$SERVICE_URL/health")
        
        if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
            echo "✅ Health check passed"
            echo ""
            echo "📝 Next steps:"
            echo "   1. Update FORECASTING_SERVICE_URL in Vercel environment variables:"
            echo "      vercel env add FORECASTING_SERVICE_URL production"
            echo "      Value: $SERVICE_URL"
            echo ""
            echo "   2. Verify the service is accessible:"
            echo "      curl $SERVICE_URL/health"
            echo ""
            echo "🎉 Deployment complete!"
        else
            echo "⚠️  Health check returned unexpected response:"
            echo "$HEALTH_RESPONSE"
        fi
    else
        echo "⚠️  Could not retrieve service URL"
    fi
else
    echo "❌ Deployment failed"
    exit 1
fi
