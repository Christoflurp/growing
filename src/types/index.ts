export interface PlanItem {
  id: string;
  text: string;
  completed: boolean;
  notes: string;
  targetExamples?: number;
}

export interface Section {
  id: string;
  title: string;
  period: string;
  items: PlanItem[];
}

export interface NotificationSettings {
  enabled: boolean;
  daily_reminder: boolean;
  daily_time: string;
  weekly_reminder: boolean;
  weekly_day: string;
  weekly_time: string;
  stand_reminder_enabled?: boolean;
  sit_duration_minutes?: number;
  stand_duration_minutes?: number;
  stand_mode?: string;
  stand_mode_changed_at?: string;
}

export interface QuickNote {
  id: string;
  text: string;
  timestamp: string;
}

export interface BragDocEntry {
  id: string;
  title: string;
  text: string;
  links?: string[];
  images?: string[];
  timestamp: string;
}

export type TaskCategory = "work" | "personal";

export interface DailyTask {
  id: string;
  text: string;
  description: string;
  goalId?: string;
  completed: boolean;
  completedAt?: string;
  date: string;
  movedToDate?: string;
  order?: number;
  isFrog?: boolean;
  category: TaskCategory;
  timeboxMinutes?: number;
}

export interface ActiveTimer {
  id: string;
  type: "focus" | "task";
  taskId?: string;
  taskName?: string;
  endTime: string;
  durationMinutes: number;
}

export interface Todo {
  id: string;
  text: string;
  description: string;
  goalId?: string;
  lastScheduledDate?: string;
  createdAt: string;
}

export interface FeatureRequest {
  id: string;
  text: string;
  createdAt: string;
  completed?: boolean;
  completedAt?: string;
}

export interface BugReport {
  id: string;
  text: string;
  createdAt: string;
  completed?: boolean;
  completedAt?: string;
}

export interface AppData {
  sections: Section[];
  notifications: NotificationSettings;
  quickNotes?: QuickNote[];
  bragDocs?: BragDocEntry[];
  dailyTasks?: DailyTask[];
  todos?: Todo[];
  featureRequests?: FeatureRequest[];
  bugReports?: BugReport[];
  curiosities?: Curiosity[];
  reviews?: Review[];
  theme?: string;
  darkMode?: boolean;
  userName?: string;
  onboardingComplete?: boolean;
  appleMusicEnabled?: boolean;
  frogEnabled?: boolean;
  activeTimer?: ActiveTimer;
  activeTimers?: ActiveTimer[];
  atcDays?: string[];
}

export type NavView = "today" | "tasks" | "goals" | "notes" | "bragdoc" | "curiosities" | "reviews" | "settings";

export interface Curiosity {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type ReviewSource = "github" | "graphite";

export interface Review {
  id: string;
  prLink: string;
  title: string;
  source: ReviewSource;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  date: string;
}

export interface NowPlayingInfo {
  is_playing: boolean;
  title?: string;
  artist?: string;
  album?: string;
  album_year?: number;
  duration?: number;
  position?: number;
  artwork?: string;
}
