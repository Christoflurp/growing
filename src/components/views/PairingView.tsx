import { useState, useEffect, useRef } from "react";
import { usePairing } from "../../hooks/usePairing";
import { useConfirmModal } from "../../context/ConfirmModalContext";

function useSessionTimer(createdAt: string | undefined) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!createdAt) {
      setElapsed(0);
      return;
    }
    const startMs = new Date(createdAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (!createdAt) return "";
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export function PairingView() {
  const { showConfirm } = useConfirmModal();
  const {
    getPartners,
    addPartner,
    removePartner,
    getActiveSession,
    getCompletedSessions,
    getSessionNotes,
    startSession,
    completeSession,
    updateSessionNotes,
    addNote,
    deleteNote,
    addFollowUpTodos,
  } = usePairing();

  const partners = getPartners();

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    partners[0]?.id || null
  );
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [topicText, setTopicText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [postSessionNotes, setPostSessionNotes] = useState("");
  const [justCompletedSessionId, setJustCompletedSessionId] = useState<string | null>(null);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [followUps, setFollowUps] = useState<Array<{ text: string }>>([]);

  const notesEndRef = useRef<HTMLDivElement>(null);

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) || null;
  const activeSession = selectedPartner ? getActiveSession(selectedPartner.id) : null;
  const completedSessions = selectedPartner ? getCompletedSessions(selectedPartner.id) : [];
  const activeSessionNotes = activeSession ? getSessionNotes(activeSession.id) : [];
  const viewedSession = viewingSessionId
    ? completedSessions.find((s) => s.id === viewingSessionId)
    : null;
  const viewedSessionNotes = viewedSession ? getSessionNotes(viewedSession.id) : [];
  const justCompletedSession = justCompletedSessionId
    ? completedSessions.find((s) => s.id === justCompletedSessionId)
    : null;
  const justCompletedSessionNotes = justCompletedSession ? getSessionNotes(justCompletedSession.id) : [];

  const timerDisplay = useSessionTimer(activeSession?.createdAt);

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSessionNotes.length]);

  const handleAddPartner = async () => {
    if (!newPartnerName.trim()) return;
    await addPartner(newPartnerName);
    setNewPartnerName("");
    setShowAddPartner(false);
    const updated = getPartners();
    const newest = updated[updated.length - 1];
    if (newest) setSelectedPartnerId(newest.id);
  };

  const handleRemovePartner = (id: string, name: string) => {
    showConfirm(`Remove ${name} and all their pairing data?`, async () => {
      await removePartner(id);
      const remaining = getPartners().filter((p) => p.id !== id);
      setSelectedPartnerId(remaining[0]?.id || null);
    });
  };

  const handleStartSession = async () => {
    if (!selectedPartner || !topicText.trim()) return;
    await startSession(selectedPartner.id, topicText);
    setTopicText("");
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedPartner || !activeSession) return;
    await addNote(selectedPartner.id, noteText, activeSession.id);
    setNoteText("");
  };

  const handleDeleteNote = (noteId: string) => {
    showConfirm("Delete this note?", () => deleteNote(noteId));
  };

  const handleWrapUp = async () => {
    if (!activeSession) return;
    await completeSession(activeSession.id);
    setJustCompletedSessionId(activeSession.id);
    setFollowUps([]);
    setFollowUpText("");
    setPostSessionNotes("");
  };

  const handleAddFollowUp = () => {
    if (!followUpText.trim()) return;
    setFollowUps((prev) => [...prev, { text: followUpText.trim() }]);
    setFollowUpText("");
  };

  const handleRemoveFollowUp = (index: number) => {
    setFollowUps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePostSession = async () => {
    if (!justCompletedSessionId || !justCompletedSession) return;
    if (postSessionNotes.trim()) {
      await updateSessionNotes(justCompletedSessionId, postSessionNotes);
    }
    if (followUps.length > 0 && selectedPartner) {
      await addFollowUpTodos(followUps, selectedPartner.personName, justCompletedSession.topic);
    }
    setPostSessionNotes("");
    setFollowUps([]);
    setFollowUpText("");
    setJustCompletedSessionId(null);
  };

  const handleSkipPostSession = () => {
    setPostSessionNotes("");
    setFollowUps([]);
    setFollowUpText("");
    setJustCompletedSessionId(null);
  };

  if (partners.length === 0 && !showAddPartner) {
    return (
      <div className="view pairing-view">
        <div className="pairing-crt">
          <div className="crt-header entrance-1">
            <span className="crt-title">PEAR PROGRAMMING // TERMINAL v1.0</span>
          </div>
          <div className="pairing-empty entrance-2">
            <div className="crt-empty-block">
              <p className="crt-prompt-line">&gt; NO ACTIVE PARTNERS_</p>
              <p className="crt-prompt-line dim">&gt; type "pear up" to begin...</p>
            </div>
            <button className="crt-btn primary" onClick={() => setShowAddPartner(true)}>
              Pear Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view pairing-view">
      <div className="pairing-crt">
        <div className="crt-header entrance-1">
          <span className="crt-title">PEAR PROGRAMMING // TERMINAL v1.0</span>
          {activeSession && !justCompletedSessionId && (
            <button className="crt-btn primary" onClick={handleWrapUp}>
              Wrap Up
            </button>
          )}
        </div>

        <div className="crt-partner-bar entrance-2">
          <div className="crt-partner-chips">
            {partners.map((partner) => {
              const isActive = partner.id === selectedPartnerId;
              const hasActiveSession = !!getActiveSession(partner.id);
              return (
                <button
                  key={partner.id}
                  className={`crt-folder ${isActive ? "active" : ""} ${hasActiveSession ? "has-session" : ""}`}
                  onClick={() => setSelectedPartnerId(partner.id)}
                  title={partner.personName}
                >
                  <div className="crt-folder-icon">
                    <svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2 10 L2 36 C2 37.1 2.9 38 4 38 L44 38 C45.1 38 46 37.1 46 36 L46 12 C46 10.9 45.1 10 44 10 L24 10 L20 6 L4 6 C2.9 6 2 6.9 2 8 L2 10 Z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="crt-folder-label">{partner.personName}</div>
                </button>
              );
            })}
            <button
              className="crt-folder add"
              onClick={() => setShowAddPartner(true)}
              title="Add pairing partner"
            >
              <div className="crt-folder-icon">
                <svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2 10 L2 36 C2 37.1 2.9 38 4 38 L44 38 C45.1 38 46 37.1 46 36 L46 12 C46 10.9 45.1 10 44 10 L24 10 L20 6 L4 6 C2.9 6 2 6.9 2 8 L2 10 Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="24" y1="16" x2="24" y2="32" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="24" x2="32" y2="24" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="crt-folder-label">+ Add</div>
            </button>
          </div>
        </div>

        {showAddPartner && (
          <div className="crt-add-partner entrance-2">
            <div className="crt-input-row">
              <span className="crt-prompt">&gt;</span>
              <input
                type="text"
                placeholder="enter partner name..."
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                className="crt-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPartnerName.trim()) handleAddPartner();
                  if (e.key === "Escape") {
                    setShowAddPartner(false);
                    setNewPartnerName("");
                  }
                }}
              />
            </div>
            <div className="crt-form-actions">
              <button className="crt-btn primary" onClick={handleAddPartner} disabled={!newPartnerName.trim()}>
                Add
              </button>
              <button className="crt-btn" onClick={() => { setShowAddPartner(false); setNewPartnerName(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedPartner && (
          <>
            <div className="crt-partner-header entrance-2">
              <span className="crt-partner-name">// {selectedPartner.personName.toUpperCase()}</span>
              <button
                className="crt-btn-icon"
                onClick={() => handleRemovePartner(selectedPartner.id, selectedPartner.personName)}
                title="Remove partner"
              >
                [DEL]
              </button>
            </div>

            <div className="crt-terminal-area entrance-3">
              {justCompletedSession ? (
                <div className="crt-post-session">
                  <div className="crt-post-session-label">// SESSION COMPLETED - WRAP UP</div>
                  <div className="crt-post-session-helper">&gt; session archived. add notes or follow-ups below.</div>
                  <div className="crt-session-box">
                    <div className="crt-session-box-top">
                      <span className="crt-box-corner">+-</span>
                      <span className="crt-box-label"> SESSION: {justCompletedSession.topic} </span>
                      <span className="crt-box-line" />
                    </div>
                    <div className="crt-session-box-body">
                      {justCompletedSessionNotes.length === 0 && (
                        <p className="crt-empty-session-msg">| no notes logged.</p>
                      )}
                      {justCompletedSessionNotes.map((note) => (
                        <div key={note.id} className="crt-log-entry">
                          <span className="crt-log-pipe">|</span>
                          <span className="crt-log-text">{note.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="crt-session-box-bottom">
                      <span className="crt-box-corner">+-</span>
                      <span className="crt-box-line" />
                    </div>
                  </div>

                  <div className="crt-post-section">
                    <div className="crt-post-section-header">// SUMMARY</div>
                    <textarea
                      placeholder="summary notes..."
                      value={postSessionNotes}
                      onChange={(e) => setPostSessionNotes(e.target.value)}
                      className="crt-textarea"
                      autoFocus
                    />
                  </div>

                  <div className="crt-post-section">
                    <div className="crt-post-section-header">// FOLLOW-UP ITEMS (added to backlog)</div>
                    <div className="crt-followup-list">
                      {followUps.map((item, i) => (
                        <div key={i} className="crt-followup-item">
                          <span className="crt-log-pipe">|</span>
                          <span className="crt-followup-text">{item.text}</span>
                          <button
                            className="crt-log-delete"
                            onClick={() => handleRemoveFollowUp(i)}
                            title="Remove"
                            style={{ opacity: 1 }}
                          >
                            [x]
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="crt-input-row">
                      <span className="crt-prompt">&gt;</span>
                      <input
                        type="text"
                        placeholder="add follow-up for backlog..."
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                        className="crt-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && followUpText.trim()) handleAddFollowUp();
                        }}
                      />
                      <button className="crt-btn primary" onClick={handleAddFollowUp} disabled={!followUpText.trim()}>
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="crt-post-session-actions">
                    <button className="crt-btn primary" onClick={handleSavePostSession}>
                      Done
                    </button>
                    <button className="crt-btn" onClick={handleSkipPostSession}>
                      Skip
                    </button>
                  </div>
                </div>
              ) : viewedSession ? (
                <div className="crt-viewed-session">
                  <div className="crt-viewed-label">// VIEWING PAST SESSION (READ-ONLY)</div>
                  <div className="crt-session-box">
                    <div className="crt-session-box-top">
                      <span className="crt-box-corner">+-</span>
                      <span className="crt-box-label"> SESSION: {viewedSession.topic} </span>
                      <span className="crt-box-line" />
                    </div>
                    <div className="crt-session-box-body">
                      {viewedSessionNotes.length === 0 && (
                        <p className="crt-empty-session-msg">| no notes logged.</p>
                      )}
                      {viewedSessionNotes.map((note) => (
                        <div key={note.id} className="crt-log-entry">
                          <span className="crt-log-pipe">|</span>
                          <span className="crt-log-text">{note.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="crt-session-box-bottom">
                      <span className="crt-box-corner">+-</span>
                      <span className="crt-box-line" />
                    </div>
                  </div>
                  {viewedSession.notes && (
                    <div className="crt-viewed-summary">
                      <div className="crt-divider">// SUMMARY</div>
                      <div className="crt-summary-text">{viewedSession.notes}</div>
                    </div>
                  )}
                  <button className="crt-btn primary" onClick={() => setViewingSessionId(null)}>
                    [BACK]
                  </button>
                </div>
              ) : activeSession ? (
                <div className="crt-active-session">
                  <div className="crt-session-box crt-session-shell">
                    <div className="crt-session-box-top">
                      <span className="crt-box-corner">+-</span>
                      <span className="crt-box-label"> SESSION: {activeSession.topic} </span>
                      <span className="crt-session-timer">[{timerDisplay}]</span>
                      <span className="crt-box-line" />
                    </div>
                    <div className="crt-session-shell-body">
                      <div className="crt-session-shell-scroll">
                        {activeSessionNotes.length === 0 && (
                          <p className="crt-empty-session-msg">| no notes yet. start logging below.</p>
                        )}
                        {activeSessionNotes.map((note) => (
                          <div key={note.id} className="crt-log-entry">
                            <span className="crt-log-pipe">|</span>
                            <span className="crt-log-text">{note.text}</span>
                            <button
                              className="crt-log-delete"
                              onClick={() => handleDeleteNote(note.id)}
                              title="Delete"
                            >
                              [x]
                            </button>
                          </div>
                        ))}
                        <div ref={notesEndRef} />
                      </div>
                      <div className="crt-shell-input">
                        <span className="crt-log-pipe">|</span>
                        <span className="crt-prompt">&gt;</span>
                        <input
                          type="text"
                          placeholder="add note..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="crt-input"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && noteText.trim()) handleAddNote();
                          }}
                        />
                      </div>
                    </div>
                    <div className="crt-session-box-bottom">
                      <span className="crt-box-corner">+-</span>
                      <span className="crt-box-line" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="crt-start-session">
                  <div className="crt-divider">// START NEW SESSION</div>
                  <div className="crt-input-row">
                    <span className="crt-prompt">&gt;</span>
                    <input
                      type="text"
                      placeholder="what are you pairing on?..."
                      value={topicText}
                      onChange={(e) => setTopicText(e.target.value)}
                      className="crt-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && topicText.trim()) handleStartSession();
                      }}
                    />
                    <button
                      className="crt-btn primary"
                      onClick={handleStartSession}
                      disabled={!topicText.trim()}
                    >
                      Start
                    </button>
                  </div>
                </div>
              )}
            </div>

            {completedSessions.length > 0 && (
              <div className="crt-session-history entrance-4">
                <div className="crt-divider">// SESSION LOG</div>
                <div className="crt-history-list">
                  {completedSessions.map((session) => {
                    const sNotes = getSessionNotes(session.id);
                    const isViewing = viewingSessionId === session.id;
                    return (
                      <button
                        key={session.id}
                        className={`crt-history-item ${isViewing ? "active" : ""}`}
                        onClick={() => setViewingSessionId(isViewing ? null : session.id)}
                      >
                        <span className="crt-history-indicator">{isViewing ? ">" : " "}</span>
                        <span className="crt-history-title">{session.topic || "Untitled session"}</span>
                        <span className="crt-history-meta">
                          {new Date(session.date + "T12:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="crt-history-count">({sNotes.length} {sNotes.length === 1 ? "note" : "notes"})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
