# Growing

Growing was a personal macOS menu bar app for growth tracking, daily accountability, and lightweight work capture.
It was built with Tauri v2, React 19, and TypeScript.

This repository is archived. The app reached its useful endpoint for my workflow around `v1.5.2`; ongoing work moved
toward terminal-based agentic development and external scratch/review workflows.

## Final Feature Set

- **Today dashboard** - Daily overview with Apple Music, tasks, questions, reviews, ATC state, and shortcuts.
- **Daily tasks** - Date-based task planning, carry-forward, backlog deferral, drag-and-drop ordering, and completion
  celebrations.
- **Task categories** - Personal/work badges and filters for daily tasks.
- **Eat the Frog** - One priority task per day with draggable frog indicator.
- **Task timeboxes and timers** - Full-screen focus overlay plus flexible named timers.
- **Backlog** - Unscheduled task list for future planning.
- **Goals** - Ongoing, quarterly, and monthly goals with progress tracking.
- **Quick notes** - Timestamped note capture with markdown rendering.
- **Questions** - Persistent scratch pad for open questions on the Today dashboard.
- **Brag doc** - Accomplishment log with images and links.
- **Curiosities** - Learning backlog with completion tracking.
- **Reviews** - PR review log with GitHub and Graphite link parsing, re-review tracking, and daily counts.
- **1-1s** - Manager or peer meeting notes with cadence tracking, rescheduling, and archived sessions.
- **Pear Programming** - CRT terminal-themed pairing session tracker with partner folders, shell-style note entry,
  session timer, and follow-up task creation.
- **Scratches** - Filesystem-backed markdown scratch-note browser with moleskine notebook styling.
- **Weekly Recap** - Field notebook-themed viewer for externally generated weekly recap JSON files.
- **Apple Music** - Rich Now Playing widget with artwork, progress, and transport controls.
- **MCP server** - Local HTTP MCP server exposing app data to LLM clients.
- **Settings** - Themes, dark mode, launch at login, notifications, Apple Music, MCP, weekly recap, and scratches.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Rust + Tauri v2 |
| Frontend | React 19 + TypeScript |
| Build | Vite |
| Data | JSON in the app data directory |

## Development

### Prerequisites

- Node.js 18+
- Rust via [rustup](https://rustup.rs)
- Xcode Command Line Tools on macOS

### Setup

```bash
npm install
```

### Run Development

```bash
npm run tauri dev
```

Notifications only work in release builds.

### Type Check

```bash
npx tsc --noEmit
```

### Build Production

```bash
npm run tauri build
```

### Install to Applications

```bash
npm run install-app
```

## Data Storage

Data is stored in the app's local data directory:

- macOS: `~/Library/Application Support/com.christoflurp.growing/`

Files:

- `data.json` - App data, including tasks, goals, notes, settings, pairing sessions, and recaps configuration.
- `images/` - Brag doc image attachments.
- `backups/` - Daily automatic backups.

## Archival Notes

The final release is `v1.5.2`. It captures the last functional app state plus documentation and repository hygiene
updates before archiving. No new feature work is expected in this repository.

## License

MIT
