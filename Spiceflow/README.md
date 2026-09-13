# Spiceflow

A lightweight Spicetify theme that adds smooth hover interactions to the Spotify interface. Sidebar playlist icons and artist icons scale up with a soft shadow on hover, making the interface feel more responsive without changing the overall visual language.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Customization](#customization)
- [License](#license)

## Features

- Smooth scale-up effect on playlist and artist icons in the sidebar on hover.
- Subtle box shadow accompanies the scale to add depth.
- No changes to Spotify's default color scheme unless customized.

## Installation

Spicetify CLI must be installed before proceeding. See [spicetify.app/docs/getting-started](https://spicetify.app/docs/getting-started).

### One-Click Installer

**Windows:** Double-click `install.bat`.

**macOS / Linux:** Open a terminal inside this folder and run:

```bash
sh install.sh
```

The script copies the theme files to the correct Spicetify directory and applies the theme automatically.

### Manual Installation

```bash
# Copy theme files to Spicetify Themes directory
cp color.ini user.css theme.js "$(spicetify config-dir)/Themes/Spiceflow/"

# Set the theme and apply
spicetify config current_theme Spiceflow
spicetify config inject_theme_js 1
spicetify apply
```

## Customization

Spiceflow uses Spotify's default color scheme out of the box. To change colors, edit the hex values in `color.ini`, then run:

```bash
spicetify apply
```

## License

This project is licensed under the [MIT License](../LICENSE).

Disclaimer: Spicetify modifies the Spotify client, which may violate Spotify's Terms of Service. Use at your own risk. Spotify client updates may break functionality.

