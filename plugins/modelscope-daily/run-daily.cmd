@echo off
rem 榄旀惌姣忔棩榄旂矑鑷姩棰嗗彇锛堜緵浠诲姟璁″垝璋冪敤锛岄伩鍏嶇獥鍙ｆ畫鐣欙級
cd /d "%~dp0.."
set "NODE=%~dp0..\..\..\_node_placeholder_"
if exist "%DSH_HOME%\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" set "NODE=%DSH_HOME%\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=C:\Users\Kogud\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=node"
"%NODE%" "modelscope-daily\daily.mjs" >> "K:\AI\DSH-Automation\logs\task.log" 2>&1
exit /b %ERRORLEVEL%