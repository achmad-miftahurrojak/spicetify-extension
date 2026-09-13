@echo off
if not exist "%appdata%\spicetify\Themes\Spiceflow" mkdir "%appdata%\spicetify\Themes\Spiceflow"
xcopy /Y /I "%~dp0color.ini" "%appdata%\spicetify\Themes\Spiceflow\" >nul
xcopy /Y /I "%~dp0user.css" "%appdata%\spicetify\Themes\Spiceflow\" >nul
xcopy /Y /I "%~dp0theme.js" "%appdata%\spicetify\Themes\Spiceflow\" >nul
spicetify config current_theme Spiceflow
spicetify config inject_theme_js 1
spicetify apply

echo Instalasi selesai! Nikmati Spotify baru kamu.
pause
