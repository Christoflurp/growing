import { useEffect } from "react";
import { useBugReports } from "../../hooks/useBugReports";
import { useConfirmModal } from "../../context/ConfirmModalContext";

interface BugReportsModalProps {
  show: boolean;
  onClose: () => void;
}

export function BugReportsModal({ show, onClose }: BugReportsModalProps) {
  const { showConfirm } = useConfirmModal();
  const {
    showBugForm,
    setShowBugForm,
    bugText,
    setBugText,
    editingBugId,
    editBugText,
    setEditBugText,
    addBugReport,
    deleteBugReport: performDeleteBugReport,
    startEditingBug,
    cancelEditingBug,
    updateBugReport,
    completeBugReport,
    uncompleteBugReport,
    getPendingBugs,
    getCompletedBugs,
  } = useBugReports();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !editingBugId && !showBugForm) {
        onClose();
      }
    };
    if (show) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [show, onClose, editingBugId, showBugForm]);

  const deleteBugReport = (bugId: string) => {
    showConfirm("Delete this bug report?", () => performDeleteBugReport(bugId));
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feature-requests-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feature-requests-modal-header">
          <h2>Bug Reports</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="feature-requests-modal-content">
          {!showBugForm ? (
            <button className="add-feature-btn" onClick={() => setShowBugForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Report a Bug
            </button>
          ) : (
            <div className="feature-add-form">
              <input
                type="text"
                placeholder="Describe the bug..."
                value={bugText}
                onChange={(e) => setBugText(e.target.value)}
                className="task-text-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && bugText.trim()) addBugReport();
                  if (e.key === "Escape") {
                    setShowBugForm(false);
                    setBugText("");
                  }
                }}
              />
              <div className="task-form-actions">
                <button className="btn-save" onClick={addBugReport} disabled={!bugText.trim()}>
                  Add
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowBugForm(false);
                    setBugText("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {getPendingBugs().length === 0 && getCompletedBugs().length === 0 && !showBugForm ? (
            <div className="feature-requests-empty">
              <p>No bug reports yet</p>
              <span>Track bugs and issues here</span>
            </div>
          ) : (
            <>
              <div className="feature-requests-list">
                {getPendingBugs().map((bug) => {
                  const isEditing = editingBugId === bug.id;
                  return (
                    <div key={bug.id} className={`feature-request-item ${isEditing ? "editing" : ""}`}>
                      {isEditing ? (
                        <div className="feature-edit-form">
                          <input
                            type="text"
                            value={editBugText}
                            onChange={(e) => setEditBugText(e.target.value)}
                            className="task-text-input"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editBugText.trim()) updateBugReport();
                              if (e.key === "Escape") cancelEditingBug();
                            }}
                          />
                          <div className="task-form-actions">
                            <button className="btn-save" onClick={updateBugReport} disabled={!editBugText.trim()}>
                              Save
                            </button>
                            <button className="btn-cancel" onClick={cancelEditingBug}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button className="checkbox" onClick={() => completeBugReport(bug.id)}>
                          </button>
                          <div className="feature-request-content">
                            <p className="feature-request-text">{bug.text}</p>
                            <span className="feature-request-date">
                              {new Date(bug.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <button className="task-edit" onClick={() => startEditingBug(bug)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="task-delete" onClick={() => deleteBugReport(bug.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {getCompletedBugs().length > 0 && (
                <div className="completed-features-section">
                  <span className="completed-features-label">Fixed</span>
                  <div className="feature-requests-list completed">
                    {getCompletedBugs().map((bug) => (
                      <div key={bug.id} className="feature-request-item completed">
                        <button className="checkbox" onClick={() => uncompleteBugReport(bug.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <div className="feature-request-content">
                          <p className="feature-request-text">{bug.text}</p>
                          <span className="feature-request-date">
                            Fixed {new Date(bug.completedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <button className="task-delete" onClick={() => deleteBugReport(bug.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
