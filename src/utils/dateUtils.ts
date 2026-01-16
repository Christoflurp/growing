export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const isToday = (date: string): boolean => date === getTodayDate();

export const isFutureDate = (date: string): boolean => date > getTodayDate();

export const getCalendarDays = (year: number, month: number): (number | null)[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

export const formatCalendarDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const getMonthName = (month: number): string => {
  return new Date(2000, month, 1).toLocaleDateString("en-US", { month: "long" });
};
