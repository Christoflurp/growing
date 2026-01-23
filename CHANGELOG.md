# Changelog

All notable changes to Growing will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-01-23

### Added

- Confetti celebration when completing all tasks for the day
  - Extravagant multi-burst animation from both sides of screen
  - Works from both Today and Tasks views
- Single-instance enforcement to prevent duplicate app launches at startup
- Apple Music integration showing currently playing track below navigation
  - Displays: Artist - Song [elapsed/duration] (Album)
  - Real-time elapsed time counting
  - Click bar to open Apple Music
  - Auto-hides when music is paused/stopped
- Settings toggles in Features section
  - Toggle to enable/disable Apple Music integration
  - Toggle to enable/disable Eat the Frog feature

### Fixed

- Date selection in Tasks view now correctly shows tasks for selected date
- Frog status persists correctly when navigating between dates
- Dev mode can now run alongside installed app (single-instance only in release)

## [1.0.0] - 2026-01-17

### Added

- Eat the Frog feature for prioritizing one task per day
  - Drag frog icon onto any task to mark it as the day's priority
  - Visual frog indicator on prioritized tasks
  - Frog checkbox when creating/editing tasks
- Drag-and-drop task reordering within daily task lists
- System tray app with Show/Quit menu
- Window state memory (size and position)
- First-run onboarding flow
- Quarter-screen auto-sizing on first launch
- Auto-reload on wake from sleep
- Close to tray behavior

### Views

- Today dashboard with greeting and quick navigation
- Tasks view with date navigation, carry-forward, and backlog defer
- Backlog for unscheduled tasks
- Goals organized by timeframe (ongoing/quarterly/monthly)
- Quick notes with timestamps
- Brag Doc for accomplishments with images and links
- Notification scheduling (daily/weekly reminders)
- Settings for theme, permissions, and launch-at-login

### Themes

- Grove (default) - Earthy cream with sage green accents
- Editorial - Warm cream with gold accents
- Obsidian - Deep black with amber glow
- Paper - Pure white, minimal

### Technical

- Tauri v2 with Rust backend
- React 19 + TypeScript frontend
- JSON local data storage
- Global hotkey (Cmd+Shift+G)
