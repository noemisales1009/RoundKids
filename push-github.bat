@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo Atualizando GitHub...
echo.

cd /d "c:\Users\miche\OneDrive\Documentos\roundKids\RoundKids"

echo [1/3] Adicionando arquivos...
git add .

echo [2/3] Fazendo commit...
git commit -m "fix: Exibição correta de hora de criação e nome do criador em alertas"

echo [3/3] Fazendo push para GitHub...
git push origin main

echo.
echo ✓ Pronto! Alterações enviadas para GitHub.
pause
