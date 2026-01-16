import { useEffect } from "react";
import { useFeatureRequests } from "../../hooks/useFeatureRequests";
import { useConfirmModal } from "../../context/ConfirmModalContext";

interface FeatureRequestsModalProps {
  show: boolean;
  onClose: () => void;
}

export function FeatureRequestsModal({ show, onClose }: FeatureRequestsModalProps) {
  const { showConfirm } = useConfirmModal();
  const {
    showFeatureForm,
    setShowFeatureForm,
    featureText,
    setFeatureText,
    editingFeatureId,
    editFeatureText,
    setEditFeatureText,
    addFeatureRequest,
    deleteFeatureRequest: performDeleteFeatureRequest,
    startEditingFeature,
    cancelEditingFeature,
    updateFeatureRequest,
    completeFeatureRequest,
    uncompleteFeatureRequest,
    getPendingFeatures,
    getCompletedFeatures,
  } = useFeatureRequests();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !editingFeatureId && !showFeatureForm) {
        onClose();
      }
    };
    if (show) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [show, onClose, editingFeatureId, showFeatureForm]);

  const deleteFeatureRequest = (featureId: string) => {
    showConfirm("Delete this feature request?", () => performDeleteFeatureRequest(featureId));
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feature-requests-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feature-requests-modal-header">
          <h2>Feature Requests</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="feature-requests-modal-content">
          {!showFeatureForm ? (
            <button className="add-feature-btn" onClick={() => setShowFeatureForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Feature Request
            </button>
          ) : (
            <div className="feature-add-form">
              <input
                type="text"
                placeholder="Describe the feature or improvement..."
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                className="task-text-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && featureText.trim()) addFeatureRequest();
                  if (e.key === "Escape") {
                    setShowFeatureForm(false);
                    setFeatureText("");
                  }
                }}
              />
              <div className="task-form-actions">
                <button className="btn-save" onClick={addFeatureRequest} disabled={!featureText.trim()}>
                  Add
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowFeatureForm(false);
                    setFeatureText("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {getPendingFeatures().length === 0 && getCompletedFeatures().length === 0 && !showFeatureForm ? (
            <div className="feature-requests-empty">
              <p>No feature requests yet</p>
              <span>Ideas for improving the app go here</span>
            </div>
          ) : (
            <>
              <div className="feature-requests-list">
                {getPendingFeatures().map((feature) => {
                  const isEditing = editingFeatureId === feature.id;
                  return (
                    <div key={feature.id} className={`feature-request-item ${isEditing ? "editing" : ""}`}>
                      {isEditing ? (
                        <div className="feature-edit-form">
                          <input
                            type="text"
                            value={editFeatureText}
                            onChange={(e) => setEditFeatureText(e.target.value)}
                            className="task-text-input"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editFeatureText.trim()) updateFeatureRequest();
                              if (e.key === "Escape") cancelEditingFeature();
                            }}
                          />
                          <div className="task-form-actions">
                            <button className="btn-save" onClick={updateFeatureRequest} disabled={!editFeatureText.trim()}>
                              Save
                            </button>
                            <button className="btn-cancel" onClick={cancelEditingFeature}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button className="checkbox" onClick={() => completeFeatureRequest(feature.id)}>
                          </button>
                          <div className="feature-request-content">
                            <p className="feature-request-text">{feature.text}</p>
                            <span className="feature-request-date">
                              {new Date(feature.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <button className="task-edit" onClick={() => startEditingFeature(feature)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="task-delete" onClick={() => deleteFeatureRequest(feature.id)}>
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

              {getCompletedFeatures().length > 0 && (
                <div className="completed-features-section">
                  <span className="completed-features-label">Completed</span>
                  <div className="feature-requests-list completed">
                    {getCompletedFeatures().map((feature) => (
                      <div key={feature.id} className="feature-request-item completed">
                        <button className="checkbox" onClick={() => uncompleteFeatureRequest(feature.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <div className="feature-request-content">
                          <p className="feature-request-text">{feature.text}</p>
                          <span className="feature-request-date">
                            Completed {new Date(feature.completedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <button className="task-delete" onClick={() => deleteFeatureRequest(feature.id)}>
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
