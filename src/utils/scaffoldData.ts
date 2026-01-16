import { AppData } from "../types";

export function createScaffoldData(
  userName: string,
  darkMode: boolean,
  enableNotifications: boolean
): AppData {
  const now = new Date().toISOString();

  return {
    userName,
    onboardingComplete: true,
    theme: "grove",
    darkMode,
    sections: [
      {
        id: "section-ongoing",
        title: "Ongoing Habits",
        period: "ongoing",
        items: [
          {
            id: "goal-1",
            text: "Maintain a healthy work-life balance",
            completed: false,
            notes: "Add notes about what this means to you and how you'll measure it.",
          },
          {
            id: "goal-2",
            text: "Learn something new each week",
            completed: false,
            notes: "",
          },
        ],
      },
      {
        id: "section-quarterly",
        title: "This Quarter",
        period: "quarterly",
        items: [
          {
            id: "goal-3",
            text: "Complete a significant project",
            completed: false,
            notes: "What project are you working toward? Break it down into milestones.",
            targetExamples: 5,
          },
          {
            id: "goal-4",
            text: "Develop a new skill",
            completed: false,
            notes: "What skill do you want to develop? How will you practice?",
          },
        ],
      },
      {
        id: "section-monthly",
        title: "This Month",
        period: "monthly",
        items: [
          {
            id: "goal-5",
            text: "Read one book",
            completed: false,
            notes: "What book are you reading?",
          },
          {
            id: "goal-6",
            text: "Connect with someone in your field",
            completed: false,
            notes: "",
          },
        ],
      },
    ],
    notifications: {
      enabled: enableNotifications,
      daily_reminder: enableNotifications,
      daily_time: "09:00",
      weekly_reminder: enableNotifications,
      weekly_day: "monday",
      weekly_time: "09:00",
    },
    quickNotes: [
      {
        id: "note-welcome",
        text: "Welcome to Growing! This is a quick note. Use the + button in the nav to add more anytime.",
        timestamp: now,
      },
    ],
    bragDocs: [],
    dailyTasks: [],
    todos: [
      {
        id: "todo-1",
        text: "Customize your goals in the Goals tab",
        description: "Replace the example goals with your own personal and professional objectives.",
        createdAt: now,
      },
      {
        id: "todo-2",
        text: "Set up your notification schedule",
        description: "Go to Settings to adjust when you receive reminders.",
        createdAt: now,
      },
    ],
    featureRequests: [],
    bugReports: [],
  };
}
