import { useState, useRef, useEffect } from "react";

interface CuriosityModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}

export function CuriosityModal({ show, onClose, onSave }: CuriosityModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), description.trim());
    setTitle("");
    setDescription("");
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="curiosity-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Curiosity</h2>
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
          placeholder="What do you want to learn?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="modal-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim()) handleSave();
            if (e.key === "Escape") handleClose();
          }}
        />
        <textarea
          placeholder="Why are you curious about this? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="modal-textarea"
        />
        <div className="modal-actions">
          <button className="btn-save" onClick={handleSave} disabled={!title.trim()}>
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
