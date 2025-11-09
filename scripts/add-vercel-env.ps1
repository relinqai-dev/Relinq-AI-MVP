# Script to add environment variables to Vercel
# Run from project root

$env_vars = @{
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your-supabase-anon-key"
    "SUPABASE_SERVICE_ROLE_KEY" = "your-supabase-service-role-key"
    "NEXTAUTH_SECRET" = "your-nextauth-secret"
    "OPENAI_API_KEY" = "your-openai-api-key"
    "NODE_ENV" = "production"
}

Write-Host "Adding environment variables to Vercel..." -ForegroundColor Green

foreach ($key in $env_vars.Keys) {
    Write-Host "Adding $key..." -ForegroundColor Yellow
    $value = $env_vars[$key]
    echo $value | vercel env add $key production --force
}

Write-Host "`nAll environment variables added successfully!" -ForegroundColor Green
Write-Host "Note: NEXTAUTH_URL and FORECASTING_SERVICE_URL will be added after deployment" -ForegroundColor Cyan
