# PowerShell script to start the Career Line backend server

Write-Host "🚀 Starting Career Line Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if MongoDB connection string is set
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Using default MongoDB connection." -ForegroundColor Yellow
    Write-Host "💡 To use MongoDB Atlas, create a .env file with: MONGODB_URI=your_connection_string" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "✅ Starting server on http://localhost:5000" -ForegroundColor Green
Write-Host "📝 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm start

