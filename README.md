# Growing

A personal Mac menu bar app for tracking growth goals and daily accountability. Built with Tauri v2, React 19, and TypeScript.

## Features

- **Daily Tasks** - Plan your day with tasks linked to goals, carry forward incomplete items
- **Task Categories** - Tag tasks as Personal or Work with visual badges
- **Eat the Frog** - Mark one priority task per day with draggable frog indicator
- **Task Timebox** - Full-screen focus overlay blocks distractions during timeboxed work
- **Custom Timers** - Flexible timers with optional naming for any timed activity
- **Drag & Drop** - Reorder tasks by dragging to prioritize your day
- **Backlog** - Unscheduled task list for future work, schedule items when ready
- **Goals Tracking** - Organize goals by period (ongoing/quarterly/monthly) with progress visualization
- **Curiosities** - Track things you want to learn with completion status
- **Reviews** - Log PR reviews with auto-parsed GitHub links and daily count
- **Quick Notes** - Capture thoughts instantly with Cmd+Enter
- **Brag Doc** - Document accomplishments with image attachments and links
- **Quick Add** - Dropdown menu (+) to add tasks, notes, reviews, or curiosities from any page
- **Apple Music** - Rich widget with artwork, progress bar, and transport controls
- **Stand/Sit Reminders** - Configurable alerts to alternate between sitting and standing
- **Scheduled Notifications** - Daily and weekly reminder notifications
- **Themes** - Four distinct themes (Editorial, Obsidian, Paper, Grove) plus dark mode
- **Menu Bar App** - Lives in system tray, no dock icon clutter
- **Daily Backups** - Automatic backups with corruption recovery
- **Global Hotkey** - Cmd+Shift+G to show window from anywhere
- **Launch at Login** - Optional auto-start on macOS login
- **Celebrations** - Confetti animation when all daily tasks are completed

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust + Tauri v2 |
| Frontend | React 19 + TypeScript |
| Build | Vite |
| Data | JSON (app data directory) |

## Development

### Prerequisites

- Node.js 18+
- Rust (install via [rustup](https://rustup.rs))
- Xcode Command Line Tools (macOS)

### Setup

```bash
npm install
```

### Run Development

```bash
npm run tauri dev
```

Note: Notifications only work in release builds.

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
- `data.json` - All user data (tasks, goals, notes, settings)
- `images/` - Brag doc image attachments
- `backups/` - Daily automatic backups (last 7 days retained)

## License

MIT
