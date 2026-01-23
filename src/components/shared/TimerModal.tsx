import { useState } from "react";

interface TimerModalProps {
  type: "focus" | "task";
  taskName?: string;
  onStart: (minutes: number, name?: string) => void;
  onClose: () => void;
}

const PRESET_DURATIONS = [5, 10, 30, 60];

export function TimerModal({ type, taskName, onStart, onClose }: TimerModalProps) {
  const [customMinutes, setCustomMinutes] = useState("");
  const [timerName, setTimerName] = useState("");

  const handlePresetClick = (minutes: number) => {
    onStart(minutes, type === "focus" ? timerName || undefined : undefined);
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0 && minutes <= 180) {
      onStart(minutes, type === "focus" ? timerName || undefined : undefined);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === "focus" ? "Start Timer" : "Timebox Task"}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {type === "focus" && (
          <input
            type="text"
            className="timer-name-input"
            placeholder="Timer name (optional)"
            value={timerName}
            onChange={(e) => setTimerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
        )}

        {taskName && (
          <p className="timer-task-name">{taskName}</p>
        )}

        <div className="timer-presets">
          {PRESET_DURATIONS.map((minutes) => (
            <button
              key={minutes}
              className="timer-preset-btn"
              onClick={() => handlePresetClick(minutes)}
            >
              {minutes}m
            </button>
          ))}
        </div>

        <div className="timer-custom">
          <input
            type="number"
            min="1"
            max="180"
            placeholder="Custom minutes"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCustomSubmit();
              if (e.key === "Escape") onClose();
            }}
          />
          <button
            className="btn-save"
            onClick={handleCustomSubmit}
            disabled={!customMinutes || parseInt(customMinutes, 10) <= 0}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
