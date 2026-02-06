import { useState } from "react";
import { useOneOnOnes } from "../../hooks/useOneOnOnes";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { OneOnOneCadence, OneOnOneNoteType } from "../../types";
import { formatRelativeTime } from "../../utils/formatUtils";

interface OneOnOnesViewProps {
  onScheduleNote?: (noteId: string) => void;
}

const NOTE_TYPE_LABELS: Record<OneOnOneNoteType, string> = {
  topic: "Topic",
  action: "Action",
  feedback: "Feedback",
};

const DAY_OPTIONS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export function OneOnOnesView({ onScheduleNote }: OneOnOnesViewProps) {
  const { showConfirm } = useConfirmModal();
  const {
    getConfig,
    getPendingNotes,
    getSessionNotes,
    getSessionsForConfig,
    saveConfig,
    addNote,
    updateNote,
    deleteNote,
    completeSession,
  } = useOneOnOnes();

  const config = getConfig();

  const [showSetup, setShowSetup] = useState(false);
  const [setupName, setSetupName] = useState(config?.personName || "");
  const [setupDay, setSetupDay] = useState(config?.dayOfWeek || "wednesday");
  const [setupCadence, setSetupCadence] = useState<OneOnOneCadence>(
    (config?.cadence as OneOnOneCadence) || "weekly"
  );

  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<OneOnOneNoteType>("topic");

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [editNoteType, setEditNoteType] = useState<OneOnOneNoteType>("topic");

  const pendingNotes = config ? getPendingNotes(config.id) : [];
  const sessions = config ? getSessionsForConfig(config.id) : [];

  const handleSaveConfig = async () => {
    if (!setupName.trim()) return;
    await saveConfig({
      personName: setupName.trim(),
      dayOfWeek: setupDay,
      cadence: setupCadence,
    });
    setShowSetup(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !config) return;
    await addNote(noteText, noteType, config.id);
    setNoteText("");
  };

  const handleUpdateNote = async () => {
    if (!editingNoteId || !editNoteText.trim()) return;
    await updateNote(editingNoteId, editNoteText, editNoteType);
    setEditingNoteId(null);
    setEditNoteText("");
  };

  const handleDeleteNote = (noteId: string) => {
    showConfirm("Delete this note?", () => deleteNote(noteId));
  };

  const handleCompleteSession = () => {
    if (!config || pendingNotes.length === 0) return;
    showConfirm(
      `Complete session? ${pendingNotes.length} note${pendingNotes.length === 1 ? "" : "s"} will be archived.`,
      () => completeSession(config.id)
    );
  };

  const startEditNote = (noteId: string, text: string, type: OneOnOneNoteType) => {
    setEditingNoteId(noteId);
    setEditNoteText(text);
    setEditNoteType(type);
  };

  const topicNotes = pendingNotes.filter((n) => n.noteType === "topic");
  const actionNotes = pendingNotes.filter((n) => n.noteType === "action");
  const feedbackNotes = pendingNotes.filter((n) => n.noteType === "feedback");

  if (!config && !showSetup) {
    return (
      <div className="view one-on-ones-view">
        <header className="view-header entrance-1">
          <h1>1-1s</h1>
        </header>
        <div className="one-on-ones-empty">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p>Set up your 1-1 to start tracking notes</p>
          <button className="btn-save" onClick={() => setShowSetup(true)}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view one-on-ones-view">
      <header className="view-header entrance-1">
        <h1>1-1s</h1>
        {config && !showSetup && (
          <button className="btn-add" onClick={handleCompleteSession} disabled={pendingNotes.length === 0}>
            Complete Session
          </button>
        )}
      </header>

      {(showSetup || !config) ? (
        <div className="one-on-ones-setup entrance-2">
          <h3>{config ? "Edit 1-1 Setup" : "Set Up Your 1-1"}</h3>
          <div className="setup-field">
            <label>Person</label>
            <input
              type="text"
              placeholder="Name"
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              className="modal-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && setupName.trim()) handleSaveConfig();
                if (e.key === "Escape") setShowSetup(false);
              }}
            />
          </div>
          <div className="setup-field">
            <label>Day</label>
            <select
              value={setupDay}
              onChange={(e) => setSetupDay(e.target.value)}
              className="task-goal-select"
            >
              {DAY_OPTIONS.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="setup-field">
            <label>Cadence</label>
            <div className="note-type-toggle">
              <button
                className={`note-type-btn ${setupCadence === "weekly" ? "active" : ""}`}
                onClick={() => setSetupCadence("weekly")}
              >
                Weekly
              </button>
              <button
                className={`note-type-btn ${setupCadence === "biweekly" ? "active" : ""}`}
                onClick={() => setSetupCadence("biweekly")}
              >
                Biweekly
              </button>
            </div>
          </div>
          <div className="task-form-actions">
            <button className="btn-save" onClick={handleSaveConfig} disabled={!setupName.trim()}>
              Save
            </button>
            {config && (
              <button className="btn-cancel" onClick={() => setShowSetup(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="one-on-ones-config-bar entrance-2">
            <span className="config-person">{config.personName}</span>
            <span className="config-divider">/</span>
            <span className="config-day">{config.dayOfWeek.charAt(0).toUpperCase() + config.dayOfWeek.slice(1)}</span>
            <span className="config-divider">/</span>
            <span className="config-cadence">{config.cadence === "weekly" ? "Weekly" : "Biweekly"}</span>
            <button className="config-edit-btn" onClick={() => {
              setSetupName(config.personName);
              setSetupDay(config.dayOfWeek);
              setSetupCadence(config.cadence as OneOnOneCadence);
              setShowSetup(true);
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>

          <div className="one-on-ones-add-note entrance-3">
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
            <div className="note-input-row">
              <input
                type="text"
                placeholder={`Add ${noteType}...`}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="modal-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && noteText.trim()) handleAddNote();
                }}
              />
              <button className="btn-save" onClick={handleAddNote} disabled={!noteText.trim()}>
                Add
              </button>
            </div>
          </div>

          {pendingNotes.length > 0 && (
            <div className="one-on-ones-pending entrance-3">
              <h3>Next 1-1</h3>
              {[
                { label: "Topics", notes: topicNotes, type: "topic" as const },
                { label: "Action Items", notes: actionNotes, type: "action" as const },
                { label: "Feedback", notes: feedbackNotes, type: "feedback" as const },
              ].filter(({ notes }) => notes.length > 0).map(({ label, notes, type }) => (
                <div key={type} className="note-group">
                  <h4 className="note-group-label">{label}</h4>
                  {notes.map((note) => (
                    <div key={note.id} className={`one-on-one-note-card ${type}`}>
                      {editingNoteId === note.id ? (
                        <div className="note-edit-form">
                          <div className="note-type-toggle small">
                            {(["topic", "action", "feedback"] as OneOnOneNoteType[]).map((t) => (
                              <button
                                key={t}
                                className={`note-type-btn ${editNoteType === t ? "active" : ""}`}
                                onClick={() => setEditNoteType(t)}
                              >
                                {NOTE_TYPE_LABELS[t]}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            className="modal-input"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editNoteText.trim()) handleUpdateNote();
                              if (e.key === "Escape") setEditingNoteId(null);
                            }}
                          />
                          <div className="task-form-actions">
                            <button className="btn-save" onClick={handleUpdateNote} disabled={!editNoteText.trim()}>
                              Save
                            </button>
                            <button className="btn-cancel" onClick={() => setEditingNoteId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className={`note-type-badge ${note.noteType}`}>
                            {NOTE_TYPE_LABELS[note.noteType]}
                          </span>
                          <span className="note-text">{note.text}</span>
                          {note.scheduledAsTaskId && (
                            <span className="note-scheduled-indicator">Scheduled</span>
                          )}
                          <div className="note-actions">
                            {note.noteType === "action" && !note.scheduledAsTaskId && onScheduleNote && (
                              <button
                                className="note-action-btn"
                                onClick={() => onScheduleNote(note.id)}
                                title="Schedule as task"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                              </button>
                            )}
                            <button
                              className="note-action-btn"
                              onClick={() => startEditNote(note.id, note.text, note.noteType)}
                              title="Edit"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                            <button
                              className="note-action-btn"
                              onClick={() => handleDeleteNote(note.id)}
                              title="Delete"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {pendingNotes.length === 0 && (
            <div className="one-on-ones-empty-notes entrance-3">
              <p>No pending notes. Add topics, action items, or feedback above.</p>
            </div>
          )}

          {sessions.length > 0 && (
            <div className="one-on-ones-sessions entrance-4">
              <h3>Past Sessions</h3>
              {sessions.map((session) => {
                const sessionNotes = getSessionNotes(session.id);
                return (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <span className="session-date">
                        {new Date(session.date + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="session-meta">{formatRelativeTime(session.completedAt)}</span>
                    </div>
                    <div className="session-notes">
                      {sessionNotes.map((note) => (
                        <div key={note.id} className={`session-note ${note.noteType}`}>
                          <span className={`note-type-badge small ${note.noteType}`}>
                            {NOTE_TYPE_LABELS[note.noteType]}
                          </span>
                          <span className="note-text">{note.text}</span>
                        </div>
                      ))}
                      {sessionNotes.length === 0 && (
                        <p className="session-empty">No notes recorded</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
