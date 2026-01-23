interface TimeboxOverlayProps {
  taskName?: string;
  timeRemaining: number;
  totalDuration: number;
  formatTime: (seconds: number) => string;
  onStop: () => void;
}

export function TimeboxOverlay({
  taskName,
  timeRemaining,
  totalDuration,
  formatTime,
  onStop,
}: TimeboxOverlayProps) {
  const totalSeconds = totalDuration * 60;
  const elapsed = totalSeconds - timeRemaining;
  const progress = Math.min(100, (elapsed / totalSeconds) * 100);

  return (
    <div className="timebox-overlay">
      <div className="timebox-content">
        <div className="timebox-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M9 2h6M12 2v3" />
          </svg>
        </div>

        <h2 className="timebox-title">Focus Mode</h2>

        {taskName && <p className="timebox-task">{taskName}</p>}

        <div className="timebox-timer">{formatTime(timeRemaining)}</div>

        <div className="timebox-progress-container">
          <div className="timebox-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <button className="timebox-stop" onClick={onStop}>
          End Session
        </button>
      </div>
    </div>
  );
}
