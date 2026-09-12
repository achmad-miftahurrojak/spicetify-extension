# Songwriter's Pad

A Spicetify extension designed to capture timestamped lyrics, melodies, chords, and memories directly within the Spotify interface.

![Build Status](https://img.shields.io/github/actions/workflow/status/achmad-miftahurrojak/achmad-miftahurrojak/release.yml?branch=main)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Table of Contents

* [Features](#features)
* [Screenshots](#screenshots)
* [Installation](#installation)
* [Usage](#usage)
* [Monorepo Structure](#monorepo-structure)
* [API Reference](#api-reference)
* [Contributing](#contributing)
* [License](#license)
* [Acknowledgments](#acknowledgments)

## Features

* **Timestamped Notes**: Attach ideas to specific moments in a playback track.
* **Dual Modes**: Alternate between Creator mode for songwriting purposes (lyrics, chords, melodies) and Memory mode for personal moments.
* **Export to Image**: Render and export notes as high quality images for social media sharing.
* **Cross-Song Filtering**: View and filter notes by tags or associated individuals across multiple tracks.
* **Ad Blocker Logic**: Automatically hides the user interface components during advertisements.
* **Local Storage**: Data is stored locally via the Spicetify API to ensure privacy and optimal performance.

## Screenshots

*(Insert preview image or GIF here)*

## Installation

### Prerequisites

* Node.js 20 or higher
* pnpm 9 or higher
* Spicetify CLI v2.36 or higher
* Spotify Desktop Application

### Getting Started

```bash
git clone https://github.com/achmad-miftahurrojak/spicetify-extension.git
cd spicetify-extension/songwriters-pad
pnpm install
pnpm build
```

### Install via Spicetify Marketplace

Once the extension is approved in the marketplace:
1. Open Spicetify Marketplace within Spotify.
2. Search for "Songwriter's Pad".
3. Click Install.

### Manual Installation

Spicetify loads local extensions from its internal Extensions directory by file name. Absolute paths are not supported.

```bash
# Locate your Spicetify directory
spicetify config-dir

# Copy the built file into the Extensions directory
cp apps/extension/dist/songwriters-pad.js "<spicetify-directory>/Extensions/"

# Register the extension by file name
spicetify config extensions songwriters-pad.js
spicetify apply
```

Restart Spotify to apply the changes.

## Usage

A pen icon will appear in the top bar of the Spotify interface. You can also use the keyboard shortcut `Ctrl+Shift+.` to toggle the focus.

To create a note, play a track, select your desired mode (Creator or Memory), and begin typing. The note will be pinned to the current playback timestamp.

## Monorepo Structure

* `apps/extension`: The entrypoint that builds into a single JavaScript file loaded by Spicetify.
* `packages/core`: Contains pure logic including schema definitions, storage utilities, player wrappers, and export logic.
* `packages/ui`: Contains React components such as NotePanel, NoteCard, QuickAddBar, and TagChip.
* `packages/config`: Contains shared configurations for TypeScript and ESLint.

The `packages/core` and `packages/ui` directories are strictly separated. Only `apps/extension` connects them. All Spicetify API interactions are isolated in `packages/core/player.ts` and `packages/core/storage.ts`.

## API Reference

The extension relies on internal Spicetify APIs. For full documentation regarding Spicetify extension development, refer to the [Spicetify Documentation](https://spicetify.app/docs/development/extension).

## Contributing

1. Create a backup of your notes via the extension panel.
2. Pull the latest changes.
3. Run `pnpm install` and `pnpm build`.
4. Apply the changes with `spicetify apply`.

To publish a new version to the Spicetify Marketplace:
1. Save a `preview.gif` or `preview.png` in the repository root demonstrating the functionality.
2. Tag a release on GitHub. The automated workflow will handle the build process.
3. Open a pull request to the `spicetify/marketplace` repository to add the `manifest.json`.

## License

This project is licensed under the [MIT License](LICENSE).

Disclaimer: Spicetify modifies the Spotify client, which violates the Spotify Terms of Service. Use at your own risk. Spotify client updates may temporarily break functionality.

## Acknowledgments

Built by Hamin. Thanks to the Spicetify community for the tools and inspiration.
