@echo off
setlocal
cd /d "%~dp0"
set "CONCERT_PYTHON=C:\Users\namph\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%CONCERT_PYTHON%" goto launch
set "CONCERT_PYTHON="
where py >nul 2>&1
if not errorlevel 1 set "CONCERT_PYTHON=py"
if defined CONCERT_PYTHON goto launch
where python >nul 2>&1
if not errorlevel 1 set "CONCERT_PYTHON=python"
if not defined CONCERT_PYTHON goto missing
:launch
"%CONCERT_PYTHON%" start_website.py
if errorlevel 1 pause
exit /b
:missing
echo Khong tim thay Python. Hay cai Python 3 roi thu lai.
pause
