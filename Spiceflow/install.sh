#!/bin/bash
echo "Menginstal Spiceflow Theme..."

mkdir -p ~/.config/spicetify/Themes/Spiceflow
cp color.ini ~/.config/spicetify/Themes/Spiceflow/
cp user.css ~/.config/spicetify/Themes/Spiceflow/
cp theme.js ~/.config/spicetify/Themes/Spiceflow/

echo "Mengatur tema ke Spiceflow..."
spicetify config current_theme Spiceflow
spicetify config inject_theme_js 1
spicetify apply

echo "Instalasi selesai! Nikmati Spotify baru kamu."
