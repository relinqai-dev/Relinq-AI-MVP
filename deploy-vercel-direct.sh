#!/bin/bash
# Deploy smart-inventory-forecasting to Vercel
# Run this from the project root

echo "Deploying to Vercel from smart-inventory-forecasting directory..."
vercel --cwd smart-inventory-forecasting --prod
