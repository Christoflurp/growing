import { AppData } from "../../types";

interface DayViewModalProps {
  date: string;
  data: AppData;
  onClose: () => void;
}

export function DayViewModal({ date, data, onClose }: DayViewModalProps) {
  const tasks = (data.dailyTasks || []).filter((t) => t.date === date);
  const isAtcDay = (data.atcDays || []).includes(date);
  const atcNotes = (data.atcNotes || []).filter((n) => n.date === date);
  const reviews = (data.reviews || []).filter((r) => r.date === date);
  const pairingSessions = (data.pairingSessions || []).filter((s) => s.date === date);
  const oneOnOneSessions = (data.oneOnOneSessions || []).filter((s) => s.date === date);

  const pairingConfigName = (configId: string) =>
    (data.pairingConfigs || []).find((c) => c.id === configId)?.personName || "Unknown";
  const oneOnOneConfigName = (configId: string) =>
    (data.oneOnOneConfigs || []).find((c) => c.id === configId)?.personName || "Unknown";

  const formatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const hasContent = tasks.length > 0 || atcNotes.length > 0 || reviews.length > 0
    || pairingSessions.length > 0 || oneOnOneSessions.length > 0;

  return (
    <div className="day-view-overlay" onClick={onClose}>
      <div className="day-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="day-view-header">
          <div className="day-view-title-row">
            <h2>{formatted}</h2>
            {isAtcDay && <span className="day-view-atc-badge">ATC</span>}
          </div>
          <button className="day-view-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="day-view-body">
          {!hasContent && (
            <p className="day-view-empty">Nothing logged for this day</p>
          )}

          {tasks.length > 0 && (
            <div className="day-view-section">
              <h3 className="day-view-section-title">
                Tasks
                <span className="day-view-section-meta">{completedCount}/{tasks.length} completed</span>
              </h3>
              <ul className="day-view-task-list">
                {tasks.map((task) => (
                  <li key={task.id} className={`day-view-task ${task.completed ? "completed" : ""}`}>
                    <span className={`day-view-checkbox ${task.completed ? "checked" : ""}`}>
                      {task.completed && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <div className="day-view-task-content">
                      <span className="day-view-task-text">{task.text}</span>
                      {task.description && (
                        <span className="day-view-task-desc">{task.description}</span>
                      )}
                    </div>
                    <span className={`day-view-category ${task.category || "work"}`}>
                      {task.category === "personal" ? "P" : "W"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {atcNotes.length > 0 && (
            <div className="day-view-section atc">
              <h3 className="day-view-section-title">
                ATC Shift Notes
                <span className="day-view-section-meta">{atcNotes.length} note{atcNotes.length !== 1 ? "s" : ""}</span>
              </h3>
              <ul className="day-view-note-list">
                {atcNotes.map((note) => (
                  <li key={note.id} className="day-view-note-item">
                    <span className="day-view-note-text">{note.text}</span>
                    <span className="day-view-note-time">
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="day-view-section">
              <h3 className="day-view-section-title">
                Reviews
                <span className="day-view-section-meta">{reviews.length}</span>
              </h3>
              <ul className="day-view-note-list">
                {reviews.map((review) => (
                  <li key={review.id} className="day-view-note-item">
                    <span className={`day-view-note-text ${review.completed ? "" : "pending"}`}>
                      {review.title}
                    </span>
                    {review.isReReview && <span className="day-view-re-review">re-review</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pairingSessions.length > 0 && (
            <div className="day-view-section">
              <h3 className="day-view-section-title">Pairing</h3>
              <ul className="day-view-note-list">
                {pairingSessions.map((session) => (
                  <li key={session.id} className="day-view-note-item">
                    <span className="day-view-note-text">
                      <strong>{pairingConfigName(session.configId)}</strong> — {session.topic}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {oneOnOneSessions.length > 0 && (
            <div className="day-view-section">
              <h3 className="day-view-section-title">1-1s</h3>
              <ul className="day-view-note-list">
                {oneOnOneSessions.map((session) => (
                  <li key={session.id} className="day-view-note-item">
                    <span className="day-view-note-text">{oneOnOneConfigName(session.configId)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
