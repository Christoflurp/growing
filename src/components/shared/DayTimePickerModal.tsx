import { useState, useEffect } from "react";

interface DayTimePickerModalProps {
  show: boolean;
  title: string;
  day: string;
  time: string;
  onSave: (day: string, time: string) => void;
  onClose: () => void;
}

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export function DayTimePickerModal({
  show,
  title,
  day,
  time,
  onSave,
  onClose,
}: DayTimePickerModalProps) {
  const [localDay, setLocalDay] = useState(day);
  const [localTime, setLocalTime] = useState(time);

  useEffect(() => {
    setLocalDay(day);
    setLocalTime(time);
  }, [day, time, show]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (show) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [show, onClose]);

  if (!show) return null;

  const handleSave = () => {
    onSave(localDay, localTime);
    onClose();
  };

  const formatTimeDisplay = (t: string) => {
    const [hours, minutes] = t.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const getDayLabel = (d: string) => {
    return DAYS.find((day) => day.value === d)?.label || d;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="day-time-picker-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="day-time-picker-display">
          {getDayLabel(localDay)} at {formatTimeDisplay(localTime)}
        </div>
        <div className="day-time-picker-fields">
          <div className="day-picker-field">
            <label>Day</label>
            <div className="day-picker-grid">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  className={`day-picker-btn ${localDay === d.value ? "selected" : ""}`}
                  onClick={() => setLocalDay(d.value)}
                >
                  {d.label.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="time-picker-field">
            <label>Time</label>
            <input
              type="time"
              className="time-picker-input"
              value={localTime}
              onChange={(e) => setLocalTime(e.target.value)}
            />
          </div>
        </div>
        <div className="day-time-picker-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
