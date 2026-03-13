import { useState, useEffect, useRef } from "react";
import { useAppData } from "../../context/AppDataContext";
import { FullMarkdown } from "./FullMarkdown";

interface QuestionsModalProps {
  show: boolean;
  onClose: () => void;
}

export function QuestionsModal({ show, onClose }: QuestionsModalProps) {
  const { data, saveData } = useAppData();
  const [text, setText] = useState(data?.questionsText || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (show) {
      setText(data?.questionsText || "");
      setIsEditing(!data?.questionsText);
    }
  }, [show, data?.questionsText]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  if (!show) return null;

  const handleSave = async () => {
    if (!data) return;
    await saveData({ ...data, questionsText: text || undefined });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSaveAsNote = async () => {
    if (!data || !text.trim()) return;
    const noteText = `**Questions**\n${text.trim()}`;
    await saveData({
      ...data,
      questionsText: text || undefined,
      quickNotes: [
        {
          id: crypto.randomUUID(),
          text: noteText,
          timestamp: new Date().toISOString(),
        },
        ...(data.quickNotes || []),
      ],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleClear = async () => {
    if (!data) return;
    setText("");
    await saveData({ ...data, questionsText: undefined });
    setIsEditing(true);
  };

  const hasContent = text.trim().length > 0;

  return (
    <div className="quick-note-overlay" onClick={onClose}>
      <div className="questions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="questions-modal-header">
          <h2>Questions</h2>
          <div className="questions-modal-actions">
            {hasContent && !isEditing && (
              <button className="questions-edit-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            )}
            {hasContent && (
              <button className="questions-note-btn" onClick={handleSaveAsNote} title="Save as a note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 3v4a1 1 0 001 1h4" />
                  <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
            {hasContent && (
              <button className="questions-clear-btn" onClick={handleClear} title="Clear">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <>
            <textarea
              ref={textareaRef}
              className="questions-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="- What's the latency budget for this endpoint?&#10;- How does the caching layer work?&#10;- ..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) {
                  handleSave();
                }
                if (e.key === "Escape") {
                  if (text !== (data?.questionsText || "")) {
                    handleSave();
                  } else {
                    onClose();
                  }
                }
              }}
            />
            <div className="questions-footer">
              <span className="quick-note-hint">Markdown supported · Cmd+Enter to save</span>
              {saved && <span className="questions-saved">Saved ✓</span>}
              <button
                className="quick-note-save"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </>
        ) : hasContent ? (
          <div className="questions-rendered" onClick={() => setIsEditing(true)}>
            <FullMarkdown content={text} />
            {saved && <span className="questions-saved">Saved ✓</span>}
          </div>
        ) : (
          <div className="questions-empty" onClick={() => setIsEditing(true)}>
            <p>Jot down questions as they come up</p>
          </div>
        )}
      </div>
    </div>
  );
}
