@echo off
echo Menginstal Spiceflow Theme...

:: Buat folder jika belum ada
if not exist "%appdata%\spicetify\Themes\Spiceflow" mkdir "%appdata%\spicetify\Themes\Spiceflow"

:: Copy file ke folder theme spicetify
copy /Y "%~dp0color.ini" "%appdata%\spicetify\Themes\Spiceflow\" >nul
copy /Y "%~dp0user.css" "%appdata%\spicetify\Themes\Spiceflow\" >nul

echo Mengatur tema ke Spiceflow...
spicetify config current_theme Spiceflow
spicetify apply

echo Instalasi selesai! Nikmati Spotify baru kamu.
pause
