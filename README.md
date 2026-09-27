<div align="center">

# Spicetify Extensions

<a href="README.md"><img alt="English" src="https://img.shields.io/badge/English-DFE0E5"></a> <a href="README.id.md"><img alt="Bahasa Indonesia" src="https://img.shields.io/badge/Bahasa%20Indonesia-DFE0E5"></a> <a href="README.ko.md"><img alt="한국어" src="https://img.shields.io/badge/%ED%95%9C%EA%B5%AD%EC%96%B4-DFE0E5"></a>

<img alt="Spicetify" src="https://img.shields.io/badge/Spicetify-1DB954?logo=spotify&logoColor=white"> <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">

Small Spotify interface extensions and themes, each installable on its own.

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
