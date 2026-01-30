# Changelog

All notable changes to Growing will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-01-30

### Added

- Curiosities view for tracking things you want to learn
  - Add items with title and description
  - Toggle completion status with visual indicator
  - Edit and delete existing curiosities
- Reviews view for logging PR reviews
  - Paste GitHub PR link, auto-parses to [org/repo#123] format
  - Re-review checkbox for reviewing same PR multiple times
  - Clickable links open PR in browser
- Today page reviews badge showing daily review count
  - Click badge to navigate to Reviews view
- Quick add dropdown from + button in navigation
  - Add tasks, timers, notes, brag docs, curiosities, or reviews from any page
  - Clean modal interfaces for each item type
- Rich Apple Music widget on Today page
  - Album artwork with fallback icon
  - Progress bar with elapsed and total time
  - Transport controls (previous, play/pause, next)
  - Click artist name to open artist page in Apple Music
  - Click album art or album name to open album in Apple Music
  - Open Apple Music button below controls
- Multiple concurrent timers support
  - Run multiple focus timers simultaneously
  - Each timer tracks independently with its own countdown
  - Individual stop controls for each timer
- Improved frog task styling
  - Task text turns green when marked as frog
  - Frog icon moved after title to maintain checkbox alignment
  - Smaller, cleaner frog indicator (20px vs 26px)
- Music info in timebox overlay
  - Shows currently playing track title and artist during task timeboxes
  - Minimal, non-distracting design
- ATC (on-call) daily toggle in Today view header
  - Quick indicator for days you're on support rotation
  - Separate from task categories for cleaner data model
- Task card description preview
  - Shows first 1-2 lines of description below task title
  - Markdown formatting rendered (bold, italic, links styled but not clickable)
  - Full description with clickable links in task detail modal
- Larger task detail modal (500px width)

### Changed

- Today page redesigned with section-based layout
- Apple Music now playing bar hidden on Today view (replaced by widget)
- Renamed "Timer" button to "Timebox" in task detail modal
- Category colors updated: Work (blue), Personal (green)
- Task cards now show title, description preview, and category badge

### Fixed

- Goal tags and work/personal labels now align properly in task cards
  - Tags are grouped in a flex row with consistent spacing
  - Removed individual margins causing misalignment
- Fixed infinite loop in timer hook causing "Maximum update depth exceeded" error
- Fixed category toggle colors not showing correctly in edit mode

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
