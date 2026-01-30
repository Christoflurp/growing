import React, { useState, useRef, useEffect } from "react";

export type NavView = "today" | "tasks" | "goals" | "notes" | "bragdoc" | "curiosities" | "reviews" | "settings";

interface NavItem {
  view: NavView;
  title: string;
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const todayItem: NavItem = {
  view: "today",
  title: "Today",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const planGroup: NavGroup = {
  id: "plan",
  title: "Plan",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  ),
  items: [
    {
      view: "tasks",
      title: "Tasks",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
    {
      view: "goals",
      title: "Goals",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      ),
    },
  ],
};

const captureGroup: NavGroup = {
  id: "capture",
  title: "Capture",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  items: [
    {
      view: "notes",
      title: "Notes",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 3v4a1 1 0 001 1h4" />
          <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          <line x1="9" y1="9" x2="10" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      ),
    },
    {
      view: "bragdoc",
      title: "Brag Doc",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      view: "curiosities",
      title: "Curiosities",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ],
};

const reviewsItem: NavItem = {
  view: "reviews",
  title: "Reviews",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

const settingsItem: NavItem = {
  view: "settings",
  title: "Settings",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

interface TabNavProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  onQuickNote: () => void;
  standMode?: string;
  standReminderEnabled?: boolean;
  standTimeRemaining?: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigateToSection?: (view: NavView, sectionId: string) => void;
  onOpenChangelog?: () => void;
  onOpenFeatureRequests?: () => void;
  onOpenBugReports?: () => void;
  onStartFocusTimer?: () => void;
  onAddCuriosity?: () => void;
  onAddReview?: () => void;
  onAddTask?: () => void;
  onAddBragDoc?: () => void;
}

const TabNav: React.FC<TabNavProps> = ({
  activeView,
  onViewChange,
  onQuickNote,
  standMode,
  standReminderEnabled,
  standTimeRemaining,
  darkMode,
  onToggleDarkMode,
  onNavigateToSection,
  onOpenChangelog,
  onOpenFeatureRequests,
  onOpenBugReports,
  onStartFocusTimer,
  onAddCuriosity,
  onAddReview,
  onAddTask,
  onAddBragDoc,
}) => {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const addDropdownRef = useRef<HTMLDivElement>(null);
  const navGroupsRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroup((prev) => (prev === groupId ? null : groupId));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navGroupsRef.current && !navGroupsRef.current.contains(e.target as Node)) {
        setExpandedGroup(null);
      }
    };
    if (expandedGroup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedGroup]);

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => item.view === activeView);
  };

  const getActiveItemInGroup = (group: NavGroup): NavItem | undefined => {
    return group.items.find((item) => item.view === activeView);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
        setAddDropdownOpen(false);
      }
    };
    if (addDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [addDropdownOpen]);

  return (
    <nav className="tab-nav">
      <div className={`nav-menu-group ${menuExpanded ? "expanded" : ""}`}>
        <button
          className="nav-icon-btn menu-trigger"
          onClick={() => setMenuExpanded(!menuExpanded)}
          title="App Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="5" r="1" fill="currentColor" />
            <circle cx="12" cy="19" r="1" fill="currentColor" />
          </svg>
        </button>
        <div className="nav-menu-items">
          <button
            className="nav-icon-btn"
            onClick={() => {
              onOpenChangelog?.();
              setMenuExpanded(false);
            }}
            title="Changelog"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </button>
          <button
            className="nav-icon-btn"
            onClick={() => {
              onOpenFeatureRequests?.();
              setMenuExpanded(false);
            }}
            title="Feature Requests"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-2H9v2z" />
              <path d="M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17H8v-2.3c-1.8-1.2-3-3.3-3-5.7a7 7 0 017-7z" />
            </svg>
          </button>
          <button
            className="nav-icon-btn"
            onClick={() => {
              onOpenBugReports?.();
              setMenuExpanded(false);
            }}
            title="Bug Reports"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2l1.88 1.88" />
              <path d="M14.12 3.88L16 2" />
              <path d="M9 7.13v-1a3.003 3.003 0 116 0v1" />
              <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 014-4h4a4 4 0 014 4v3c0 3.3-2.7 6-6 6z" />
              <path d="M12 20v-9" />
              <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
              <path d="M6 13H2" />
              <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
              <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
              <path d="M22 13h-4" />
              <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
            </svg>
          </button>
          <button
            className={`nav-icon-btn ${darkMode ? "active" : ""}`}
            onClick={() => {
              onToggleDarkMode?.();
              setMenuExpanded(false);
            }}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="tab-nav-container">
        {standReminderEnabled && (
          <button
            className={`stand-mode-btn ${standMode || "sitting"}`}
            onClick={() => onNavigateToSection?.("settings", "stand-up-reminder")}
            title={standMode === "standing" ? "Standing mode" : "Sitting mode"}
          >
            {standMode === "standing" ? "🧍" : "🪑"}
            {standTimeRemaining && <span className="stand-time-remaining">{standTimeRemaining}</span>}
          </button>
        )}
        <div className="tab-nav-items">
          <button
            className={`tab-nav-item ${activeView === todayItem.view ? "active" : ""}`}
            onClick={() => onViewChange(todayItem.view)}
          >
            {todayItem.icon}
            <span className="tab-nav-label">{todayItem.title}</span>
          </button>

          <div ref={navGroupsRef} className="nav-groups-wrapper">
            <div className={`nav-group ${isGroupActive(planGroup) ? "group-active" : ""} ${expandedGroup === planGroup.id ? "expanded" : ""}`}>
              <button
                className="nav-group-toggle"
                onClick={() => toggleGroup(planGroup.id)}
              >
                {getActiveItemInGroup(planGroup)?.icon || planGroup.icon}
                <span className="tab-nav-label">
                  {getActiveItemInGroup(planGroup)?.title || planGroup.title}
                </span>
                <svg className="nav-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="nav-group-items">
                {planGroup.items.map((item) => (
                  <button
                    key={item.view}
                    className={`tab-nav-item tab-nav-subitem ${activeView === item.view ? "active" : ""}`}
                    onClick={() => {
                      onViewChange(item.view);
                      setExpandedGroup(null);
                    }}
                  >
                    {item.icon}
                    <span className="tab-nav-label">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`nav-group ${isGroupActive(captureGroup) ? "group-active" : ""} ${expandedGroup === captureGroup.id ? "expanded" : ""}`}>
              <button
                className="nav-group-toggle"
                onClick={() => toggleGroup(captureGroup.id)}
              >
                {getActiveItemInGroup(captureGroup)?.icon || captureGroup.icon}
                <span className="tab-nav-label">
                  {getActiveItemInGroup(captureGroup)?.title || captureGroup.title}
                </span>
                <svg className="nav-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="nav-group-items">
                {captureGroup.items.map((item) => (
                  <button
                    key={item.view}
                    className={`tab-nav-item tab-nav-subitem ${activeView === item.view ? "active" : ""}`}
                    onClick={() => {
                      onViewChange(item.view);
                      setExpandedGroup(null);
                    }}
                  >
                    {item.icon}
                    <span className="tab-nav-label">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            className={`tab-nav-item ${activeView === reviewsItem.view ? "active" : ""}`}
            onClick={() => onViewChange(reviewsItem.view)}
          >
            {reviewsItem.icon}
            <span className="tab-nav-label">{reviewsItem.title}</span>
          </button>

          <button
            className={`tab-nav-item ${activeView === settingsItem.view ? "active" : ""}`}
            onClick={() => onViewChange(settingsItem.view)}
          >
            {settingsItem.icon}
            <span className="tab-nav-label">{settingsItem.title}</span>
          </button>
        </div>
        <div className="add-dropdown-container" ref={addDropdownRef}>
          <button
            className={`tab-nav-add ${addDropdownOpen ? "active" : ""}`}
            onClick={() => setAddDropdownOpen(!addDropdownOpen)}
            title="Add new item"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {addDropdownOpen && (
            <div className="add-dropdown">
              <button
                className="add-dropdown-item"
                onClick={() => {
                  onAddTask?.();
                  setAddDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                <span>Task</span>
              </button>
              <button
                className="add-dropdown-item"
                onClick={() => {
                  onStartFocusTimer?.();
                  setAddDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Timer</span>
              </button>
              <button
                className="add-dropdown-item"
                onClick={() => {
                  onQuickNote();
                  setAddDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 3v4a1 1 0 001 1h4" />
                  <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                </svg>
                <span>Note</span>
              </button>
              <button
                className="add-dropdown-item"
                onClick={() => {
                  onAddBragDoc?.();
                  setAddDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Brag Doc</span>
              </button>
              <button
                className="add-dropdown-item"
                onClick={() => {
                  onAddCuriosity?.();
                  setAddDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Curiosity</span>
              </button>
              <button
                className="add-dropdown-item"
                onClick={() => {
                  onAddReview?.();
                  setAddDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                <span>Review</span>
              </button>
            </div>
          )}
        </div>
        <button
          className="nav-timer-btn"
          onClick={onStartFocusTimer}
          title="Start focus timer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default TabNav;
