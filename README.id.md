<div align="center">

# Spicetify Extensions

<a href="README.md"><img alt="English" src="https://img.shields.io/badge/English-DFE0E5"></a> <a href="README.id.md"><img alt="Bahasa Indonesia" src="https://img.shields.io/badge/Bahasa%20Indonesia-DFE0E5"></a> <a href="README.ko.md"><img alt="한국어" src="https://img.shields.io/badge/%ED%95%9C%EA%B5%AD%EC%96%B4-DFE0E5"></a>

<img alt="Spicetify" src="https://img.shields.io/badge/Spicetify-1DB954?logo=spotify&logoColor=white"> <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">

Kumpulan ekstensi dan tema Spotify yang dapat dipasang secara terpisah.

</div>

---

## Ekstensi

| Proyek | Deskripsi | Dokumentasi |
| --- | --- | --- |
| [Songwriter's Pad](songwriters-pad/) | Menyimpan lirik, chord, dan memori bertimestamp di Spotify. | [README](songwriters-pad/README.md) |
| [Dedication](dedication/) | Mengirim dedikasi lagu dengan pesan dan tampilan postcard. | [README](dedication/README.md) |
| [Spiceflow](Spiceflow/) | Menambahkan efek hover pada sidebar dengan tema ringan. | [README](Spiceflow/README.md) |

Setiap proyek memiliki source, instruksi build, dan file instalasinya sendiri.

## Persyaratan

- [Spicetify CLI](https://spicetify.app/docs/getting-started) 2.36 atau lebih baru
- Spotify Desktop
- Node.js 20+ dan pnpm 9+ untuk proyek yang perlu di-build

## Pengembangan

    cd songwriters-pad
    pnpm install
    pnpm build

Ikuti README di folder ekstensi yang dipilih. Jaga bundle, manifest, dan script instalasi tetap selaras saat melakukan perubahan.

## Lisensi

[MIT](LICENSE)

Spicetify mengubah client Spotify, sehingga update client dapat merusak ekstensi.
