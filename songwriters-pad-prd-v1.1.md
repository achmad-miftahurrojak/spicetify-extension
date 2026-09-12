# PRD: Songwriter's Pad
### Spicetify Extension v1.1 (Revisi)
**Status:** Revisi siap eksekusi | **Author:** Hamin (SOE) | **Last Updated:** 2026-09-12

---

## 1. Executive Summary

Songwriter's Pad adalah ekstensi Spicetify yang memungkinkan pengguna menangkap ide lirik, melodi, atau referensi vokal secara langsung di dalam Spotify desktop, terpinned pada timestamp tertentu di sebuah lagu. Alih-alih keluar dari Spotify untuk buka Notes atau Notion, pengguna cukup klik, tulis, dan ide mereka tersimpan melekat pada detik spesifik di lagu itu.

Ini bukan sekadar notepad. Ini adalah cara kerja baru bagi songwriter: dengar inspirasi, tangkap tepat di momen itu, kembali ke sana kapanpun.

Tidak ada ekstensi Spicetify yang melakukan ini saat ini. Tidak ada tools yang menggabungkan playback context + timestamped creative note dalam satu workflow yang mulus.

---

## 2. Problem Statement

### Masalah Inti
Proses kreatif songwriter sangat bergantung pada momen. Inspirasi datang saat mendengarkan lagu referensi, tapi workflow saat ini memaksa mereka keluar dari konteks itu:

1. Dengar riff bagus di detik ke-47 sebuah lagu referensi
2. Pause Spotify
3. Buka aplikasi lain (Notes, Notion, kertas)
4. Tulis dengan kehilangan konteks: "ada nada bagus di lagu X" tanpa tahu tepatnya di mana
5. Kembali ke Spotify, cari lagunya lagi, cari momennya lagi

**Konteks hilang. Memori hilang. Momen kreatif itu tidak pernah sempurna ter-capture.**

### Data Pendukung
- Spicetify memiliki lebih dari 10 juta pengguna aktif (GitHub stars + download count)
- Komunitas songwriter di r/songwriting memiliki 350k+ anggota dan sering mengeluhkan "losing the moment"
- Belum ada satu pun ekstensi Spicetify di marketplace yang berfungsi sebagai creative notepad

---

## 3. Goals & Objectives

### Primary Goals
- Memungkinkan pengguna menulis catatan kreatif yang ter-timestamp ke detik tertentu dalam lagu
- Zero friction: membuka notepad tidak boleh mengganggu playback
- Notes bisa diakses kembali kapanpun lagu diputar ulang

### Secondary Goals
- Export notes per lagu ke format teks/markdown
- Kategori note (lirik, melodi, chord, referensi vokal, dll.)

### Non-Goals (v1.0)
- Tidak ada kolaborasi multi-user
- Tidak ada sinkronisasi cloud bawaan
- Tidak ada perekaman audio

---

## 4. User Personas

### Persona A: Rian, 20 tahun, Aspiring Songwriter
- Pakai Spotify setiap hari untuk riset referensi musik
- Sering dengar lagu K-Pop atau indie dan ingin capture "vibe" bagian tertentu sebagai referensi lirik
- Frustrasi karena tiap kali switch ke Notes, dia kehilangan feelnya
- Tech-savvy, sudah pakai Spicetify

### Persona B: Dinda, 24 tahun, Musik Produser Amatir
- Pakai Spotify untuk referensi aransemen dan struktur lagu
- Butuh catatan seperti "di sini intro fade-in 8 bar" atau "pre-chorus energy reference"
- Sering listening session panjang sambil nulis di buku, dan bukunya sering hilang

### Persona C: Hamin (power user)
- Penulis yang butuh referensi lagu untuk scene tertentu di novel/skrip
- Mau timestamp momen lagu ke ide naratif yang spesifik

---

## 5. User Stories & Requirements

### Epic 1: Core Note Taking

**US-001: Buat Note Baru**
```
Sebagai songwriter,
Saya ingin menekan tombol/shortcut saat lagu sedang bermain,
Agar sebuah notepad muncul dengan timestamp otomatis terisi.

Acceptance Criteria:
- Tombol Songwriter's Pad tersedia di Spicetify top bar
- Saat diklik, panel muncul tanpa pause playback
- Timestamp otomatis terisi dengan format MM:SS dari posisi playback saat itu
- User bisa langsung menketik tanpa klik tambahan
- Tekan Enter atau Ctrl+S untuk simpan
```

**US-002: Note Tersimpan per Lagu**
```
Sebagai songwriter,
Saya ingin catatan saya otomatis terhubung ke lagu yang sedang diputar,
Agar saat saya buka lagu itu lagi, semua catatan saya muncul.

Acceptance Criteria:
- Notes disimpan dengan key berupa track ID Spotify
- Track change terdeteksi via event listener Spicetify.Player
- Saat lagu yang sama diputar, panel otomatis populate dengan notes lama
- Notes ditampilkan dalam urutan timestamp ascending
- Notes yang ada tidak mengganggu atau auto-muncul saat lagu mulai
```

**US-003: Klik Timestamp untuk Seek**
```
Sebagai songwriter,
Saya ingin bisa klik timestamp di note saya,
Agar Spotify otomatis loncat ke momen itu.

Acceptance Criteria:
- Setiap note punya timestamp yang clickable
- Klik timestamp langsung seek playback ke detik tersebut
- Playback state (play/pause) tidak berubah saat seek
```

### Epic 2: Note Management

**US-004: Edit & Delete Note**
```
Sebagai pengguna,
Saya ingin bisa edit atau hapus note yang sudah ada,
Agar saya bisa refine catatan saya.

Acceptance Criteria:
- Hover pada note memunculkan icon edit dan delete
- Edit mode membuka inline text editor
- Delete meminta konfirmasi singkat (bukan modal besar)
- Perubahan tersimpan secara lokal tanpa perlu tombol Save eksplisit
```

**US-005: Tag/Kategori Note**
```
Sebagai songwriter,
Saya ingin menandai note dengan kategori (Lirik, Melodi, Chord, Referensi),
Agar saya bisa filter catatan berdasarkan jenis.

Acceptance Criteria:
- 4 tag tersedia: Lyric, Melody, Chord, Vibe
- Tag dipilih saat membuat note, bisa diubah setelah
- Warna tag berbeda untuk visual distinction
- Filter by tag tersedia di header panel
```

### Epic 3: Export

**US-006: Export Notes per Lagu**
```
Sebagai pengguna,
Saya ingin bisa export semua notes dari satu lagu ke file teks,
Agar bisa saya buka di tools lain.

Acceptance Criteria:
- Tombol Export di panel menghasilkan file .txt atau .md
- Format: [ARTIST - TITLE] > [MM:SS] [TAG] Isi note
- File tersimpan via browser download mechanism ke folder Downloads
- Tidak memerlukan auth atau internet untuk export
```

**US-007: Backup Semua Notes (BARU di v1.1)**
```
Sebagai pengguna,
Saya ingin bisa download satu file berisi seluruh notes saya,
Agar data saya aman kalau saya clear storage atau ganti device.

Acceptance Criteria:
- Tombol Backup di settings/export section panel
- Menghasilkan satu file JSON berisi seluruh notes + schema version
- File bisa di-restore via tombol Restore (import JSON)
- Restore menolak file dengan schema version yang tidak dikenali (tampilkan error yang jelas)
```

### Epic 4: Mode Memory & Viral Export (BARU - Milestone M3.5)

**US-008: Mode Switcher (Creator vs Memory)**
```
Sebagai pengguna,
Saya ingin bisa mengubah mode ekstensi antara "Creator Mode" dan "Memory Mode",
Agar UI dan opsi tag menyesuaikan dengan konteks kebutuhan saya saat itu.

Acceptance Criteria:
- Terdapat segmented control (dua tombol bersebelahan) di header panel untuk memilih mode (Creator / Memory)
- Pilihan mode tersimpan secara persisten per user (di local storage swp:settings) dan tetap sama saat Spotify direstart
- Mengganti mode otomatis mengubah filter row dan tag order pada form input
```

**US-009: Memory Tags**
```
Sebagai pendengar musik awam,
Saya ingin bisa menandai note dengan konteks memori (Person, Moment, Feeling, Place),
Agar saya bisa menyimpan kenangan spesifik yang terhubung ke lagu tersebut.

Acceptance Criteria:
- Saat "Memory Mode" aktif, tag yang tersedia adalah: Person, Moment, Feeling, Place
- Tag "Person" memunculkan input tambahan "Who?" yang menampilkan text badge khusus (contoh: `@Reza`) di Note Card
- Warna tag memory dibedakan secara visual dari tag creator
- Skema personName ditambahkan sebagai field optional agar notes lama tidak rusak (backward compatibility)
```

**US-010: Memory Card Export (Viral Feature)**
```
Sebagai pengguna Gen Z,
Saya ingin meng-export catatan memori saya menjadi gambar estetik (mirip Spotify Wrapped card),
Agar saya bisa membagikannya ke media sosial (Instagram Story, dll).

Acceptance Criteria:
- Tombol "Export Card" tersedia pada setiap note saat berada di "Memory Mode"
- Men-generate gambar (PNG) berukuran 1080x1350 (rasio 4:5 untuk IG Story)
- Desain memuat: Judul + Artis, Cover Album (dengan fallback gradient jika gagal load karena CORS), Quote Timestamp, Teks Note, Badge @Person (jika ada), Tanggal, dan tulisan "via Songwriter's Pad"
- Eksekusi export berjalan secara lokal menggunakan DOM off-screen (`position: fixed`, `left: -9999px`) untuk bypass limitasi `html-to-image`
```

---

## 6. Success Metrics

### Framework: HEART (Google)

| Dimensi | Metrik | Target v1.0 |
|---|---|---|
| Happiness | Rating di Spicetify marketplace | 4.2/5 |
| Engagement | Rata-rata notes per user per minggu | 5+ |
| Adoption | Download dalam 30 hari pertama | 500+ |
| Retention | % user yang masih pakai di bulan ke-2 | 40%+ |
| Task Success | % sesi di mana note berhasil tersimpan tanpa error | 99%+ |

### North Star Metric
**Jumlah timestamped notes yang dibuat per bulan** = indikator terbaik bahwa ekstensi ini genuinely dipakai dalam workflow kreatif, bukan cuma di-install lalu dilupakan.

---

## 7. Scope

### In Scope (v1.0)
- Panel UI: Panel API Spicetify (right sidebar) sebagai extension point utama
- Trigger button: icon pena kecil di Spicetify top bar (via Spicetify.Topbar), badge counter kalau ada notes
- Timestamped note creation yang terhubung ke track ID
- Clickable timestamp untuk seek
- Edit, delete, tag notes
- Local storage via Spicetify.LocalStorage API
- Export per lagu ke .txt/.md
- Backup & restore seluruh notes ke JSON (v1.1)
- Keyboard shortcut untuk buka panel (lihat catatan konflik di Section 8)

### Out of Scope (v1.0, masuk roadmap v2)
- Cloud sync
- Mobile (Spicetify hanya desktop)
- Collaborative notes
- Audio recording / humming capture
- AI suggestion ("lanjutkan lirik ini")
- Cross-song note search
- Playlist view (semua lagu yang punya notes)

---

## 8. Technical Considerations

### Tipe Ekstensi
**Extension, bukan Custom App.** Custom App itu untuk halaman penuh dengan routing di sidebar. Songwriter's Pad cuma butuh tombol topbar + panel geser, jadi tipe-nya extension. Ini menentukan struktur repo dan cara publish.

### Stack
- **Scaffold:** `spicetify-creator` (tool dari FlafyDev) untuk boilerplate React + TypeScript + build step
- **Monorepo:** Turborepo untuk orchestrasi build lint typecheck antar package
- **Framework UI:** React 18 via `Spicetify.React` (tidak bundle React dua kali)
- **Storage:** `Spicetify.LocalStorage` API untuk persistensi lokal
- **Playback Data:** `Spicetify.Player` API untuk track ID, posisi playback, seek, dan track change
- **Keyboard:** `Spicetify.Mousetrap` untuk bind shortcut
- **UI Components:** Custom CSS variables mengikuti Spicetify theme tokens agar kompatibel dengan semua tema

### Struktur Monorepo (Turborepo)
```
songwriters-pad/
├── apps/
│   └── extension/          # entrypoint spicetify extension, hasil build jadi 1 file JS
├── packages/
│   ├── core/               # note schema, storage layer, timestamp utils, export logic
│   │   ├── src/
│   │   │   ├── schema.ts       # tipe Note, SCHEMA_VERSION
│   │   │   ├── storage.ts      # wrapper Spicetify.LocalStorage
│   │   │   ├── player.ts       # wrapper Spicetify.Player (getProgress, seek, onTrackChange)
│   │   │   └── export.ts       # export txt/md + backup/restore JSON
│   ├── ui/                 # komponen React: NoteCard, NotePanel, QuickAddBar, TagChip
│   └── config/             # shared tsconfig, eslint config
├── turbo.json              # pipeline build, lint, typecheck, dev
├── package.json            # workspaces root
└── README.md
```

**Justifikasi monorepo:** v1.0 ini cuma 1 ekstensi, jadi Turborepo secara teknis optional. Tapi pembagian `core` vs `ui` dipakai karena: (1) logic storage dan export itu pure TypeScript, gampang di-unit-test tanpa Spotify, (2) kalau nanti lu nambah project (web showcase, ekstensi kedua, atau CLI tool), struktur ini udah siap, (3) `packages/config` bikin tsconfig konsisten.

### Key API Calls (SUDAH DIKOREKSI)
```typescript
// Ambil posisi playback saat ini (ms)
const positionMs = Spicetify.Player.getProgress();

// Ambil track data aktif
const track = Spicetify.Player.data.track;          // lagu biasa
const item  = Spicetify.Player.data.item;           // episode podcast, dll
const trackUri = track.uri;                          // key utama storage

// Seek ke posisi (playback state tidak berubah)
Spicetify.Player.seek(positionMs);

// Deteksi track change
Spicetify.Player.addEventListener("songchange", () => {
  const trackUri = Spicetify.Player.data.track.uri;
  loadNotesFor(trackUri);
});

// Storage: API yang BENAR adalah setItem/getItem, BUKAN set/get
via ls() fallback wrapper(`swp:notes:${trackUri}`, JSON.stringify(notes));
const raw = Spicetify.LocalStorage.getItem(`swp:notes:${trackUri}`);

// Keyboard shortcut
Spicetify.Mousetrap.bind("ctrl+shift+n", togglePanel);
```

### Catatan Shortcut Keyboard
`Ctrl+Shift+W` **TIDAK DIPAKAI** karena konflik dengan shortcut bawaan Chromium (close window), dan Spotify desktop itu Chromium-based. Shortcut default: `Ctrl+Shift+N`. Shortcut ini bisa dikonfigurasi user di pengaturan ekstensi (disimpan di LocalStorage).

### Data Schema & Versioning (BARU di v1.1)
```typescript
// packages/core/src/schema.ts
export const SCHEMA_VERSION = 1;

export type NoteTag = "lyric" | "melody" | "chord" | "vibe";

export interface Note {
  id: string;            // uuid
  trackUri: string;      // spotify:track:xxxxx
  positionMs: number;    // timestamp dalam lagu
  text: string;
  tag: NoteTag;
  createdAt: number;     // epoch ms
  updatedAt: number;     // epoch ms
}

// Storage layout:
// swp:schemaVersion  -> "1"
// swp:notes:{trackUri} -> JSON Note[]
// swp:settings         -> JSON { shortcut, defaultTag, panelWidth }
```
Semua migrasi schema nanti lewat fungsi `migrate()` yang baca `swp:schemaVersion` lalu transform. Ini wajib ada dari hari pertama biar v2 gampang.

### Panel Extension Point
Panel dirender via **Panel API Spicetify** (nempel di right sidebar bawaan Spotify) bukan div fixed position manual. Alasan: ikut resize behavior Spotify, otomatis rapi di semua ukuran window, dan kompatibel dengan tema. Topbar button pakai `Spicetify.Topbar`.

### Update Mechanism (BARU di v1.1)
- User install/update manual: copy hasil build ke folder Extensions, lalu `spicetify apply`
- README wajib berisi: cara install, cara update, cara uninstall, cara backup sebelum update
- Ekstensi menampilkan versi di footer panel (baca dari manifest)
- Tidak ada auto-update checker di v1.0 (masuk v2)

### Dependencies
- Spicetify CLI v2.36+ (minimum, pin versi di README)
- React 18 (via Spicetify.React, jangan bundle sendiri)
- Node 20+, pnpm (Turborepo works best with pnpm)
- Tidak ada external API, tidak butuh internet saat runtime

### Risiko Teknis
| Risiko | Likelihood | Mitigasi |
|---|---|---|
| Spicetify API breaking change | Medium | Pin ke versi Spicetify tertentu di README, ikuti changelog, wrapper semua pemanggilan API di packages/core/player.ts supaya refactor cuma sentuh 1 file |
| LocalStorage limit (5MB) | Low | Notes adalah teks kecil, praktis tidak akan kena limit sampai ribuan notes. Tetap kasih try-catch dengan pesan error yang jelas |
| Kompatibilitas tema Spicetify | Medium | Gunakan CSS variables dari theme tokens Spicetify, jangan hardcode warna |
| Spotify update ngebreak Spicetify | High | Di luar kontrol, disclaimer di README |

---

## 9. Design & UX Requirements

### Prinsip Desain
- **Non-interruptive:** Panel tidak boleh pause lagu, tidak boleh full-screen override
- **Contextual:** Notes langsung keliatan saat lagu yang sama diputar
- **Minimal Chrome:** Songwriter butuh fokus, UI harus invisible ketika tidak dibutuhkan

### UI Components
- **Trigger button:** Icon pena kecil di Spicetify top bar, badge counter kalau ada notes
- **Notes panel:** Panel API right sidebar, lebar 320px, bisa di-collapse
- **Note card:** Chip timestamp (clickable) + tag chip + teks + action icons (edit/delete) on hover
- **Quick-add bar:** Di bawah panel, text input dengan timestamp auto-filled, tag selector

### Accessibility
- Keyboard navigable penuh
- High contrast mode supported via CSS variables
- Tidak ada animasi berlebihan (ikuti `prefers-reduced-motion`)

---

## 10. Timeline & Milestones

| Milestone | Target | Deliverable |
|---|---|---|
| M0: Setup | Minggu 1 | Turborepo + spicetify-creator scaffold jalan, tombol topbar muncul di Spotify |
| M1: Core MVP | Minggu 2-3 | Create, read, timestamp notes; local storage; songchange listener |
| M2: Seek + Tags | Minggu 4 | Clickable timestamp, tag system, filter |
| M3: Export + Backup | Minggu 5 | Export per lagu, backup/restore JSON, UI polish |
| M3.5: Mode Memory | Minggu 5.5 | Mode switcher, Memory tags (Person, Moment, dsb), Memory Card Export |
| M4: Beta Release | Minggu 6 | README, preview image, manifest, PR ke spicetify/marketplace |

### Proses Publish yang Benar (SUDAH DIKOREKSI)
"Spicetify Community Showcase" bukan nama resmi. Proses publish:
1. Push repo ke GitHub (public), tag release
2. Siapkan: README lengkap, preview image/gif, manifest file
3. Buat PR ke repo `spicetify/marketplace` (menambahkan manifest ke folder yang sesuai)
4. Setelah merge, ekstensi muncul di Marketplace tab Spicetify dan bisa di-install sekali klik

---

## 11. Risks & Mitigation

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Spicetify ecosystem berubah | High | Semua pemanggilan API di-wrapper di packages/core, refactor cuma sentuh 1 file |
| Low adoption karena niche | Medium | Launch di r/songwriting, r/spicetify, komunitas Discord Spicetify, Twitter #spicetify |
| User data hilang karena clear storage | High | US-007: backup/restore JSON + warning di README |
| Kompetitor build hal serupa | Low | Speed to market; v1.0 perlu keluar dalam 6 minggu |
| Turborepo complexity untuk solo dev | Low | Config minimal di turbo.json, task cuma build lint typecheck dev. Kalau terasa berat, monorepo bisa di-simplify jadi single app tanpa kehilangan packages/ structure |

---

## 12. Open Questions (tersisa)

1. Format export per lagu: plain .txt lebih universal, tapi .md lebih rich. Rekomendasi: dukung keduanya, dropdown di tombol export. Keputusan final saat M3.
2. Apakah perlu onboarding tooltip saat pertama install? Rekomendasi: ya, sekali saja, disimpan flag di LocalStorage.
3. Konfigurasi shortcut: user bisa ganti shortcut sendiri, atau fixed? Rekomendasi: bisa dikonfigurasi, simpan di swp:settings.
4. Keputusan Strategis Penamaan (Naming): "Songwriter's Pad" menargetkan market kecil. Dengan adanya "Memory Mode", target pasar meluas tajam. Apakah perlu re-branding menjadi nama yang inklusif untuk kedua mode (misal: "SongNotes" atau "Liner Notes")? Keputusan ini harus ditetapkan sebelum rilis M4 agar marketing dan publikasi sinkron.

---

## 13. Dependencies & Assumptions

**Assumptions:**
- Target user sudah familiar dengan Spicetify dan cara install extension
- User menggunakan Spotify versi desktop (bukan web player)
- User tidak expect cloud sync di v1.0

**Dependencies:**
- Spicetify CLI installed dan berjalan di mesin user
- Spotify desktop app tidak dalam versi yang membreak Spicetify (di luar kontrol kita)
- Node 20+, pnpm 9+

### Notes on Keyboard Shortcuts
Default shortcuts (like Ctrl+Shift+.) must be checked against Spotify's reserved list. In v2, provide a UI for users to customize the shortcut directly.
