import { useAppData } from "../../context/AppDataContext";
import { useGoals } from "../../hooks/useGoals";
import { formatRelativeTime } from "../../utils/formatUtils";

export function GoalsView() {
  const { data } = useAppData();
  const {
    expandedSections,
    editingItem,
    editNotes,
    setEditNotes,
    toggleSection,
    toggleItemComplete,
    saveItemNotes,
    startEditingNotes,
    cancelEditingNotes,
    isItemComplete,
    getTotalProgress,
    getCompletedTasksForGoal,
  } = useGoals();

  const progress = getTotalProgress();

  if (!data) return null;

  return (
    <div className="view goals-view">
      <header className="view-header goals-header">
        <div className="goals-header-left">
          <h1>Goals</h1>
          <span className="goals-progress-text">{progress}% complete</span>
        </div>
        <div className="goals-progress-ring">
          <svg viewBox="0 0 40 40">
            <circle
              className="progress-ring-bg"
              cx="20"
              cy="20"
              r="16"
              strokeWidth="4"
            />
            <circle
              className="progress-ring-fill"
              cx="20"
              cy="20"
              r="16"
              strokeWidth="4"
              strokeDasharray={`${progress * 1.005} 100.5`}
              transform="rotate(-90 20 20)"
            />
          </svg>
        </div>
      </header>

      <div className="goals-list">
        {data.sections.map((section) => (
          <div key={section.id} className="goal-section">
            <button
              className="goal-section-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="goal-section-left">
                <span className={`period-indicator ${section.period}`} />
                <h2>{section.title}</h2>
              </div>
              <div className="goal-section-right">
                <span className="goal-count">
                  {section.items.filter((i) => isItemComplete(i)).length}/{section.items.length}
                </span>
                <span className={`chevron ${expandedSections.has(section.id) ? "open" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </button>

            {expandedSections.has(section.id) && (
              <div className="goal-items">
                {section.items.map((item) => {
                  const linkedTasks = getCompletedTasksForGoal(item.id);
                  const hasTargetExamples = item.targetExamples !== undefined && item.targetExamples > 0;
                  const isCompleteByExamples = hasTargetExamples && linkedTasks.length >= item.targetExamples!;
                  const effectivelyCompleted = hasTargetExamples ? isCompleteByExamples : item.completed;
                  return (
                    <div key={item.id} className={`goal-item ${effectivelyCompleted ? "completed" : ""}`}>
                      {hasTargetExamples ? (
                        <div className="example-progress">
                          <span className="example-count">{linkedTasks.length}/{item.targetExamples}</span>
                        </div>
                      ) : (
                        <button
                          className="checkbox"
                          onClick={() => toggleItemComplete(section.id, item.id)}
                        >
                          {item.completed && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      )}
                      <div className="goal-item-content">
                        <p className="goal-item-text">{item.text}</p>
                        {item.notes && editingItem !== item.id && (
                          <p className="goal-item-notes">{item.notes}</p>
                        )}
                        {editingItem === item.id && (
                          <div className="edit-notes-form">
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Add notes..."
                              autoFocus
                            />
                            <div className="edit-notes-actions">
                              <button
                                className="btn-save"
                                onClick={() => saveItemNotes(section.id, item.id, editNotes)}
                              >
                                Save
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={cancelEditingNotes}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        {linkedTasks.length > 0 && (
                          <div className="goal-linked-tasks">
                            <span className="linked-tasks-label">Examples:</span>
                            {linkedTasks.map((task) => (
                              <div key={task.id} className="linked-task">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>{task.text}</span>
                                <span className="linked-task-date">{formatRelativeTime(task.completedAt || task.date)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {editingItem !== item.id && (
                        <button
                          className="edit-btn"
                          onClick={() => startEditingNotes(item)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
