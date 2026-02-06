import { useState, useRef, useEffect } from "react";
import { parsePrLink } from "../../hooks/useReviews";

interface ReviewModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (prLink: string, isReReview: boolean) => void;
  checkDuplicate?: (url: string) => boolean;
}

export function ReviewModal({ show, onClose, onSave, checkDuplicate }: ReviewModalProps) {
  const [prLink, setPrLink] = useState("");
  const [isReReview, setIsReReview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { title, isValid } = parsePrLink(prLink);
  const isDuplicate = Boolean(prLink && isValid && checkDuplicate?.(prLink));

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  const canSubmit = isValid && (!isDuplicate || isReReview);

  const handleSave = () => {
    if (!canSubmit) return;
    onSave(prLink.trim(), isReReview);
    setPrLink("");
    setIsReReview(false);
  };

  const handleClose = () => {
    setPrLink("");
    setIsReReview(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Review</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Paste GitHub or Graphite PR link..."
          value={prLink}
          onChange={(e) => {
            setPrLink(e.target.value);
            setIsReReview(false);
          }}
          className={`modal-input ${prLink && (!isValid || (isDuplicate && !isReReview)) ? "invalid" : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit) handleSave();
            if (e.key === "Escape") handleClose();
          }}
        />
        {prLink && isValid && (!isDuplicate || isReReview) && <p className="review-preview">{title}</p>}
        {prLink && !isValid && <p className="review-error">Please enter a valid GitHub or Graphite PR URL</p>}
        {isDuplicate && (
          <label className="re-review-label">
            <input
              type="checkbox"
              checked={isReReview}
              onChange={(e) => setIsReReview(e.target.checked)}
            />
            <span>Re-review (this PR was already reviewed)</span>
          </label>
        )}
        <div className="modal-actions">
          <button className="btn-save" onClick={handleSave} disabled={!canSubmit}>
            Add
          </button>
          <button className="btn-cancel" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
