import { useState, useCallback } from "react";
import { getTodayDate } from "../utils/dateUtils";

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarPickerMonth, setCalendarPickerMonth] = useState(
    new Date().getMonth()
  );
  const [calendarPickerYear, setCalendarPickerYear] = useState(
    new Date().getFullYear()
  );

  const openDatePicker = useCallback(() => {
    const [year, month] = selectedDate.split("-").map(Number);
    setCalendarPickerYear(year);
    setCalendarPickerMonth(month - 1);
    setShowDatePicker(true);
  }, [selectedDate]);

  const closeDatePicker = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCalendarPickerMonth(today.getMonth());
    setCalendarPickerYear(today.getFullYear());
    setSelectedDate(getTodayDate());
    setShowDatePicker(false);
  }, []);

  const navigateCalendarMonth = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        if (calendarPickerMonth === 0) {
          setCalendarPickerMonth(11);
          setCalendarPickerYear(calendarPickerYear - 1);
        } else {
          setCalendarPickerMonth(calendarPickerMonth - 1);
        }
      } else {
        if (calendarPickerMonth === 11) {
          setCalendarPickerMonth(0);
          setCalendarPickerYear(calendarPickerYear + 1);
        } else {
          setCalendarPickerMonth(calendarPickerMonth + 1);
        }
      }
    },
    [calendarPickerMonth, calendarPickerYear]
  );

  return {
    selectedDate,
    setSelectedDate,
    showDatePicker,
    setShowDatePicker,
    calendarPickerMonth,
    setCalendarPickerMonth,
    calendarPickerYear,
    setCalendarPickerYear,
    openDatePicker,
    closeDatePicker,
    selectDate,
    goToToday,
    navigateCalendarMonth,
  };
}
