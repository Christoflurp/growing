import { NowPlayingInfo } from "../../types";

interface TimeboxOverlayProps {
  timerId: string;
  taskName?: string;
  timeRemaining: number;
  totalDuration: number;
  formatTime: (seconds: number) => string;
  onStop: (timerId: string) => void;
  nowPlaying?: NowPlayingInfo | null;
}

export function TimeboxOverlay({
  timerId,
  taskName,
  timeRemaining,
  totalDuration,
  formatTime,
  onStop,
  nowPlaying,
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

        {nowPlaying?.is_playing && nowPlaying.title && (
          <div className="timebox-now-playing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <div className="timebox-now-playing-info">
              <span className="timebox-now-playing-title">{nowPlaying.title}</span>
              {nowPlaying.artist && (
                <span className="timebox-now-playing-artist">{nowPlaying.artist}</span>
              )}
            </div>
          </div>
        )}

        <button className="timebox-stop" onClick={() => onStop(timerId)}>
          End Session
        </button>
      </div>
    </div>
  );
}
