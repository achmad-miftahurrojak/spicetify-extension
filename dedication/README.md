# Dedication

A Spicetify extension pair that lets users send song dedications to friends directly inside Spotify. Recipients get a notification and a postcard view with album art, message, and sender info.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)

## Features

- Right-click any track to send a dedication to a friend.
- Friend identification via a unique shareable code (format: `XXXX-XXXX`).
- Address book to save frequently contacted friends with avatar initials.
- Quick Send button directly from the address book, no right-click needed.
- Inbox view with album art, sender avatar pulled from Spotify profile, and message preview.
- Full postcard modal when opening a dedication.
- Delete dedications from either side (sender or recipient).
- Zero track metadata fetching at inbox render time -- all data is captured at send time.

## How It Works

Both parties need this extension installed. The sender adds the recipient's friend code to their address book, right-clicks a playing track, and selects **Send Dedication**. The dedication is stored in Firebase Realtime Database and appears in the recipient's Inbox tab.

```
Sender                         Firebase                        Recipient
  |                                |                               |
  |-- right-click track ---------->|                               |
  |-- payload with metadata ------>|                               |
  |                                |<-- listens for new docs ------|
  |                                |--- pushes to inbox ---------->|
```

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

The build output produces two files:

- `apps/dedication-extension/dist/dedication.js` -- the background extension
- `apps/dedication-app/dist/index.js` -- the custom app (Inbox + Address Book UI)

### Manual Installation

```bash
# Get your Spicetify directory
spicetify config-dir

# Copy the extension
cp songwriters-pad/apps/dedication-extension/dist/dedication.js "<spicetify-dir>/Extensions/"

# Copy the custom app
mkdir -p "<spicetify-dir>/CustomApps/dedications"
cp songwriters-pad/apps/dedication-app/dist/index.js "<spicetify-dir>/CustomApps/dedications/"
cp songwriters-pad/apps/dedication-app/manifest.json "<spicetify-dir>/CustomApps/dedications/"

# Register and apply
spicetify config extensions dedication.js
spicetify config custom_apps dedications
spicetify apply
```

## Usage

1. Share your friend code from the **Your Code** section in the Dedications tab.
2. Add a friend's code in the **Address Book** section.
3. Play a track, then right-click it and select **Send Dedication**, or click **Send** directly from a saved friend's card.
4. The recipient sees the dedication in their **Inbox** tab.

## Project Structure

The source lives inside the `songwriters-pad` monorepo to share build tooling:

```
songwriters-pad/
  apps/
    dedication-extension/   Background extension (context menu, send logic)
    dedication-app/         Custom app (Inbox, Address Book UI)
  packages/
    transport/              Firebase client shared between extension and app
```

## License

This project is licensed under the [MIT License](../LICENSE).

Disclaimer: Spicetify modifies the Spotify client, which may violate Spotify's Terms of Service. Use at your own risk. Spotify client updates may break functionality.
