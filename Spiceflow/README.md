# Spiceflow Theme

Spiceflow adalah tema ringan dan elegan untuk Spicetify yang memberikan efek interaktif pada antarmuka Spotify kamu. 

## Fitur Utama

- **Smooth Hover Effects:** Menambahkan efek *scale-up* (zoom) halus dan *box shadow* saat kamu mengarahkan kursor (hover) pada ikon playlist maupun ikon artis di sidebar. Bikin interaksi jadi lebih hidup!

## Instalasi

### Prasyarat
Pastikan kamu sudah menginstal [Spicetify CLI](https://spicetify.app/docs/getting-started) di sistem kamu.

### Instalasi Manual

1. Download atau clone repository ini.
2. Salin folder `Spiceflow` ke dalam direktori Themes Spicetify kamu:
   - **Windows:** `%appdata%\spicetify\Themes`
   - **Mac/Linux:** `~/.config/spicetify/Themes`
3. Buka terminal (atau PowerShell) dan atur tema ke Spiceflow dengan perintah berikut:
   ```bash
   spicetify config current_theme Spiceflow
   ```
4. Terapkan tema ke Spotify dengan perintah:
   ```bash
   spicetify apply
   ```
5. Selesai! Spotify kamu sekarang memiliki efek hover baru di sidebar.

## Customization

Secara default, Spiceflow menggunakan skema warna dasar Spotify. Jika kamu ingin mengubah warnanya, kamu bisa mengedit nilai hex di file `color.ini` sesuai selera kamu, lalu jalankan kembali perintah `spicetify apply`.
