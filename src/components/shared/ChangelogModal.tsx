import { useState, useEffect } from "react";
import { APP_VERSION, changelog } from "../../data/changelog";

interface ChangelogModalProps {
  show: boolean;
  onClose: () => void;
}

export function ChangelogModal({ show, onClose }: ChangelogModalProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([APP_VERSION]));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (show) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [show, onClose]);

  if (!show) return null;

  const toggleExpanded = (version: string) => {
    const newSet = new Set(expandedVersions);
    if (expandedVersions.has(version)) {
      newSet.delete(version);
    } else {
      newSet.add(version);
    }
    setExpandedVersions(newSet);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="changelog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="changelog-modal-header">
          <div className="changelog-modal-title">
            <h2>Changelog</h2>
            <span className="version-badge">v{APP_VERSION}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="changelog-modal-content">
          <div className="changelog-list">
            {changelog
              .filter((entry) => entry.version !== "Unreleased" || entry.changes.length > 0)
              .map((entry) => {
                const isUnreleased = entry.version === "Unreleased";
                const isExpanded = expandedVersions.has(entry.version);

                return (
                  <div key={entry.version} className={`changelog-entry ${isUnreleased ? "unreleased" : ""}`}>
                    <button className="changelog-header" onClick={() => toggleExpanded(entry.version)}>
                      <div className="changelog-version-info">
                        <span className={`changelog-version ${isUnreleased ? "unreleased" : ""}`}>
                          {isUnreleased ? "Unreleased" : `v${entry.version}`}
                        </span>
                        <span className="changelog-title">{entry.title}</span>
                      </div>
                      <div className="changelog-meta">
                        {entry.date && <span className="changelog-date">{entry.date}</span>}
                        <span className={`chevron ${isExpanded ? "open" : ""}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </button>
                    {isExpanded && (
                      <ul className="changelog-changes">
                        {entry.changes.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
