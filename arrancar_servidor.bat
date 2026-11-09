@echo off
TITLE Foro de Alcaldes y Gobernadores 2026 - Servidor Local
chcp 65001 >nul
cls
echo ============================================================
echo   FORO DE ALCALDES Y GOBERNADORES 2026 - SERVIDOR LOCAL
echo   Topologia A: backend + frontend + packages/shared
echo ============================================================
echo.

IF NOT EXIST "node_modules" (
  echo [INFO] Instalando dependencias del monorepo...
  call npm install
)

echo [INFO] Iniciando servidor backend y plataforma web...
call node backend/server.js
pause
