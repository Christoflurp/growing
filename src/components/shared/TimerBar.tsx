interface TimerBarProps {
  type: "focus" | "task";
  taskName?: string;
  timeRemaining: number;
  totalDuration: number;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
  onStop: () => void;
}

export function TimerBar({
  type,
  taskName,
  timeRemaining,
  totalDuration,
  isExpired,
  formatTime,
  onStop,
}: TimerBarProps) {
  const progress = totalDuration > 0 ? ((totalDuration * 60 - timeRemaining) / (totalDuration * 60)) * 100 : 0;

  return (
    <div className={`timer-bar ${type} ${isExpired ? "expired" : ""}`}>
      <div className="timer-bar-progress" style={{ width: `${Math.min(progress, 100)}%` }} />
      <div className="timer-bar-content">
        <div className="timer-bar-info">
          {type === "focus" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="timer-icon">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="timer-icon">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          )}
          <span className="timer-bar-label">
            {taskName || "Timer"}
          </span>
        </div>
        <div className="timer-bar-time">
          {isExpired ? (
            <span className="timer-expired-text">Time's up!</span>
          ) : (
            <span className="timer-countdown">{formatTime(timeRemaining)}</span>
          )}
        </div>
        <button className="timer-bar-stop" onClick={onStop} title="Stop timer">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
