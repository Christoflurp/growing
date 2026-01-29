# Growing

A personal Mac menu bar app for growth tracking and accountability reminders.

## Tech Stack

- **Tauri v2** - Rust backend, web frontend
- **React 19 + TypeScript** - Frontend UI
- **Vite** - Build tool
- **JSON** - Local data storage

## Quick Start

```bash
npm install              # Install dependencies
npm run tauri dev        # Run in development mode
npm run tauri build      # Build for production
```

## Features

### Core Functionality

- **System tray app** - Lives in menu bar with Show/Quit menu (no dock icon)
- **Window state memory** - Remembers size and position between sessions (release builds only)
- **First-run onboarding** - Name input, theme selection, notification setup
- **Quarter-screen sizing** - Auto-sizes to 1/4 of screen on first launch
- **Auto-reload on wake** - Data refreshes when Mac wakes from sleep
- **Close to tray** - Closing window hides it; app keeps running
- **Apple Music integration** - Shows now playing bar below navigation (toggleable in Settings)
- **Eat the Frog** - Mark one task per day as priority with draggable frog icon (toggleable in Settings)
- **Custom Timers** - Flexible timers with optional naming for any timed activity
- **Task Timebox** - Full-screen focus overlay blocks app during timeboxed work
- **Task Categories** - Personal/Work toggle with visual badges on task cards
- **Confetti** - Celebration animation when all daily tasks are completed

### Views (8 tabs)

1. **Today** - Dashboard with greeting, today's tasks, recent notes, and quick navigation
2. **Tasks** - Daily task management with date navigation, carry-forward, and defer-to-backlog
3. **Backlog** - Unscheduled tasks for future scheduling
4. **Goals** - Progress tracking organized by timeframe (ongoing/quarterly/monthly)
5. **Notes** - Quick note capture with timestamps
6. **Brag Doc** - Accomplishments log with images and links
7. **Notifications** - Reminder scheduling (daily/weekly)
8. **Settings** - Theme, permissions, launch-at-login

### Theming

- **Grove** (default) - Earthy cream backgrounds, sage green accents, with dark mode support
- **Editorial** - Warm cream backgrounds, gold accents
- **Obsidian** - Deep black backgrounds, amber glow accents
- **Paper** - Pure white, minimal, borderless

Dark mode toggle available in the menu (three-dots button).

### Keyboard Shortcuts

- `Cmd+W` - Hide window
- `Cmd+Shift+G` - Global hotkey to show window from anywhere
- `Cmd+Enter` - Save quick note
- `Escape` - Close modals and lightbox

## Project Structure

```
growing/
├── src/                      # React frontend
│   ├── components/
│   │   ├── Navigation.tsx    # Sidebar navigation
│   │   ├── views/            # View components (one per tab)
│   │   └── shared/           # Reusable UI components
│   ├── context/              # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript interfaces
│   ├── utils/                # Helper functions
│   ├── App.tsx               # Main orchestrator
│   └── App.css               # All styles
├── src-tauri/                # Rust backend
│   ├── src/lib.rs            # Tauri commands, tray, notifications
│   ├── tauri.conf.json       # App configuration
│   └── icons/                # App icons
├── images/                   # User's brag doc images
└── data.json                 # User data (auto-created on first run)
```

## Data Model

```typescript
interface AppData {
  userName?: string;
  onboardingComplete?: boolean;
  darkMode?: boolean;
  theme?: string;                    // "grove" | "editorial" | "obsidian" | "paper"
  appleMusicEnabled?: boolean;       // Show now playing bar (default: true)
  frogEnabled?: boolean;             // Enable eat the frog feature (default: true)
  atcDays?: string[];                // YYYY-MM-DD dates marked as ATC/on-call days
  sections: Section[];               // Goals organized by period
  notifications: NotificationSettings;
  quickNotes?: QuickNote[];
  bragDocs?: BragDocEntry[];
  dailyTasks?: DailyTask[];
  todos?: Todo[];                    // Backlog items
  featureRequests?: FeatureRequest[];
  bugReports?: BugReport[];
  activeTimers?: ActiveTimer[];      // Currently running timers (supports multiple)
}

type TaskCategory = "work" | "personal";

interface ActiveTimer {
  id: string;                        // Unique identifier for the timer
  type: "focus" | "task";            // Generic timer or task timebox
  taskId?: string;                   // For task timeboxes
  taskName?: string;                 // Display name
  endTime: string;                   // ISO 8601 timestamp
  durationMinutes: number;
}

interface NowPlayingInfo {
  is_playing: boolean;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;                 // Total duration in seconds
  position?: number;                 // Current position in seconds
}

interface Section {
  id: string;
  title: string;
  period: string;                    // "ongoing" | "quarterly" | "monthly"
  items: PlanItem[];
}

interface PlanItem {
  id: string;
  text: string;
  completed: boolean;
  notes: string;
  targetExamples?: number;           // If set, uses linked tasks for completion
}

interface DailyTask {
  id: string;
  text: string;
  description: string;
  goalId?: string;                   // Links to PlanItem.id
  category?: TaskCategory;           // "work" (default) or "personal"
  completed: boolean;
  completedAt?: string;              // ISO 8601 timestamp
  date: string;                      // YYYY-MM-DD
  movedToDate?: string;              // Date task was carried forward to
  order?: number;                    // For drag-and-drop reordering
  isFrog?: boolean;                  // Priority "eat the frog" task
}

interface Todo {
  id: string;
  text: string;
  description: string;
  goalId?: string;
  lastScheduledDate?: string;
  createdAt: string;
}
```

## Tauri Commands

| Command | Purpose |
|---------|---------|
| `load_data` | Read data.json, return AppData |
| `save_data` | Write AppData to data.json |
| `save_image` | Save base64 image, returns filename |
| `get_image` | Load image, returns data URL |
| `delete_image` | Delete image file |
| `send_notification` | Show macOS notification with sound |
| `check_notification_permission` | Returns: granted/denied/unknown |
| `request_notification_permission` | Prompts user for permission |
| `get_now_playing` | Query Apple Music for current track info |
| `open_apple_music` | Open Apple Music application |

## Development Notes

### Notifications

- **Only work in release builds** - Dev mode doesn't support notifications
- macOS suppresses banners when app is in foreground (expected behavior)
- Check System Settings > Notifications > Growing for alert style

### Window State

- Position/size memory only works in **release builds**
- Dev mode uses defaults from `tauri.conf.json`

### Apple Music Integration

- Uses AppleScript via `osascript` to query Music.app metadata
- Real-time updates via NSDistributedNotificationCenter (`com.apple.Music.playerInfo`)
- Elapsed time counts locally in React to avoid constant backend queries
- Album year not available for streaming tracks (Apple API limitation)

### First Launch Detection

- Checks if `data.json` exists to determine first launch
- On first launch: shows onboarding, sizes window to quarter screen
- Onboarding creates scaffold data with example goals

### Adding New Features

1. Add TypeScript interface to `src/types/index.ts`
2. Add Rust struct to `src-tauri/src/lib.rs` (with serde attributes)
3. Create hook in `src/hooks/` for state management
4. Create view component in `src/components/views/`
5. Add navigation in `Navigation.tsx`

## Release Process

When the user says "let's do a new release", follow this process.

### Step 1: Gather Release Info (Claude)

1. Read open feature requests and bug reports from app data:
   `~/Library/Application Support/com.christoflurp.growing/data.json`
2. Identify which items were completed this release cycle
3. Determine the new version number (SEMVER):
   - **MAJOR** - Breaking changes
   - **MINOR** - New features (most releases)
   - **PATCH** - Bug fixes only
4. Ask user for release date (default: upcoming Friday)

### Step 2: Update Version Files (Claude)

Update version string in all three locations:

| File | Field |
|------|-------|
| `package.json` | `"version"` |
| `src-tauri/tauri.conf.json` | `"version"` |
| `src/data/changelog.ts` | `APP_VERSION` constant |

### Step 3: Update Changelogs (Claude)

**src/data/changelog.ts** - In-app changelog:
- Add new entry to `changelog` array (after "Unreleased")
- Include version, date, title, and changes array
- Move any items from "Unreleased" to the new version

**CHANGELOG.md** - Markdown changelog:
- Add new `## [X.X.X] - YYYY-MM-DD` section
- Use Keep a Changelog format (Added/Changed/Fixed/Removed)
- Be descriptive but concise

### Step 4: Mark Completed Items (Claude)

In app data (`~/Library/Application Support/com.christoflurp.growing/data.json`):
- Set `completed: true` on finished `featureRequests`
- Set `completed: true` on finished `bugReports`

### Step 5: Verify TypeScript (Claude)

Run type check and report any errors:

```bash
npx tsc --noEmit
```

### Step 6: Manual Steps (User)

After Claude completes steps 1-5, the user must:

1. **Review changes** - Check the changelog entries look correct
2. **Build the app**:
   ```bash
   npm run tauri build
   ```
3. **Test the build** - Launch from `src-tauri/target/release/bundle/macos/Growing.app`
   - Verify new features work
   - Check for regressions
   - Test on fresh data if needed
4. **Install** (optional):
   ```bash
   npm run install-app
   ```

### Step 7: Git Workflow (User)

After testing confirms the release is ready:

```bash
git add -A
git commit -m "Release vX.X.X"
git tag vX.X.X
git push && git push --tags
```

### Step 8: Post-Release (Claude)

After user confirms the release is complete:
- Update README.md if features warrant it
- Add any follow-up items to feature requests

### Release Checklist Summary

| Step | Owner | Task |
|------|-------|------|
| 1 | Claude | Gather completed features/bugs |
| 2 | Claude | Bump version in 3 files |
| 3 | Claude | Update both changelogs |
| 4 | Claude | Mark items complete in app data |
| 5 | Claude | Run `npx tsc --noEmit` |
| 6 | User | Build and test: `npm run tauri build` |
| 7 | User | Git commit and tag |
| 8 | Claude | Post-release updates (if needed) |

## Build & Distribution

```bash
npm run tauri build      # Creates DMG in src-tauri/target/release/bundle/
npm run install-app      # Build and copy to /Applications
```

The DMG can be distributed directly - users drag to Applications folder.

### Data Location

User data is stored in the app directory:
- `data.json` - All user data
- `images/` - Brag doc image attachments

## Customization

### Changing App Name

1. Update `productName` in `src-tauri/tauri.conf.json`
2. Update `identifier` in `src-tauri/tauri.conf.json`
3. Update `<title>` in `index.html`

### Changing Default Window Size

Edit `src-tauri/tauri.conf.json`:
```json
"windows": [{
  "width": 720,
  "height": 540,
  "minWidth": 360,
  "minHeight": 400
}]
```

### Changing Data Path

Edit `DATA_PATH` and `IMAGES_PATH` constants in `src-tauri/src/lib.rs`.
