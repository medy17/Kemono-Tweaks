# Kemono Tweaks & Player

A userscript that enhances [Kemono](https://kemono.su) and [Coomer](https://coomer.su) with a beautiful glassmorphism media player and improved post title display.

## Features

- 🎵 **Audio Player** - Plays audio files in a sleek modal with download progress
- 🎬 **Video Player** - Optional video playback (toggle via Tampermonkey menu)
- 📝 **Full Titles** - Preserves full post titles without truncation
- 🎨 **Glassmorphism UI** - Modern, blurred glass aesthetic
- ⌨️ **Keyboard Shortcuts** - Space (play/pause), M (mute), F (fullscreen), Arrow keys (seek)
- 📥 **Download** - Direct download button for media files

## Installation

### For Users
1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Install the userscript from [Greasyfork](https://greasyfork.org/) (link TBD)

### For Development
```bash
# Install dependencies
bun install

# Build (with file watching)
bun run dev

# Build for production
bun run build

# Lint
bun run lint

# Format
bun run format

# Type check
bun run typecheck
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── config.ts             # Configuration & GM menu commands
├── player/
│   ├── MediaPlayer.ts    # Main player class
│   ├── template.ts       # HTML template
│   └── icons.ts          # SVG icons
├── styles/
│   ├── base.css          # Host page modifications
│   └── player.css        # Player styles (Tailwind)
└── utils/
    └── shim.ts           # Title preservation shim
```

## Development

The project uses:
- **Vite** + **vite-plugin-monkey** for userscript bundling
- **TypeScript** for type safety
- **Tailwind CSS** with `kt-` prefix to avoid conflicts with host pages
- **ESLint** + **Prettier** for code quality

Build output is in `dist/kemono-tweaks.user.js` — install this file in Tampermonkey during development.

## License

MIT
