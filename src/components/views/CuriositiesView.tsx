import { useCuriosities } from "../../hooks/useCuriosities";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { formatRelativeTime, formatFullDate } from "../../utils/formatUtils";
import { MarkdownText } from "../shared/MarkdownText";

export function CuriositiesView() {
  const { showConfirm } = useConfirmModal();
  const {
    showForm,
    setShowForm,
    title,
    setTitle,
    description,
    setDescription,
    editingId,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    getCuriosities,
    addCuriosity,
    toggleComplete,
    deleteCuriosity,
    startEditing,
    cancelEditing,
    updateCuriosity,
  } = useCuriosities();

  const curiosities = getCuriosities();
  const incomplete = curiosities.filter((c) => !c.completed);
  const completed = curiosities.filter((c) => c.completed);

  const handleDelete = (id: string) => {
    showConfirm("Delete this curiosity?", () => deleteCuriosity(id));
  };

  return (
    <div className="view curiosities-view">
      <header className="view-header">
        <h1>Curiosities</h1>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          Add Curiosity
        </button>
      </header>

      {showForm && (
        <div className="curiosity-form entrance-1">
          <input
            type="text"
            placeholder="What do you want to learn?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="curiosity-title-input"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) addCuriosity();
              if (e.key === "Escape") {
                setShowForm(false);
                setTitle("");
                setDescription("");
              }
            }}
          />
          <textarea
            placeholder="Why are you curious about this? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="curiosity-description-input"
          />
          <div className="form-actions">
            <button className="btn-save" onClick={addCuriosity} disabled={!title.trim()}>
              Add
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setDescription("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {curiosities.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p>No curiosities yet</p>
          <span>Track things you want to learn</span>
        </div>
      ) : (
        <div className="curiosities-list">
          {incomplete.map((curiosity) => {
            const isEditing = editingId === curiosity.id;
            return (
              <div key={curiosity.id} className={`curiosity-card ${isEditing ? "editing" : ""}`}>
                {isEditing ? (
                  <div className="curiosity-edit-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="curiosity-title-input"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editTitle.trim()) updateCuriosity();
                        if (e.key === "Escape") cancelEditing();
                      }}
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="curiosity-description-input"
                      placeholder="Description (optional)"
                    />
                    <div className="form-actions">
                      <button className="btn-save" onClick={updateCuriosity} disabled={!editTitle.trim()}>
                        Save
                      </button>
                      <button className="btn-cancel" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="checkbox" onClick={() => toggleComplete(curiosity.id)}>
                      {curiosity.completed && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="curiosity-content">
                      <p className="curiosity-title">{curiosity.title}</p>
                      {curiosity.description && (
                        <p className="curiosity-description">
                          <MarkdownText text={curiosity.description} />
                        </p>
                      )}
                      <span className="curiosity-timestamp" title={formatFullDate(curiosity.createdAt)}>
                        {formatRelativeTime(curiosity.createdAt)}
                      </span>
                    </div>
                    <div className="curiosity-actions">
                      <button className="action-btn" onClick={() => startEditing(curiosity)} title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(curiosity.id)} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {completed.length > 0 && (
            <>
              <div className="section-divider">
                <span>Completed ({completed.length})</span>
              </div>
              {completed.map((curiosity) => (
                <div key={curiosity.id} className="curiosity-card completed">
                  <button className="checkbox checked" onClick={() => toggleComplete(curiosity.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <div className="curiosity-content">
                    <p className="curiosity-title">{curiosity.title}</p>
                    {curiosity.description && (
                      <p className="curiosity-description">
                        <MarkdownText text={curiosity.description} />
                      </p>
                    )}
                  </div>
                  <div className="curiosity-actions">
                    <button className="action-btn delete" onClick={() => handleDelete(curiosity.id)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
