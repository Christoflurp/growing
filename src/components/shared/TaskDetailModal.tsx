import { DailyTask } from "../../types";
import { MarkdownText } from "./MarkdownText";
import { FrogIcon } from "./FrogIcon";

interface TaskDetailModalProps {
  task: DailyTask;
  goalInfo?: { sectionTitle: string; goalText: string } | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleComplete: () => void;
  onStartTimer?: () => void;
  onDelete: () => void;
}

export function TaskDetailModal({
  task,
  goalInfo,
  onClose,
  onEdit,
  onToggleComplete,
  onStartTimer,
  onDelete,
}: TaskDetailModalProps) {
  const category = task.category || "work";

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <div className="task-detail-title-row">
            <h2 className={`task-detail-title ${task.completed ? "completed" : ""}`}>
              {task.text}
            </h2>
            {task.isFrog && (
              <span className="task-detail-frog">
                <FrogIcon size={22} />
              </span>
            )}
          </div>
          <div className="task-detail-header-actions">
            <button className="task-detail-edit-icon" onClick={onEdit} title="Edit task">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="task-detail-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="task-detail-body">
          {task.description ? (
            <div className="task-detail-description">
              <MarkdownText text={task.description} />
            </div>
          ) : (
            <p className="task-detail-no-description">No description</p>
          )}

          <div className="task-detail-meta">
            {goalInfo && (
              <div className="task-detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
                <span>{goalInfo.sectionTitle}: {goalInfo.goalText}</span>
              </div>
            )}
            <div className="task-detail-meta-item">
              <span className={`task-detail-category ${category}`}>
                {category === "personal" ? "Personal" : "Work"}
              </span>
            </div>
            {task.completed && task.completedAt && (
              <div className="task-detail-meta-item completed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>
                  Completed {new Date(task.completedAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="task-detail-actions">
          <button className="task-detail-btn delete" onClick={onDelete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
          <div className="task-detail-actions-right">
            {!task.completed && onStartTimer && (
              <button className="task-detail-btn timer" onClick={onStartTimer}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Timebox
              </button>
            )}
            <button className={`task-detail-btn ${task.completed ? "uncomplete" : "complete"}`} onClick={onToggleComplete}>
              {task.completed ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 12a9 9 0 1018 0 9 9 0 10-18 0" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Undo
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Done
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
