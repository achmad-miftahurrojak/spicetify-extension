# Songwriter's Pad

Timestamped creative notes inside Spotify. Capture lyric, melody, chord, and vibe ideas pinned to the exact second of a track. Built as a Spicetify extension.

## Monorepo Structure

```
apps/extension     Entrypoint, builds into a single JS file loaded by Spicetify
packages/core      Pure logic: schema, storage, player wrapper, export/backup
packages/ui        React components (NotePanel, NoteCard, QuickAddBar, TagChip)
packages/config    Shared tsconfig + eslint
```

`packages/core` and `packages/ui` never import each other. Only `apps/extension` wires them together. All Spicetify API calls live in `packages/core/player.ts` and `packages/core/storage.ts`, so a Spicetify breaking change only touches two files.

## Prerequisites

- Node 20+, pnpm 9+
- Spicetify CLI v2.36+
- Spotify desktop app

## Setup

```bash
pnpm install
```

## Build

```bash
pnpm build
```

Output: `apps/extension/dist/songwriters-pad.js`

## Install (Spicetify Marketplace)

Once approved in the marketplace:
1. Open Spicetify Marketplace in Spotify.
2. Search for "Songwriter's Pad".
3. Click Install.

## Install (Manual / Local Dev)

Spicetify loads local extensions from its own Extensions folder by FILE NAME.
Absolute paths do NOT work (they are injected as script URLs and fail with
net::ERR_NAME_NOT_RESOLVED).

```bash
# find the spicetify folder (usually C:\Users\<you>\.spicetify)
spicetify config-dir

# copy the built file into the Extensions folder inside it
cp apps/extension/dist/songwriters-pad.js "<spicetify folder>/Extensions/"

# register by file NAME only
spicetify config extensions songwriters-pad.js
spicetify apply
```

Restart Spotify. A pen icon appears in the top bar. Shortcut: `Ctrl+Shift+.`.

Optional: set SPICETIFY_EXTENSIONS to your Extensions folder path to auto-copy
on every build (see build.mjs header).

## Dev mode (watch rebuild)

```bash
pnpm dev
```

esbuild watches and rebuilds `dist/songwriters-pad.js`. After each rebuild, restart Spotify or run `spicetify apply` again to reload the extension.

## Uninstall

```bash
spicetify config extensions songwriters-pad.js --
spicetify apply
```

Then delete `songwriters-pad.js` from the Spicetify Extensions folder.

## Update

1. Backup your notes first: open the panel, Export, then Backup All (JSON).
2. `git pull`, `pnpm install`, `pnpm build`.
3. `spicetify apply`.

## Publish to Spicetify Marketplace

1. Record a 30-60 second `preview.gif` or capture a `preview.png` showing the extension in action (adding a note, seeking, editing). Save it to the root of the repository.
2. Tag a release on GitHub. The `.github/workflows/release.yml` action will automatically build and commit the `dist` output.
3. Open a PR to `spicetify/marketplace` adding this repository's `manifest.json` to their extensions manifest list.

## Disclaimer

Spicetify modifies the Spotify client, which violates Spotify's ToS. Use at your own risk. Spotify updates can break Spicetify; this is outside our control.

## License

MIT
