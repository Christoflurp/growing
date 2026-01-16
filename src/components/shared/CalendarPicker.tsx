import {
  getTodayDate,
  getCalendarDays,
  formatCalendarDate,
  getMonthName,
} from "../../utils/dateUtils";

interface CalendarPickerProps {
  show: boolean;
  contextText: string | null;
  month: number;
  year: number;
  selectedDate: string;
  datesWithTasks: string[];
  onNavigateMonth: (direction: "prev" | "next") => void;
  onSelectDate: (date: string) => void;
  onGoToToday: () => void;
  onClose: () => void;
}

export function CalendarPicker({
  show,
  contextText,
  month,
  year,
  selectedDate,
  datesWithTasks,
  onNavigateMonth,
  onSelectDate,
  onGoToToday,
  onClose,
}: CalendarPickerProps) {
  if (!show) return null;

  const todayDate = getTodayDate();

  return (
    <div className="calendar-picker-overlay" onClick={onClose}>
      <div className="calendar-picker-modal" onClick={(e) => e.stopPropagation()}>
        {contextText && (
          <div className="calendar-picker-context">
            <span>Schedule task:</span>
            <strong>{contextText}</strong>
          </div>
        )}
        <div className="calendar-picker-header">
          <button
            className="calendar-nav-btn"
            onClick={() => onNavigateMonth("prev")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2>{getMonthName(month)} {year}</h2>
          <button
            className="calendar-nav-btn"
            onClick={() => onNavigateMonth("next")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="calendar-picker-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-picker-days">
          {getCalendarDays(year, month).map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="calendar-day empty" />;
            }
            const dateStr = formatCalendarDate(year, month, day);
            const isSelected = dateStr === selectedDate;
            const isTodayDate = dateStr === todayDate;
            const hasTasksOnDay = datesWithTasks.includes(dateStr);
            return (
              <button
                key={day}
                className={`calendar-day ${isSelected ? "selected" : ""} ${isTodayDate ? "today" : ""} ${hasTasksOnDay ? "has-tasks" : ""}`}
                onClick={() => onSelectDate(dateStr)}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="calendar-picker-footer">
          <button className="calendar-today-btn" onClick={onGoToToday}>
            Today
          </button>
        </div>
      </div>
    </div>
  );
}
