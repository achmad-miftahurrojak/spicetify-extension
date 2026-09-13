# Songwriter's Pad

A Spicetify extension for capturing timestamped notes directly inside Spotify. Attach lyrics, chord progressions, melody ideas, and personal memories to specific moments in a track.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Timestamped notes pinned to the exact playback position of any track.
- Two modes: Creator (lyrics, chords, melody) and Memory (personal moments).
- Export notes as high-quality images for sharing.
- Filter and search notes by tag or associated person across multiple tracks.
- Ad blocker logic that automatically hides the panel during advertisements.
- All data is stored locally via the Spicetify LocalStorage API.

## Installation

### Prerequisites

- Node.js 20 or higher
- pnpm 9 or higher
- Spicetify CLI v2.36 or higher
- Spotify Desktop Application

### Build from Source

```bash
git clone https://github.com/achmad-miftahurrojak/spicetify-extension.git
cd spicetify-extension/songwriters-pad
pnpm install
pnpm build
```

### Manual Installation

```bash
# Locate your Spicetify directory
spicetify config-dir

# Copy the built extension file
cp apps/extension/dist/songwriters-pad.js "<spicetify-dir>/Extensions/"

# Register the extension
spicetify config extensions songwriters-pad.js
spicetify apply
```

Restart Spotify to apply changes.

## Usage

A pen icon appears in the Spotify top bar after installation. Use the keyboard shortcut `Ctrl+Shift+.` to toggle the note panel.

To create a note, play a track, select a mode (Creator or Memory), and start typing. The note is saved to the current playback timestamp automatically.

## Project Structure

```
songwriters-pad/
  apps/
    extension/          Entrypoint that bundles into a single JS file for Spicetify
  packages/
    core/               Storage, player wrappers, schema definitions, and export logic
    ui/                 React components (NotePanel, NoteCard, QuickAddBar, TagChip)
    config/             Shared TypeScript and ESLint configuration
```

Only `apps/extension` connects `packages/core` and `packages/ui`. All Spicetify API calls are isolated in `packages/core/player.ts` and `packages/core/storage.ts`.

## Contributing

1. Back up your notes using the export feature in the extension panel.
2. Pull the latest changes from the repository.
3. Run `pnpm install` and `pnpm build`.
4. Copy the updated file and run `spicetify apply`.

## License

This project is licensed under the [MIT License](../LICENSE).

Disclaimer: Spicetify modifies the Spotify client, which may violate Spotify's Terms of Service. Use at your own risk. Spotify client updates may break functionality.

## Acknowledgments

Built by Hamin. Thanks to the Spicetify community for the tools and documentation.

