@echo off
TITLE Foro de Alcaldes 2026 - Compartir Enlace Publico y WhatsApp
chcp 65001 >nul
cls
echo ============================================================
echo   FORO DE ALCALDES Y GOBERNADORES 2026
echo   Generador de Enlace Publico Directo para Compartir
echo ============================================================
echo.

IF NOT EXIST "node_modules" (
  echo [INFO] Instalando dependencias necesarias...
  call npm install
)

call node scripts/compartir.js
pause
