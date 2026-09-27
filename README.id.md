<div align="center">

# Spicetify Extensions

[English](README.md) · [Bahasa Indonesia](README.id.md) · [한국어](README.ko.md)

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

