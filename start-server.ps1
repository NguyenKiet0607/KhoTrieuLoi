# Start Server Script
# Starts the Next.js server in production mode

$projectPath = "e:\Kho Trieu Loi"
$nodePath = "node"
$serverLog = "$projectPath\logs\server.log"

# Ensure log directory exists
if (!(Test-Path "$projectPath\logs")) {
    New-Item -ItemType Directory -Force -Path "$projectPath\logs"
}

# Set NODE_ENV to production
$env:NODE_ENV = "production"

# Check if .next folder exists, if not build
if (!(Test-Path "$projectPath\.next")) {
    Write-Host "Building application..."
    Set-Location $projectPath
    npm run build
}

Write-Host "Starting server..."
Set-Location $projectPath
& $nodePath "$projectPath\server.js" 2>&1 | Tee-Object -FilePath $serverLog -Append
