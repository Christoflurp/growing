# Growing Flurp

A personal Mac menu bar app for tracking growth goals and accountability. Built with Tauri v2, React, and TypeScript.

## Overview

Growing Flurp is a lightweight menu bar application designed to help track progress against personal development goals. It displays a splash screen on launch, then lives in the system tray for quick access without cluttering the dock.

## Features

### Implemented

- **Menu bar app** - Runs in system tray, no dock icon
- **Splash screen** - Custom image, 50% screen height, centered on active monitor, 2.5s duration
- **Sidebar navigation** - Dashboard, Goals, Notes, Settings views
- **Dashboard** - Progress ring, section cards with mini progress bars, recent notes
- **Goals viewer** - Collapsible sections, checkboxes, inline notes editing
- **Quick notes** - Capture thoughts on the fly, Cmd+Enter to save
- **Progress tracking** - Check off completed items (persisted to disk)
- **Close to tray** - Closing window hides it; app keeps running
- **Scheduled notifications** - Background scheduler for daily/weekly reminders
- **Permission management** - Check and request macOS notification permissions
- **Test notifications** - Send test notification with result feedback

### Planned

- Add/edit/delete items and sections from UI
- Custom tray icon
- Keyboard shortcuts (Cmd+W to hide, etc.)
- Monthly check-in prompts
- Launch at login

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust + Tauri v2 |
| Frontend | React 19 + TypeScript |
| Build | Vite |
| Data | JSON file (local) |

## Project Structure

```
growing-flurp/
├── src/                      # React frontend
│   ├── App.tsx               # Main component (splash + main views)
│   ├── App.css               # All styles
│   └── main.tsx              # Entry point
├── public/
│   └── growing-flurp.png     # Splash screen image
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── lib.rs            # Tauri setup, commands, tray
│   │   └── main.rs           # Entry point
│   ├── tauri.conf.json       # Window config, app metadata
│   ├── Cargo.toml            # Rust dependencies
│   └── icons/                # App icons
├── data.json                 # User data (sections, items, settings)
├── package.json
└── README.md
```

## Data Model

All data is stored in `data.json`:

```json
{
  "sections": [
    {
      "id": "section-id",
      "title": "Section Title",
      "period": "ongoing|quarterly|monthly",
      "items": [
        {
          "id": "item-id",
          "text": "Item description",
          "completed": false,
          "notes": "Optional notes"
        }
      ]
    }
  ],
  "notifications": {
    "enabled": false,
    "daily_reminder": false,
    "daily_time": "09:00",
    "weekly_reminder": false,
    "weekly_day": "Monday",
    "weekly_time": "09:00"
  },
  "quickNotes": [
    {
      "id": "note-id",
      "text": "Note content",
      "timestamp": "2026-01-06T15:30:00.000Z"
    }
  ]
}
```

## Tauri Commands

Commands callable from React via `invoke()`:

| Command | Description |
|---------|-------------|
| `load_data` | Read data.json, return AppData |
| `save_data` | Write AppData to data.json |
| `send_notification` | Show macOS notification, returns status |
| `check_notification_permission` | Returns: granted/denied/unknown |
| `request_notification_permission` | Prompts user, returns state |
| `close_splash` | Close splash window, show main window |
| `show_main_window` | Show and focus main window |

## Development

### Prerequisites

- Node.js 18+
- Rust (install via rustup)
- Xcode Command Line Tools (macOS)

### Setup

```bash
npm install
```

### Run Development

```bash
npm run tauri dev
```

### Build Production

```bash
npm run tauri build
```

The built app will be in `src-tauri/target/release/bundle/`.

## Window Behavior

- **Splash window**: 50% screen height (square), centered on active monitor, no decorations, auto-closes after 2.5s
- **Main window**: 420x600, min 360x400, resizable, opens after splash
- **Close button**: Hides window (app stays in tray)
- **Quit**: Via tray menu only

## Known Issues

- **Notifications in dev mode**: macOS notifications only work in release builds. Use `npm run tauri build` and run from Applications.
- **Notification banners**: Even with permission granted, macOS may only show notifications in Notification Center without pop-up banners. Check System Settings > Notifications > Growing Flurp > Alert style.

## Architecture Notes

### Why Tauri?

- Native performance with web UI flexibility
- Small bundle size (~10MB vs Electron's ~150MB+)
- Rust backend for file I/O and system integration
- Built-in system tray support

### Why JSON for data?

- Simple, human-readable
- Native to both Rust (serde) and React
- Easy to version control
- No external dependencies (no SQLite, etc.)

## Related

- Parent project: `/Users/christoflurp/dev-stuff/growth/`
- Growth plan: `/Users/christoflurp/dev-stuff/growth/plan.md`
