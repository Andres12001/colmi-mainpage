@echo off
title Colmi - Hand Detection Server
echo ========================================
echo  COLMI - HAND DETECTION SERVER
echo ========================================
echo.
echo Activando entorno virtual...
cd /d "c:\Users\AgenteMhee\Documents\colmi"
call gestos-env\Scripts\activate.bat

echo.
echo Iniciando servidor de detección de manos...
echo.
echo URLs importantes:
echo - Demo web: index.html
echo - Video stream: http://localhost:5000/video_feed
echo - Datos JSON: http://localhost:5000/hand_data
echo.
echo Para detener presiona Ctrl+C
echo.

python hand_detection_simple.py

echo.
echo Servidor detenido.
pause
