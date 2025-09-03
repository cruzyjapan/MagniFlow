@echo off
echo =====================================
echo MagniFlow - AI Curation Tool
echo =====================================
echo.

REM Check for .env.local
if not exist .env.local (
    echo Warning: .env.local not found
    echo Creating from .env.local.example...
    copy .env.local.example .env.local
    echo.
    echo Please edit .env.local and set NEXTAUTH_SECRET
    echo Generate with: openssl rand -base64 32
    echo.
    pause
)

REM Check for node_modules
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

REM Create data directory
if not exist .data (
    echo Creating data directory...
    mkdir .data
)

echo.
echo Ready to start!
echo.
echo Access URL: http://localhost:3000
echo Login: Demo account (any email)
echo.
echo Usage:
echo   1. Create a tab (+ button)
echo   2. Enter keywords (e.g., React, Next.js, TypeScript)
echo   3. Click "Fetch Articles" button
echo.
echo Press Ctrl+C to stop
echo.
echo =====================================
echo.

npm run dev