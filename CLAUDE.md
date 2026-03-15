# CLAUDE.md — media-player

## What This Is

A full-featured MKV/MP4 video player (`@banou/media-player`) that uses libav-wasm for in-browser FFmpeg remuxing and the MediaSource Extensions API for streaming playback. Supports ASS/SSA subtitles, chapter navigation, keyframe thumbnail previews, and keyboard shortcuts.

## Commands

- `npm run build` — Production build (Vite → `build/index.js`)

## Code Style

- See root [CLAUDE.md](../fkn-dev/CLAUDE.md) for general conventions (2-space indent, no semicolons, single quotes, no trailing commas)
- **Framework:** React 19
- **Styling:** Emotion CSS-in-JS with `css` template tag
- **State:** XState 5 with parallel actor model

## Architecture

### XState Actor Model
The player is driven by parallel XState actors, each handling an independent concern:

```
media (orchestrator machine)
├── data-source      — libav-wasm remuxer lifecycle (init, read, seek, keyframes)
├── media-source     — MediaSource API buffer management (append, evict, SourceBuffer)
├── media-properties — HTML5 <video> element control (play, pause, time, volume)
├── subtitles        — JASSUB subtitle rendering (ASS/SSA parsing, font loading)
└── thumbnails       — Keyframe extraction at 5s intervals for progress bar preview
```

- `src/state-machines/media.ts` — main orchestrator
- `src/state-machines/data-source.ts` — libav-wasm integration, throttled chunk loading
- `src/state-machines/media-source.ts` — MSE buffer lifecycle, serialized via p-queue
- `src/state-machines/media-properties.ts` — wraps native video element events
- `src/state-machines/subtitles.ts` — JASSUB instance management
- `src/state-machines/thumbnails.ts` — keyframe extraction queue

### Buffer Management
- **Pre-eviction:** 20s before current playback position
- **Post-eviction:** 60s after current position
- **Buffer target:** 30s ahead of current position
- Operations serialized through `p-queue` (concurrency: 1)

### Playback Pipeline
```
App provides read() function (Range requests, torrent pieces, etc.)
    ↓
libav-wasm.makeRemuxer() — FFmpeg demux/remux in Worker
    ↓ remuxed MP4 chunks
MediaSource API — SourceBuffer append/evict
    ↓
<video> element — native browser decode & render
    ↓
JASSUB canvas overlay — subtitle rendering
```

### Async Patterns
- `fromAsyncCallback` — custom XState adapter for async WASM operations
- `queuedThrottleWithLastCall` — runs immediately, queues latest call (100ms throttle)
- p-queue for serialized buffer operations

## Key Directories

```
src/
├── index.tsx              # Main <MediaPlayer> component export (195 lines)
├── main.tsx               # Demo mount point (170 lines)
├── components/
│   ├── chrome.tsx          # Player shell — manages UI visibility (3s auto-hide)
│   ├── control-bar.tsx     # Play/pause, volume, playback rate, fullscreen, settings
│   ├── progress-bar.tsx    # Timeline with loaded ranges, thumbnails on hover, scrubbing
│   └── overlay.tsx         # Canvas for subtitle rendering, video title display
└── state-machines/
    ├── media.ts            # Orchestrator — spawns all other actors
    ├── data-source.ts      # libav-wasm remuxer lifecycle
    ├── media-source.ts     # MSE SourceBuffer management
    ├── media-properties.ts # HTML5 video element wrapper
    ├── subtitles.ts        # JASSUB subtitle rendering
    └── thumbnails.ts       # Keyframe extraction for preview
```

## Keyboard Shortcuts

- `k` / `Space` — play/pause
- `f` — toggle fullscreen
- `m` — toggle mute
- `←` / `→` — seek -5s / +5s
- `↑` / `↓` — volume up/down

## Gotchas

- WASM files for libav-wasm and jassub must be copied to build output by consuming apps
- The player is exported as an ES module library with all dependencies externalized
- Volume uses logarithmic scaling (amplitude = volume²)
- Subtitle fonts are extracted from media file attachments and loaded into JASSUB
