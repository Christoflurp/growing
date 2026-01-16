import { useState, useEffect } from "react";

interface TimePickerModalProps {
  show: boolean;
  title: string;
  time: string;
  onSave: (time: string) => void;
  onClose: () => void;
}

export function TimePickerModal({
  show,
  title,
  time,
  onSave,
  onClose,
}: TimePickerModalProps) {
  const [localTime, setLocalTime] = useState(time);

  useEffect(() => {
    setLocalTime(time);
  }, [time, show]);

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
    onSave(localTime);
    onClose();
  };

  const formatTimeDisplay = (t: string) => {
    const [hours, minutes] = t.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="time-picker-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="time-picker-display">
          {formatTimeDisplay(localTime)}
        </div>
        <input
          type="time"
          className="time-picker-input"
          value={localTime}
          onChange={(e) => setLocalTime(e.target.value)}
          autoFocus
        />
        <div className="time-picker-actions">
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
