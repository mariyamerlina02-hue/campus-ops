@echo off
setlocal
cd /d "%~dp0"
echo ========================================================
echo   ORVIAN Digital Twin - Automatic GitHub & Vercel Deploy
echo ========================================================
echo.

echo [1/3] Checking Git Status...
git status
echo.

echo [2/3] Authenticating & Pushing to GitHub...
where gh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Opening GitHub CLI Authentication (press Enter to proceed in browser)...
    call gh auth login --web -h github.com
    echo Creating and pushing to GitHub repository 'orvian-campusops'...
    call gh repo create orvian-campusops --public --source=. --remote=origin --push
) else (
    echo GitHub CLI not found. Please push using standard git remote:
    echo   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo   git push -u origin master
)

echo.
echo [3/3] Deploying to Vercel...
call npx.cmd vercel --prod

echo.
echo ========================================================
echo   Deployment Process Completed!
echo ========================================================
pause
