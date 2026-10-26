@echo off
setlocal
cd /d "%~dp0..\.."
set "NODE=%DSH_HOME%\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=C:\Users\Kogud\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=node"
"%NODE%" "modelscope-daily\daily.mjs" >> "K:\AI\DSH-Automation\logs\task.log" 2>&1
exit /b %ERRORLEVEL%