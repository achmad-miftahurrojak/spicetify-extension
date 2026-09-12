# CLAUDE.md

## Project Overview

Songwriter's Pad: a Spicetify extension that lets users capture timestamped creative notes
(lyric, melody, chord, vibe) pinned to the exact millisecond of a Spotify track.
Monorepo managed by Turborepo, package manager pnpm.

## Tech Stack

- React 18 (runtime provided by Spicetify as `Spicetify.React` / `Spicetify.ReactDOM`, NEVER bundle React)
- TypeScript, strict mode
- Turborepo + pnpm workspaces
- esbuild (apps/extension/build.mjs) for the final single-file bundle
- Storage: `Spicetify.LocalStorage`

## Project Structure

```
apps/extension/     Entrypoint. Bundles into ONE file: dist/songwriters-pad.js loaded by Spicetify.
packages/core/      Pure logic: schema, storage, player wrappers, export/backup. No React imports.
packages/ui/        React components: NotePanel, NoteCard, QuickAddBar, TagChip.
packages/config/    Shared tsconfig.
```

Dependency rule: only `apps/extension` may import from both `@swp/core` and `@swp/ui`.
`core` and `ui` never import each other. `ui` imports types/logic from `core` only.

## Hard Rules (do not violate)

1. ALL Spicetify API calls MUST live in `packages/core/src/player.ts` and
   `packages/core/src/storage.ts`. If Spicetify breaks its API, only these two files change.
2. Use `ls()` fallback wrapper for storage (NOT `Spicetify.LocalStorage` directly).
3. NEVER bundle React. Components use `React.createElement` via the shim
   `packages/ui/src/react.ts` (jsxFactory is set to `Spicetify.React.createElement` in build.mjs).
4. NEVER hardcode colors. Use Spicetify theme CSS variables: `var(--spice-main)`,
   `var(--spice-text)`, `var(--spice-subtext)`, `var(--spice-button)`, etc.
5. The extension MUST NOT pause or interrupt playback when the panel opens.

## Key Design Decisions

- Storage keys: `swp:schemaVersion`, `swp:notes:{trackUri}`, `swp:settings`, `swp:registry`.
- `swp:registry` holds all track URIs that have notes. Required because Spicetify.LocalStorage
  has no stable key-enumeration API; backupAll() relies on the registry. Always call
  `registerTrack()` when saving notes.
- SCHEMA_VERSION is 1. Any format change to Note must bump it and add a migration path in
  `packages/core/src/schema.ts`.
- Track change detection: `Spicetify.Player.addEventListener("songchange", ...)` PLUS a 2s
  polling fallback, because songchange does not fire reliably across Spicetify versions.
  Both are encapsulated in `onTrackChange()` in player.ts.
- Panel renders as a fixed div (top 64px, right 0, 320px). Spicetify Panel API is experimental;
  if adopted later, gate it behind a runtime `Spicetify.Panel` existence check with the div as
  fallback.
- Default shortcut `ctrl+shift+n`. `ctrl+shift+w` is FORBIDDEN (Chromium closes window).
  Shortcut is user-configurable, stored in `swp:settings`.
- Edit/Delete currently use `prompt()` / `confirm()` as placeholders. Replace with inline
  editing in the M3 polish milestone; keep the component prop signatures unchanged.

## Build and Run

```bash
pnpm install
pnpm build          # outputs apps/extension/dist/songwriters-pad.js
pnpm dev            # esbuild watch mode
# copy dist/songwriters-pad.js into the Spicetify Extensions folder
# (find it with `spicetify config-dir`), then register by FILE NAME only:
spicetify config extensions songwriters-pad.js
spicetify apply
```

CRITICAL: `spicetify config extensions` takes a file NAME inside the Spicetify
Extensions folder, never an absolute path. Absolute paths are injected as script
URLs and fail at runtime with net::ERR_NAME_NOT_RESOLVED. Set the
SPICETIFY_EXTENSIONS env var to auto-copy on every build.

Lint is a placeholder (echo). Add ESLint in a dedicated PR; do not pretend it checks anything.

## Version Compatibility

- Spicetify CLI v2.36+
- Spotify desktop only (Spicetify does not support web player or mobile)

## Reference

Full product spec: `songwriters-pad-prd-v1.1.md` (HEART metrics, user stories US-001..US-007,
6-week milestone plan M0..M4).

- Pastikan entry point extension selalu self-executing (panggil fungsinya) agar tidak terjadi silent failure. Berikan log inisialisasi awal.

7. Spotify reserved shortcuts: Ctrl+Shift+N (New Playlist), Ctrl+Shift+W (Close Window). Always verify shortcut keys don't conflict. v2 needs UI for users to customize settings.
