import { useReviews, parsePrLink } from "../../hooks/useReviews";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { formatRelativeTime, formatFullDate } from "../../utils/formatUtils";
import { getTodayDate } from "../../utils/dateUtils";
import { ReviewSource } from "../../types";

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="review-source-icon">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const GraphiteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="review-source-icon">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SourceIcon = ({ source }: { source?: ReviewSource }) => {
  if (source === "graphite") return <GraphiteIcon />;
  return <GitHubIcon />;
};

export function ReviewsView() {
  const { showConfirm } = useConfirmModal();
  const {
    showForm,
    setShowForm,
    prLink,
    setPrLink,
    editingId,
    editPrLink,
    setEditPrLink,
    isReReview,
    setIsReReview,
    getReviews,
    addReview,
    toggleComplete,
    deleteReview,
    startEditing,
    cancelEditing,
    updateReview,
    checkDuplicate,
  } = useReviews();

  const reviews = getReviews();
  const today = getTodayDate();
  const todayReviews = reviews.filter((r) => r.date === today);
  const olderReviews = reviews.filter((r) => r.date !== today);

  const handleDelete = (id: string) => {
    showConfirm("Delete this review?", () => deleteReview(id));
  };

  const { isValid: isPrLinkValid } = parsePrLink(prLink);
  const { isValid: isEditPrLinkValid } = parsePrLink(editPrLink);
  const isPrLinkDuplicate = Boolean(prLink && isPrLinkValid && checkDuplicate(prLink));
  const isEditPrLinkDuplicate = Boolean(editPrLink && isEditPrLinkValid && checkDuplicate(editPrLink, editingId || undefined));

  return (
    <div className="view reviews-view">
      <header className="view-header">
        <h1>Reviews</h1>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          Add Review
        </button>
      </header>

      {showForm && (
        <div className="review-form entrance-1">
          <input
            type="text"
            placeholder="Paste GitHub or Graphite PR link..."
            value={prLink}
            onChange={(e) => setPrLink(e.target.value)}
            className={`review-link-input ${prLink && (!isPrLinkValid || (isPrLinkDuplicate && !isReReview)) ? "invalid" : ""}`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && isPrLinkValid && (!isPrLinkDuplicate || isReReview)) addReview();
              if (e.key === "Escape") {
                setShowForm(false);
                setPrLink("");
                setIsReReview(false);
              }
            }}
          />
          {prLink && isPrLinkValid && (!isPrLinkDuplicate || isReReview) && (
            <p className="review-preview">{parsePrLink(prLink).title}</p>
          )}
          {prLink && !isPrLinkValid && (
            <p className="review-error">Please enter a valid GitHub or Graphite PR URL</p>
          )}
          {isPrLinkDuplicate && (
            <label className="re-review-label">
              <input
                type="checkbox"
                checked={isReReview}
                onChange={(e) => setIsReReview(e.target.checked)}
              />
              <span>Re-review (this PR was already reviewed)</span>
            </label>
          )}
          <div className="form-actions">
            <button className="btn-save" onClick={addReview} disabled={!isPrLinkValid || (isPrLinkDuplicate && !isReReview)}>
              Add
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowForm(false);
                setPrLink("");
                setIsReReview(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <p>No PR reviews yet</p>
          <span>Track the pull requests you review</span>
        </div>
      ) : (
        <div className="reviews-list">
          {todayReviews.length > 0 && (
            <>
              <div className="section-header">
                <span>Today ({todayReviews.length})</span>
              </div>
              {todayReviews.map((review) => {
                const isEditing = editingId === review.id;
                return (
                  <div key={review.id} className={`review-card ${review.completed ? "completed" : ""} ${isEditing ? "editing" : ""}`}>
                    {isEditing ? (
                      <div className="review-edit-form">
                        <input
                          type="text"
                          value={editPrLink}
                          onChange={(e) => setEditPrLink(e.target.value)}
                          className={`review-link-input ${editPrLink && (!isEditPrLinkValid || isEditPrLinkDuplicate) ? "invalid" : ""}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && isEditPrLinkValid && !isEditPrLinkDuplicate) updateReview();
                            if (e.key === "Escape") cancelEditing();
                          }}
                        />
                        {editPrLink && isEditPrLinkValid && !isEditPrLinkDuplicate && (
                          <p className="review-preview">{parsePrLink(editPrLink).title}</p>
                        )}
                        {isEditPrLinkDuplicate && (
                          <p className="review-error">This PR has already been added</p>
                        )}
                        <div className="form-actions">
                          <button className="btn-save" onClick={updateReview} disabled={!isEditPrLinkValid || isEditPrLinkDuplicate}>
                            Save
                          </button>
                          <button className="btn-cancel" onClick={cancelEditing}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button className={`checkbox ${review.completed ? "checked" : ""}`} onClick={() => toggleComplete(review.id)}>
                          {review.completed && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                        <div className="review-content">
                          <div className="review-title-row">
                            <SourceIcon source={review.source} />
                            <a
                              href={review.prLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="review-title"
                            >
                              {review.title}
                            </a>
                          </div>
                          <span className="review-timestamp" title={formatFullDate(review.createdAt)}>
                            {formatRelativeTime(review.createdAt)}
                          </span>
                        </div>
                        <div className="review-actions">
                          <button className="action-btn" onClick={() => startEditing(review)} title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="action-btn delete" onClick={() => handleDelete(review.id)} title="Delete">
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
            </>
          )}

          {olderReviews.length > 0 && (
            <>
              <div className="section-divider">
                <span>Earlier</span>
              </div>
              {olderReviews.map((review) => (
                <div key={review.id} className={`review-card ${review.completed ? "completed" : ""}`}>
                  <button className={`checkbox ${review.completed ? "checked" : ""}`} onClick={() => toggleComplete(review.id)}>
                    {review.completed && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <div className="review-content">
                    <div className="review-title-row">
                      <SourceIcon source={review.source} />
                      <a
                        href={review.prLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="review-title"
                      >
                        {review.title}
                      </a>
                    </div>
                    <span className="review-timestamp" title={formatFullDate(review.createdAt)}>
                      {formatRelativeTime(review.createdAt)}
                    </span>
                  </div>
                  <div className="review-actions">
                    <button className="action-btn delete" onClick={() => handleDelete(review.id)} title="Delete">
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
