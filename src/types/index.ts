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
  theme?: string;
  darkMode?: boolean;
  userName?: string;
  onboardingComplete?: boolean;
}

export type NavView = "today" | "tasks" | "goals" | "notes" | "bragdoc" | "settings";
