<div align="center">

# Spicetify Extensions

[English](README.md) · [Bahasa Indonesia](README.id.md) · [한국어](README.ko.md)

Small Spotify interface extensions and themes, each installable on its own.

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Spicetify](https://img.shields.io/badge/Spicetify-Extensions-1DB954?logo=spotify&logoColor=white)

[Extensions](#extensions) · [Requirements](#requirements) · [Development](#development) · [License](#license)

</div>

---

## Extensions

| Project | Description | Open |
| --- | --- | --- |
| [Songwriter's Pad](songwriters-pad/) | Capture timestamped lyrics, chords, and memories inside Spotify. | [README](songwriters-pad/README.md) |
| [Dedication](dedication/) | Send song dedications with a message and postcard view. | [README](dedication/README.md) |
| [Spiceflow](Spiceflow/) | Add sidebar hover effects with a lightweight custom theme. | [README](Spiceflow/README.md) |

Each project keeps its own source, build instructions, and installation files.

## Requirements

- [Spicetify CLI](https://spicetify.app/docs/getting-started) 2.36 or later
- Spotify Desktop
- Node.js 20+ and pnpm 9+ for projects that require a build

## Development

Choose an extension, then follow its local README. For the monorepo project:

```bash
cd songwriters-pad
pnpm install
pnpm build
```

Keep generated bundles, manifests, and installation scripts aligned when changing an extension. Test the result in a separate Spotify profile before applying it to a daily setup.

## Project layout

```text
songwriters-pad/  # Built extension workspace
dedication/       # Dedication documentation and assets
Spiceflow/        # Theme files and installers
```

## License

[MIT](LICENSE)

Spicetify changes the Spotify client and client updates can break extensions. Use these projects with that limitation in mind.
