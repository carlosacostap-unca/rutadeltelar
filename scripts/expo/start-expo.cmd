@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-expo.ps1"
if errorlevel 1 (
  echo.
  echo No se pudo iniciar Ruta del Telar Expo Offline.
  pause
)
