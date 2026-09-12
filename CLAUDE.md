
- Pastikan entry point extension selalu self-executing (panggil fungsinya) agar tidak terjadi silent failure. Berikan log inisialisasi awal.

6. NEVER assume Spicetify.LocalStorage exists. Go through the ls() fallback in
   storage.ts. Same for showNotification, Topbar, Mousetrap: always guard with
   typeof checks or try/catch, Spicetify removes/renames APIs between versions.

7. Aturan Tag System: Tag system bersifat mode-dependent. Jangan pernah mencampur tag "Creator" (lyric, melody, chord, vibe) dengan tag "Memory" (person, moment, feeling, place) dalam satu view filter atau urutan. Gunakan TAG_ORDER_CREATOR dan TAG_ORDER_MEMORY.
