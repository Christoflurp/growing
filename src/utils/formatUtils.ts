import { getTodayDate } from "./dateUtils";

export const formatDateHeader = (date: string): string => {
  const today = getTodayDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (date === today) return "Today";
  if (date === yesterdayStr) return "Yesterday";
  if (date === tomorrowStr) return "Tomorrow";

  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatFullDate = (iso: string): string => {
  const timeDisplayOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  } as const;

  return new Date(iso).toLocaleString("en-US", timeDisplayOptions);
};

export const getGreeting = (time: Date): string => {
  const hour = time.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const formatDateTime = (time: Date): string => {
  return (
    time.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }) +
    " · " +
    time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
};
