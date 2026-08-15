@echo off
echo ==========================================================
echo   Generating Editorial_Platform_Presentation.pptx...
echo ==========================================================
echo.
node server/build_pptx_standalone.js
echo.
echo Done! Open Editorial_Platform_Presentation.pptx in PowerPoint.
pause
