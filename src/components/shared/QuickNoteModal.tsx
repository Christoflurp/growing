import { RefObject } from "react";

interface QuickNoteModalProps {
  show: boolean;
  value: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function QuickNoteModal({
  show,
  value,
  textareaRef,
  onChange,
  onClose,
  onSave,
}: QuickNoteModalProps) {
  if (!show) return null;

  return (
    <div className="quick-note-overlay" onClick={onClose}>
      <div className="quick-note-modal" onClick={(e) => e.stopPropagation()}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What's on your mind?"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              onSave();
            }
            if (e.key === "Escape") {
              onClose();
            }
          }}
        />
        <div className="quick-note-footer">
          <span className="quick-note-hint">Cmd + Enter to save</span>
          <button
            className="quick-note-save"
            onClick={onSave}
            disabled={!value.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
