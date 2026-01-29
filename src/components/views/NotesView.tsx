import { useAppData } from "../../context/AppDataContext";
import { useQuickNotes } from "../../hooks/useQuickNotes";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { formatRelativeTime, formatFullDate } from "../../utils/formatUtils";
import { MarkdownText } from "../shared/MarkdownText";

interface NotesViewProps {
  onShowQuickNote: () => void;
}

export function NotesView({ onShowQuickNote }: NotesViewProps) {
  const { data } = useAppData();
  const { showConfirm } = useConfirmModal();
  const { deleteQuickNote: performDeleteQuickNote } = useQuickNotes();

  const deleteQuickNote = (noteId: string) => {
    showConfirm("Delete this note?", () => performDeleteQuickNote(noteId));
  };

  return (
    <div className="view notes-view">
      <header className="view-header">
        <h1>Notes</h1>
        <button className="add-btn" onClick={onShowQuickNote}>
          Add Note
        </button>
      </header>

      {(data?.quickNotes?.length ?? 0) === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 3v4a1 1 0 001 1h4" />
              <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p>No notes yet</p>
          <span>Capture thoughts as you go</span>
        </div>
      ) : (
        <div className="notes-list">
          {data?.quickNotes?.map((note) => (
            <div key={note.id} className="note-card">
              <p className="note-text"><MarkdownText text={note.text} /></p>
              <div className="note-footer">
                <span className="note-timestamp" title={formatFullDate(note.timestamp)}>
                  {formatRelativeTime(note.timestamp)}
                </span>
                <button className="note-delete" onClick={() => deleteQuickNote(note.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
