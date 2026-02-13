# Changelog

All notable changes to Growing will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-02-13

### Added

- Pear Programming view for tracking pairing sessions
  - CRT terminal-themed UI with retro green-screen aesthetic (scanlines, noise, phosphor glow)
  - Desktop folder icons for partner selection with multi-partner support
  - Start sessions with a topic, log notes in a shell-style scrollable terminal
  - Running session timer tracks pairing duration
  - Post-session wrap-up with optional summary and follow-up items
  - Follow-up items automatically create backlog tasks
  - Session log with click-to-load viewing of past sessions
  - Pear-themed personality ("Pear Programming // Terminal v1.0")
- 1-1 rescheduling support
  - Reschedule button with date picker next to the 1-1 date
  - "Rescheduled" badge when override is active
  - Auto-clears after the rescheduled date passes
  - Cadence stays anchored to original startDate
- Pear emoji shortcut on Today dashboard to jump directly to the Pairing terminal
- ATC toggle redesigned as phone emoji with red glow indicator when on-call
- Built-in MCP server for LLM integration
  - HTTP JSON-RPC server on port 21517 with 8 tools
  - Toggle in Settings to start/stop and auto-register with Claude Code
  - Tools: get_tasks, add_task, complete_task, get_goals, add_note, add_review, add_brag_doc, get_weekly_recap
  - Auto-starts on app launch when enabled
- Weekly Recap view for reviewing externally-generated weekly field notes
  - Field notebook aesthetic with ruled paper, margin line, and page vignette
  - Configure recap folder path in Settings, scans for *-W*.json files
  - Navigate between weeks with prev/next arrows
  - Header with date range title and "Weekly Review" label
  - Narrative section with expand/collapse for long text
  - Code field count tallies (shipped, opened, reviewed, diff) with collapsible PR lists and stacks
  - Active projects with role stamps and collapsible experiments/flags
  - Conversations section with Slack project summaries, technical discussions, and kudos
  - Time spent breakdown as full-width tally grid with color-coded category badges
  - Scratch notes as offset research cards
  - Growth assessment 2x2 grid with stamped ratings (strong/moderate/weak/mixed)
  - Collapsible sections for all detail views
  - Typography: Crimson Pro headers, Cormorant Garamond narrative, Libre Baskerville body, Space Mono data
  - Full dark mode support with warm leather/amber palette

### Fixed

- Sit/stand timer showing 46m instead of 45m on first enable
  - Race condition between async state save and interval-driven render caused negative elapsed time

## [1.3.0] - 2026-02-06

### Added

- 1-1 meeting tracker for preparing and archiving manager meeting notes
  - Configure person name, day of week, and weekly/biweekly cadence
  - Add notes classified as Topic, Action, or Feedback
  - Complete sessions to archive pending notes into dated history
  - Schedule action items as daily tasks via calendar picker
  - Past sessions archive with reverse-chronological browsing
- 1-1 day badge on Today dashboard with pending note count
  - Click to navigate directly to 1-1s view
- Quick add "1-1 Note" from the + dropdown menu on any page
  - Opens modal with type selector if config exists, navigates to setup if not
- Favourite button in Apple Music widget
  - Heart icon appears inline after track title
  - Click to toggle favourite status in Apple Music
  - Filled pink heart when track is favourited
- Cmd+Enter to submit forms from any text field
  - Works consistently across all modals and inline forms
- Notes field on PR reviews
  - Optional textarea when adding or editing reviews
  - Notes display below the PR title on review cards
- Move tasks to backlog from the task detail modal
  - "Backlog" button appears for incomplete tasks alongside Delete
  - Works from both Today and Tasks views
- Curiosity widget on Today dashboard
  - Shows a random incomplete curiosity beside the Apple Music widget
  - Responsive two-card layout when one or both widgets are visible
  - Clicking navigates to the Curiosities view
  - Empty state with dashed border prompts to add a new curiosity

### Fixed

- Re-review status now persists to data and displays as a badge on review cards
  - Previously the re-review checkbox value was discarded after submission
- Quick Add (+) menu now detects duplicate PR reviews and offers re-review toggle
  - Previously the modal had no duplicate detection at all
- Improved album artwork reliability
  - Added retry mechanism (up to 3 attempts) for local artwork extraction
  - Added retry mechanism for iTunes API fallback
  - Increased curl timeout from 3s to 5s

## [1.2.1] - 2026-01-30

### Fixed

- Music progress bar no longer resets to zero when navigating between pages

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
