import React from "react";
import TabNav, { NavView } from "./TabNav";

interface NavigationProps {
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
}

const Navigation: React.FC<NavigationProps> = ({
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
}) => {
  return (
    <TabNav
      activeView={activeView}
      onViewChange={onViewChange}
      onQuickNote={onQuickNote}
      standMode={standMode}
      standReminderEnabled={standReminderEnabled}
      standTimeRemaining={standTimeRemaining}
      darkMode={darkMode}
      onToggleDarkMode={onToggleDarkMode}
      onNavigateToSection={onNavigateToSection}
      onOpenChangelog={onOpenChangelog}
      onOpenFeatureRequests={onOpenFeatureRequests}
      onOpenBugReports={onOpenBugReports}
      onStartFocusTimer={onStartFocusTimer}
    />
  );
};

export default Navigation;
export type { NavView };
