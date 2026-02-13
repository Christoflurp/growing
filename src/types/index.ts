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
  oneOnOneConfigs?: OneOnOneConfig[];
  oneOnOneNotes?: OneOnOneNote[];
  oneOnOneSessions?: OneOnOneSession[];
  pairingConfigs?: PairingConfig[];
  pairingSessions?: PairingSession[];
  pairingNotes?: PairingNote[];
  theme?: string;
  darkMode?: boolean;
  userName?: string;
  onboardingComplete?: boolean;
  appleMusicEnabled?: boolean;
  frogEnabled?: boolean;
  activeTimer?: ActiveTimer;
  activeTimers?: ActiveTimer[];
  atcDays?: string[];
  mcpServerEnabled?: boolean;
  weeklyRecapEnabled?: boolean;
  weeklyRecapPath?: string;
}

export type NavView = "today" | "tasks" | "goals" | "notes" | "bragdoc" | "curiosities" | "reviews" | "one-on-ones" | "pairing" | "weekly-recap" | "settings";

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
  isReReview?: boolean;
  notes?: string;
}

export type OneOnOneNoteType = "topic" | "action" | "feedback";
export type OneOnOneCadence = "weekly" | "biweekly";

export interface OneOnOneConfig {
  id: string;
  personName: string;
  dayOfWeek: string;
  cadence: OneOnOneCadence;
  startDate: string;
  nextOverrideDate?: string;
  createdAt: string;
}

export interface OneOnOneNote {
  id: string;
  configId: string;
  text: string;
  noteType: OneOnOneNoteType;
  sessionId?: string;
  scheduledAsTaskId?: string;
  createdAt: string;
}

export interface OneOnOneSession {
  id: string;
  configId: string;
  date: string;
  completedAt: string;
}

export type PairingNoteType = "takeaway" | "follow-up" | "note";

export interface PairingConfig {
  id: string;
  personName: string;
  createdAt: string;
}

export interface PairingSession {
  id: string;
  configId: string;
  topic: string;
  date: string;
  notes: string;
  completedAt?: string;
  createdAt: string;
}

export interface PairingNote {
  id: string;
  configId: string;
  text: string;
  noteType?: PairingNoteType;
  sessionId?: string;
  createdAt: string;
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
  is_loved?: boolean;
}

export interface WeeklyRecapMeta {
  week: string;
  year: number;
  weekNumber: number;
  dateRange: {
    start: string;
    end: string;
    display: string;
  };
  generatedAt: string;
}

export interface WeeklyRecapLink {
  title: string;
  url: string;
}

export interface WeeklyRecapPrShipped {
  number: number;
  title: string;
  url: string;
  repo: string;
  author: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  date: string;
  state: "merged";
}

export interface WeeklyRecapPrOpened {
  number: number;
  title: string;
  url: string;
  repo: string;
  author: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface WeeklyRecapPrReviewed {
  number: number;
  title: string;
  url: string;
  repo: string;
  author: string;
}

export interface WeeklyRecapCodeStats {
  shipped: number;
  opened: number;
  reviewed: number;
  commented: number;
  totalAdditions: number;
  totalDeletions: number;
}

export interface WeeklyRecapStack {
  rootBranch: string;
  prUrl: string;
  depth: number;
  needsRestack: boolean;
}

export interface WeeklyRecapOpenPR {
  number: number;
  title: string;
  url: string;
  repo: string;
  state: "draft" | "open";
  created: string;
}

export interface WeeklyRecapCode {
  prsShipped: WeeklyRecapPrShipped[];
  prsOpened: WeeklyRecapPrOpened[];
  prsReviewed: WeeklyRecapPrReviewed[];
  prsCommented: WeeklyRecapPrReviewed[];
  stats: WeeklyRecapCodeStats;
  stacks: WeeklyRecapStack[];
  allOpenPRs: WeeklyRecapOpenPR[];
}

export interface WeeklyRecapSlackProject {
  name: string;
  participants: string[];
  channels: string[];
  activities: string[];
  links: WeeklyRecapLink[];
}

export interface WeeklyRecapTechnicalDiscussion {
  topic: string;
  participants: string[];
  summary: string;
}

export interface WeeklyRecapKudosEntry {
  person: string;
  context: string;
}

export interface WeeklyRecapSlack {
  projects: WeeklyRecapSlackProject[];
  technical: WeeklyRecapTechnicalDiscussion[];
  operational: string[];
  process: string[];
  nonWork: string[];
  distractions: string[];
  kudos: {
    given: WeeklyRecapKudosEntry[];
    received: WeeklyRecapKudosEntry[];
  };
  links: WeeklyRecapLink[];
}

export interface WeeklyRecapProject {
  name: string;
  url: string;
  role: "Champion" | "Contributor";
  phase: string;
  status: string;
}

export interface WeeklyRecapExperiment {
  handle: string;
  url: string;
  type: "experiment" | "flag";
  state: string;
  rollout: number | null;
  notes: string;
}

export interface WeeklyRecapProjects {
  active: WeeklyRecapProject[];
  experiments: WeeklyRecapExperiment[];
  teamActivity: string[];
  updates: string[];
}

export type MeetingCategory = "1:1" | "planning" | "pairing" | "social" | "other";

export interface WeeklyRecapMeeting {
  time: string;
  title: string;
  category: MeetingCategory;
  attendees: string[];
  durationMinutes: number;
}

export interface WeeklyRecapMeetingBreakdown {
  total: { hours: number; count: number };
  byCategory: { category: MeetingCategory; hours: number; count: number }[];
}

export interface WeeklyRecapActivity {
  meetings: WeeklyRecapMeeting[];
  meetingBreakdown: WeeklyRecapMeetingBreakdown;
}

export interface WeeklyRecapScratchNote {
  topic: string;
  sources: string[];
  summary: string;
}

export type GrowthRating = "strong" | "moderate" | "weak" | "mixed";

export interface GrowthSignal {
  rating: GrowthRating;
  evidence: string[];
  summary: string;
}

export interface WeeklyRecapGrowth {
  incrementalDelivery: GrowthSignal;
  selfConfidence: GrowthSignal;
  systemsThinking: GrowthSignal;
  execution: GrowthSignal;
}

export interface WeeklyRecap {
  meta: WeeklyRecapMeta;
  narrative: string;
  code: WeeklyRecapCode;
  slack: WeeklyRecapSlack;
  projects: WeeklyRecapProjects;
  activity: WeeklyRecapActivity;
  scratchNotes: WeeklyRecapScratchNote[];
  topics: string[];
  growth: WeeklyRecapGrowth;
}

export interface WeeklyRecapListItem {
  week: string;
  filename: string;
}
