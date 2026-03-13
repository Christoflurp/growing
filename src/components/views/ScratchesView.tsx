import { useState, useEffect, useRef, useCallback } from "react";
import { useScratches } from "../../hooks/useScratches";
import { useAppData } from "../../context/AppDataContext";
import { FullMarkdown } from "../shared/FullMarkdown";
import { ScratchFolder } from "../../types";

type NotebookState = "closed" | "opening" | "index" | "content";

function DeskClutter() {
  return (
    <>
      <svg className="desk-object desk-mug" viewBox="0 0 56 56">
        <ellipse cx="24" cy="28" rx="18" ry="18"
          fill="#3a2a1a" stroke="#2a1a0a" strokeWidth="2" />
        <ellipse cx="24" cy="28" rx="14" ry="14"
          fill="#1a0e06" />
        <ellipse cx="22" cy="26" rx="5" ry="3"
          fill="#3a2820" opacity="0.4"
          transform="rotate(-20 22 26)" />
        <path d="M42 22 Q52 22 52 30 Q52 38 42 38"
          fill="none" stroke="#3a2a1a" strokeWidth="3"
          strokeLinecap="round" />
      </svg>
      <svg className="desk-object desk-pencil" viewBox="0 0 100 16">
        <rect x="18" y="4" width="72" height="8" rx="1"
          fill="#c4a832" />
        <rect x="18" y="4" width="72" height="3" rx="1"
          fill="#d4b842" opacity="0.6" />
        <polygon points="18,4 18,12 8,8" fill="#f0dca0" />
        <polygon points="12,6.5 12,9.5 7,8" fill="#2c2418" />
        <rect x="82" y="3" width="12" height="10" rx="1"
          fill="#c0976a" />
        <rect x="90" y="3" width="6" height="10" rx="1"
          fill="#e8b8a0" />
      </svg>
      <svg className="desk-object desk-headphones" viewBox="0 0 64 48">
        <path d="M12 30 Q12 10 32 8 Q52 10 52 30"
          fill="none" stroke="#2a2a2a" strokeWidth="4"
          strokeLinecap="round" />
        <ellipse cx="12" cy="34" rx="8" ry="10"
          fill="#333" stroke="#222" strokeWidth="1.5" />
        <ellipse cx="12" cy="34" rx="5" ry="7" fill="#444" />
        <ellipse cx="52" cy="34" rx="8" ry="10"
          fill="#333" stroke="#222" strokeWidth="1.5" />
        <ellipse cx="52" cy="34" rx="5" ry="7" fill="#444" />
      </svg>
      <svg className="desk-object desk-clip" viewBox="0 0 16 40">
        <path d="M4 36 L4 8 Q4 2 8 2 Q12 2 12 8 L12 30
          Q12 34 8 34 Q4 34 4 30 L4 12"
          fill="none" stroke="#888" strokeWidth="1.5"
          strokeLinecap="round" />
      </svg>
      <svg className="desk-object desk-sticky" viewBox="0 0 44 44">
        <rect x="2" y="2" width="40" height="40" rx="1"
          fill="#f7e57a" opacity="0.8" />
        <line x1="8" y1="14" x2="36" y2="14"
          stroke="#d4c44a" strokeWidth="0.5" />
        <line x1="8" y1="22" x2="32" y2="22"
          stroke="#d4c44a" strokeWidth="0.5" />
        <line x1="8" y1="30" x2="28" y2="30"
          stroke="#d4c44a" strokeWidth="0.5" />
        <path d="M30 42 L42 42 L42 30 Z" fill="#e8d46a" />
      </svg>
    </>
  );
}

function useColumnPagination(contentRef: React.RefObject<HTMLDivElement | null>) {
  const [totalColumns, setTotalColumns] = useState(1);

  const measure = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const scrollW = el.scrollWidth;
    const clientW = el.clientWidth;
    if (clientW <= 0) return;
    setTotalColumns(Math.max(1, Math.round(scrollW / clientW)));
  }, [contentRef]);

  useEffect(() => {
    measure();
  }, [measure]);

  return { totalColumns, remeasure: measure };
}

export function ScratchesView() {
  const { data } = useAppData();
  const {
    folders, loading, error, fileContent, loadingFile,
    loadFolders, loadFile, clearFile
  } = useScratches();
  const [notebookState, setNotebookState] = useState<NotebookState>(
    "closed"
  );
  const [expandedFolder, setExpandedFolder] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<{
    folder: string; filename: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [spreading, setSpreading] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [turning, setTurning] = useState<
    "none" | "forward" | "back"
  >("none");
  const columnRef = useRef<HTMLDivElement>(null);
  const { totalColumns, remeasure } = useColumnPagination(
    columnRef
  );

  const enabled = data?.scratchesEnabled && data?.scratchesPath;

  useEffect(() => {
    if (enabled) loadFolders();
  }, [enabled, loadFolders]);

  useEffect(() => {
    if (fileContent && !loadingFile) {
      const timer = setTimeout(remeasure, 100);
      return () => clearTimeout(timer);
    }
  }, [fileContent, loadingFile, remeasure]);

  const totalSpreads = Math.max(1, Math.ceil(totalColumns / 2));

  const handleOpenNotebook = () => {
    setNotebookState("opening");
    setSpreading(true);
    setTimeout(() => setNotebookState("index"), 600);
  };

  const handleSelectEntry = (folder: string, filename: string) => {
    setSelectedFile({ folder, filename });
    setCurrentSpread(0);
    loadFile(folder, filename);
    setNotebookState("content");
  };

  const handleBackToIndex = () => {
    setSelectedFile(null);
    clearFile();
    setCurrentSpread(0);
    setNotebookState("index");
  };

  const turnDuration = 500;

  const handleNextSpread = () => {
    if (currentSpread >= totalSpreads - 1 || turning !== "none") {
      return;
    }
    setTurning("forward");
    setTimeout(() => {
      setCurrentSpread((s) => s + 1);
    }, turnDuration / 2);
    setTimeout(() => {
      setTurning("none");
    }, turnDuration);
  };

  const handlePrevSpread = () => {
    if (currentSpread <= 0 || turning !== "none") return;
    setTurning("back");
    setTimeout(() => {
      setCurrentSpread((s) => s - 1);
    }, turnDuration / 2);
    setTimeout(() => {
      setTurning("none");
    }, turnDuration);
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolder(
      expandedFolder === folderName ? null : folderName
    );
  };

  const filteredFolders = searchQuery
    ? folders.filter((f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : folders;

  const groupedByMonth = filteredFolders.reduce<
    Record<string, ScratchFolder[]>
  >((acc, folder) => {
    if (folder.date) {
      const monthKey = folder.date.slice(0, 7);
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(folder);
    } else {
      if (!acc["other"]) acc["other"] = [];
      acc["other"].push(folder);
    }
    return acc;
  }, {});

  const formatMonthHeader = (key: string): string => {
    if (key === "other") return "Other";
    const [year, month] = key.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleDateString("en-US", {
      year: "numeric", month: "long"
    });
  };

  const formatShortDate = (folder: ScratchFolder): string => {
    if (!folder.date) return "";
    const [, m, d] = folder.date.split("-");
    return `${m}/${d}`;
  };

  if (!enabled) {
    return (
      <div className="view scratches-view">
        <div className="notebook-empty-state" style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          height: "100%", gap: "8px", padding: "40px"
        }}>
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 3v4a1 1 0 001 1h4" />
              <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p>Scratches not configured</p>
          <span style={{ fontSize: "12px", opacity: 0.6 }}>
            Enable in Settings and select your scratches folder
          </span>
        </div>
      </div>
    );
  }

  const showCover = notebookState === "closed"
    || notebookState === "opening";
  const showPages = notebookState === "index"
    || notebookState === "content";

  const notebookClasses = [
    "moleskine-notebook",
    notebookState === "closed" ? "closed" : "",
    spreading ? "spread" : "",
  ].filter(Boolean).join(" ");

  const columnOffset = currentSpread * 2;

  return (
    <div className="view scratches-view">
      <div className="moleskine-desk">
        <DeskClutter />
        <div className={notebookClasses}>
          {showCover && (
            <div
              className={`moleskine-cover${
                notebookState === "opening" ? " opening" : ""
              }`}
              onClick={
                notebookState === "closed"
                  ? handleOpenNotebook
                  : undefined
              }
            >
              <div className="cover-strap" />
              <span className="cover-label">Scratches</span>
            </div>
          )}

          <div className={`moleskine-pages${
            showPages ? " visible" : ""
          }`}>
            {notebookState === "index" && (
              <>
                <div className="moleskine-page left-page index-page">
                  <div className="index-header entrance-1">
                    <h2>Index</h2>
                    <div className="index-count">
                      {folders.length} scratch
                      {folders.length !== 1 ? "es" : ""}
                    </div>
                  </div>
                  <div className="index-search entrance-2">
                    <input
                      type="text"
                      placeholder="Search scratches..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(
                        e.target.value
                      )}
                    />
                  </div>
                  <div className="index-entries entrance-3">
                    {loading ? (
                      <div className="page-loading">
                        Loading scratches...
                      </div>
                    ) : error ? (
                      <div className="page-loading">{error}</div>
                    ) : filteredFolders.length === 0 ? (
                      <div className="page-empty">
                        {searchQuery
                          ? "No matches found"
                          : "No scratches found"}
                      </div>
                    ) : (
                      Object.keys(groupedByMonth)
                        .sort().reverse()
                        .map((monthKey) => (
                          <div key={monthKey}>
                            <div className="index-month-label">
                              {formatMonthHeader(monthKey)}
                            </div>
                            {groupedByMonth[monthKey].map((f) => (
                              <div key={f.name}>
                                <button
                                  className="index-entry"
                                  onClick={() => {
                                    if (f.files.length === 1) {
                                      handleSelectEntry(
                                        f.name, f.files[0]
                                      );
                                    } else {
                                      toggleFolder(f.name);
                                    }
                                  }}
                                >
                                  <span className="index-entry-dot" />
                                  <span className="index-entry-title">
                                    {f.title}
                                  </span>
                                  <span className="index-entry-dots" />
                                  <span className="index-entry-meta">
                                    {formatShortDate(f)}
                                  </span>
                                  {f.files.length > 1 && (
                                    <span className="index-entry-files">
                                      [{f.files.length}]
                                    </span>
                                  )}
                                </button>
                                {expandedFolder === f.name && (
                                  <div className="index-sub-entries">
                                    {f.files.map((fn) => (
                                      <button
                                        key={fn}
                                        className="index-sub-entry"
                                        onClick={() =>
                                          handleSelectEntry(
                                            f.name, fn
                                          )
                                        }
                                      >
                                        <svg
                                          className="index-sub-entry-icon"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                        >
                                          <path d="M14 3v4a1 1 0 001 1h4" />
                                          <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="index-sub-entry-title">
                                          {fn.replace(".md", "")}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="moleskine-spine" />

                <div className="moleskine-page right-page">
                  <div className="right-page-empty">
                    <svg viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1">
                      <path d="M14 3v4a1 1 0 001 1h4" />
                      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                    </svg>
                    <span>Select a scratch</span>
                  </div>
                </div>
              </>
            )}

            {notebookState === "content" && selectedFile && (
              <>
                <div className="book-content-area">
                  {/* Title bar spanning full width */}
                  <div className="book-title-bar">
                    <button
                      className="content-back-btn"
                      onClick={handleBackToIndex}
                    >
                      <svg viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <div className="content-title-area">
                      <h2>
                        {selectedFile.filename.replace(".md", "")}
                      </h2>
                    </div>
                    <span className="content-subtitle">
                      {selectedFile.folder}
                    </span>
                  </div>

                  {/* Two-column paginated content */}
                  <div className="book-pages-viewport">
                    <div className="book-page-left" />
                    <div className="book-spine-gap" />
                    <div className="book-page-right" />

                    <div
                      ref={columnRef}
                      className="book-columns"
                      style={{
                        transform: `translateX(calc(-${columnOffset} * (50% + 6px)))`
                      }}
                    >
                      {loadingFile ? (
                        <div className="page-loading">
                          Loading...
                        </div>
                      ) : (
                        <FullMarkdown
                          content={fileContent || ""}
                        />
                      )}
                    </div>

                    {turning !== "none" && (
                      <div className={`page-turn-overlay ${
                        turning === "forward"
                          ? "turn-forward"
                          : "turn-back"
                      }`} />
                    )}
                  </div>

                  {/* Footer: page nav */}
                  <div className="book-footer">
                    {totalSpreads > 1 ? (
                      <div className="page-turn-nav">
                        <button
                          className="page-turn-btn"
                          onClick={handlePrevSpread}
                          disabled={currentSpread === 0}
                        >
                          <svg viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <span className="page-turn-indicator">
                          {currentSpread + 1} / {totalSpreads}
                        </span>
                        <button
                          className="page-turn-btn"
                          onClick={handleNextSpread}
                          disabled={
                            currentSpread >= totalSpreads - 1
                          }
                        >
                          <svg viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="page-turn-indicator">1 / 1</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
