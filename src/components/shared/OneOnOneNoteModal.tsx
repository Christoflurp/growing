import { useState, useRef, useEffect } from "react";
import { OneOnOneNoteType } from "../../types";

const NOTE_TYPE_LABELS: Record<OneOnOneNoteType, string> = {
  topic: "Topic",
  action: "Action",
  feedback: "Feedback",
};

interface OneOnOneNoteModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (text: string, noteType: OneOnOneNoteType) => void;
}

export function OneOnOneNoteModal({ show, onClose, onSave }: OneOnOneNoteModalProps) {
  const [text, setText] = useState("");
  const [noteType, setNoteType] = useState<OneOnOneNoteType>("topic");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim(), noteType);
    setText("");
    setNoteType("topic");
  };

  const handleClose = () => {
    setText("");
    setNoteType("topic");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="one-on-one-note-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add 1-1 Note</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="note-type-toggle">
          {(["topic", "action", "feedback"] as OneOnOneNoteType[]).map((type) => (
            <button
              key={type}
              className={`note-type-btn ${noteType === type ? "active" : ""}`}
              onClick={() => setNoteType(type)}
            >
              {NOTE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Add ${noteType}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="modal-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) handleSave();
            if (e.key === "Escape") handleClose();
          }}
        />
        <div className="modal-actions">
          <button className="btn-save" onClick={handleSave} disabled={!text.trim()}>
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
