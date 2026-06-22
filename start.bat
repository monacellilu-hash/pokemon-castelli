@echo off
REM ====================================================
REM  Pokemon Castelli Romani - avvio gioco
REM  Doppio click su questo file per giocare.
REM ====================================================
cd /d "%~dp0"
start "" http://localhost:8000
node server.js
pause
