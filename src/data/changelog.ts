export interface ChangelogEntry {
  version: string;
  date: string | null;
  title: string;
  changes: string[];
}

export const APP_VERSION = "1.2.0";

export const changelog: ChangelogEntry[] = [
  {
    version: "Unreleased",
    date: null,
    title: "Upcoming Changes",
    changes: [],
  },
  {
    version: "1.2.0",
    date: "2026-01-31",
    title: "Multiple Timers & Polish",
    changes: [
      "Multiple concurrent timers support",
      "Run several focus timers at once with individual controls",
      "Improved frog styling - task text turns green, icon after title",
      "Music info displays during task timeboxes",
      "Fixed tag alignment in task cards (goal tags + category badges)",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-01-23",
    title: "Timers & Categories",
    changes: [
      "Custom timers with optional naming",
      "Task timebox with full-screen focus overlay",
      "Personal/Work category toggle for tasks",
      "Category badges on task cards",
      "Timer expiration alerts with window focus",
      "Confetti celebration when all daily tasks completed",
      "Apple Music now playing bar integration",
      "Eat the Frog priority task feature",
      "Drag-and-drop task reordering",
      "Settings toggles for Apple Music and Frog features",
      "Single-instance enforcement to prevent duplicate launches",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-01-16",
    title: "First Stable Release",
    changes: [
      "Onboarding flow for new users",
      "Daily automatic backups with corruption recovery",
      "Portable data storage (app data directory)",
      "Bug Reports tracking (accessible via nav menu)",
      "Dark mode toggle for all themes",
      "Remaining time countdown for sit/stand reminder",
      "Redesigned Stand Up Reminder with duration slider",
      "Simplified Settings page layout",
      "Moved Changelog, Features, and Bug Reports to nav menu",
      "Mark feature requests as complete with checkbox",
      "Unschedule tasks from Upcoming list (move to backlog)",
      "Preserve multiline formatting in descriptions and notes",
      "Fixed confirm modal z-index issues",
      "Fixed feature request completion persistence",
    ],
  },
  {
    version: "0.10.0",
    date: "2026-01-16",
    title: "Architecture Refactor & Changelog",
    changes: [
      "Refactored App.tsx from ~2655 lines to ~318 lines",
      "Created modular hook architecture (9 custom hooks)",
      "Extracted 6 view components and 6 shared components",
      "Added shared context for data and confirm modals",
      "Fixed delete confirmation bug (shared modal context)",
      "Added changelog section to Settings",
      "Added version display and SEMVER tracking",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-01-15",
    title: "Backlog & Theming",
    changes: [
      "Added Backlog view for unscheduled tasks",
      "Defer tasks from daily list to backlog",
      "Schedule backlog items to today",
      "Four distinct themes: Editorial, Obsidian, Paper, Grove",
      "Theme selector in Settings",
    ],
  },
  {
    version: "0.8.0",
    date: "2026-01-13",
    title: "Task History & Carry Forward",
    changes: [
      "Date navigation to browse task history",
      "Calendar picker for jumping to any date",
      "Carry forward incomplete tasks to today",
      "Moved task tracking with visual indicators",
      "Inline task editing with goal linking",
    ],
  },
  {
    version: "0.7.0",
    date: "2026-01-12",
    title: "Daily Tasks & Goal Linking",
    changes: [
      "Daily Tasks view with add/complete/delete",
      "Link tasks to goals for progress tracking",
      "Goals with targetExamples show linked task count",
      "Completed tasks display as examples under goals",
      "Task completion timestamps",
    ],
  },
  {
    version: "0.6.0",
    date: "2026-01-08",
    title: "Images & Polish",
    changes: [
      "Image attachments for Brag Doc (paste from clipboard)",
      "Image lightbox for full-size viewing",
      "Custom delete confirmation modal",
      "Cmd+W to hide, Cmd+Shift+G global hotkey",
      "Launch at login toggle",
      "Window state memory (size/position)",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-01-07",
    title: "Notifications & Brag Doc",
    changes: [
      "Scheduled notifications (daily/weekly reminders)",
      "Brag Doc view for accomplishments",
      "Notification permission management",
      "Time input for any HH:MM reminder time",
      "macOS notification sounds",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-01-06",
    title: "Editorial UI & Quick Notes",
    changes: [
      "Complete UI redesign with editorial aesthetic",
      "Sidebar navigation with 6 views",
      "Quick notes with Cmd+Enter to save",
      "Progress ring visualization",
      "Collapsible goal sections",
      "Warm color scheme with custom typography",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-01-06",
    title: "Core Data Model",
    changes: [
      "JSON-based data persistence",
      "Sections with period indicators",
      "Goal items with completion tracking",
      "Notification settings structure",
      "Close to tray behavior",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-01-05",
    title: "System Tray Integration",
    changes: [
      "System tray with Show/Quit menu",
      "No dock icon (background app)",
      "Window visibility toggle",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-01-04",
    title: "Initial Setup",
    changes: [
      "Tauri v2 + React + TypeScript scaffold",
      "Basic window configuration",
      "Vite build setup",
    ],
  },
];
