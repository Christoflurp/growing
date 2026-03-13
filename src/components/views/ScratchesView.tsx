import { useState, useEffect } from "react";
import { useScratches } from "../../hooks/useScratches";
import { useAppData } from "../../context/AppDataContext";
import { FullMarkdown } from "../shared/FullMarkdown";
import { formatRelativeTime } from "../../utils/formatUtils";
import { ScratchFolder } from "../../types";

export function ScratchesView() {
  const { data } = useAppData();
  const { folders, loading, error, fileContent, loadingFile, loadFolders, loadFile, clearFile } = useScratches();
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ folder: string; filename: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const enabled = data?.scratchesEnabled && data?.scratchesPath;

  useEffect(() => {
    if (enabled) {
      loadFolders();
    }
  }, [enabled, loadFolders]);

  const toggleFolder = (folderName: string) => {
    if (expandedFolder === folderName) {
      setExpandedFolder(null);
    } else {
      setExpandedFolder(folderName);
    }
    setSelectedFile(null);
    clearFile();
  };

  const selectFile = (folder: string, filename: string) => {
    setSelectedFile({ folder, filename });
    loadFile(folder, filename);
  };

  const goBack = () => {
    if (selectedFile) {
      setSelectedFile(null);
      clearFile();
    } else if (expandedFolder) {
      setExpandedFolder(null);
    }
  };

  const filteredFolders = searchQuery
    ? folders.filter((f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : folders;

  // Group folders by month
  const groupedByMonth = filteredFolders.reduce<Record<string, ScratchFolder[]>>((acc, folder) => {
    if (folder.date) {
      const monthKey = folder.date.slice(0, 7); // YYYY-MM
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
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  if (!enabled) {
    return (
      <div className="view scratches-view">
        <header className="view-header">
          <h1>Scratches</h1>
        </header>
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 3v4a1 1 0 001 1h4" />
              <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p>Scratches not configured</p>
          <span>Enable in Settings and select your scratches folder</span>
        </div>
      </div>
    );
  }

  // File detail view
  if (selectedFile && fileContent !== null) {
    return (
      <div className="view scratches-view">
        <header className="view-header">
          <button className="back-btn" onClick={goBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="scratch-file-header">
            <h1>{selectedFile.filename.replace(".md", "")}</h1>
            <span className="scratch-folder-name">{selectedFile.folder}</span>
          </div>
        </header>
        <div className="scratch-content">
          {loadingFile ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <FullMarkdown content={fileContent} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="view scratches-view">
      <header className="view-header">
        {expandedFolder ? (
          <>
            <button className="back-btn" onClick={goBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1>{folders.find((f) => f.name === expandedFolder)?.title || expandedFolder}</h1>
          </>
        ) : (
          <>
            <h1>Scratches</h1>
            <span className="scratch-count">{folders.length} scratch{folders.length !== 1 ? "es" : ""}</span>
          </>
        )}
      </header>

      {!expandedFolder && (
        <div className="scratch-search">
          <input
            type="text"
            placeholder="Search scratches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading scratches...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : expandedFolder ? (
        <div className="scratch-files-list">
          {folders
            .find((f) => f.name === expandedFolder)
            ?.files.map((filename) => (
              <button
                key={filename}
                className="scratch-file-card"
                onClick={() => selectFile(expandedFolder, filename)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 3v4a1 1 0 001 1h4" />
                  <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                </svg>
                <span>{filename.replace(".md", "")}</span>
              </button>
            ))}
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="empty-state">
          <p>{searchQuery ? "No matches found" : "No scratches found"}</p>
        </div>
      ) : (
        <div className="scratch-folder-list">
          {Object.keys(groupedByMonth)
            .sort()
            .reverse()
            .map((monthKey) => (
              <div key={monthKey} className="scratch-month-group">
                <div className="scratch-month-header">{formatMonthHeader(monthKey)}</div>
                {groupedByMonth[monthKey].map((folder) => (
                  <button
                    key={folder.name}
                    className="scratch-folder-card"
                    onClick={() => {
                      if (folder.files.length === 1) {
                        selectFile(folder.name, folder.files[0]);
                      } else {
                        toggleFolder(folder.name);
                      }
                    }}
                  >
                    <div className="scratch-folder-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                      </svg>
                      {folder.files.length > 1 && (
                        <span className="scratch-file-count">{folder.files.length}</span>
                      )}
                    </div>
                    <div className="scratch-folder-info">
                      <span className="scratch-folder-title">{folder.title}</span>
                      <span className="scratch-folder-date">
                        {folder.date && formatRelativeTime(folder.modified || folder.date + "T12:00:00")}
                        {folder.files.length > 1 && ` · ${folder.files.length} files`}
                      </span>
                    </div>
                    <svg className="scratch-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
