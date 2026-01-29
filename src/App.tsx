import { useEffect, useState, useCallback, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import Navigation from "./components/Navigation";
import { NowPlayingBar } from "./components/shared/NowPlayingBar";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { ConfirmModalProvider, useConfirmModal } from "./context/ConfirmModalContext";
import { useCalendar } from "./hooks/useCalendar";
import { useGoals } from "./hooks/useGoals";
import { useTasks } from "./hooks/useTasks";
import { useTodos } from "./hooks/useTodos";
import { useQuickNotes } from "./hooks/useQuickNotes";
import { useBragDocs } from "./hooks/useBragDocs";
import { useTimer } from "./hooks/useTimer";
import { ConfirmModal } from "./components/shared/ConfirmModal";
import { QuickNoteModal } from "./components/shared/QuickNoteModal";
import { LightboxModal } from "./components/shared/LightboxModal";
import { AlertOverlay } from "./components/shared/AlertOverlay";
import { TaskEditModal } from "./components/shared/TaskEditModal";
import { CalendarPicker } from "./components/shared/CalendarPicker";
import { ChangelogModal } from "./components/shared/ChangelogModal";
import { FeatureRequestsModal } from "./components/shared/FeatureRequestsModal";
import { BugReportsModal } from "./components/shared/BugReportsModal";
import { GettingStartedModal } from "./components/shared/GettingStartedModal";
import { TimerModal } from "./components/shared/TimerModal";
import { TimerBar } from "./components/shared/TimerBar";
import { TimeboxOverlay } from "./components/shared/TimeboxOverlay";
import { OnboardingView } from "./components/views/OnboardingView";
import { TodayView } from "./components/views/TodayView";
import { TasksView } from "./components/views/TasksView";
import { GoalsView } from "./components/views/GoalsView";
import { NotesView } from "./components/views/NotesView";
import { BragDocView } from "./components/views/BragDocView";
import { SettingsView } from "./components/views/SettingsView";
import { NavView, Todo, NowPlayingInfo } from "./types";
import { getTodayDate } from "./utils/dateUtils";
import { formatDateHeader } from "./utils/formatUtils";
import { createScaffoldData } from "./utils/scaffoldData";
import "./App.css";

interface AppContentProps {
  alertOverlay: { show: boolean; title: string; body: string; type: string } | null;
  onDismissAlert: () => void;
  nowPlaying: NowPlayingInfo | null;
  onTimerExpired: (type: "focus" | "task", taskName?: string, timerId?: string) => void;
  onRegisterStopTimer: (stopFn: (timerId?: string) => void) => void;
}

function AppContent({ alertOverlay, onDismissAlert, nowPlaying, onTimerExpired, onRegisterStopTimer }: AppContentProps) {
  const { data, saveData } = useAppData();

  const {
    selectedDate,
    setSelectedDate,
    showDatePicker,
    setShowDatePicker,
    calendarPickerMonth,
    setCalendarPickerMonth,
    calendarPickerYear,
    setCalendarPickerYear,
    openDatePicker,
    navigateCalendarMonth,
  } = useCalendar();

  const { confirmModal, showConfirm, closeConfirm, handleConfirm } = useConfirmModal();

  const { getAllGoals, expandAllSections } = useGoals();

  const {
    taskEditModal,
    modalTaskText,
    setModalTaskText,
    modalTaskDescription,
    setModalTaskDescription,
    modalTaskGoalId,
    setModalTaskGoalId,
    deleteTask: performDeleteTask,
    closeTaskEditModal,
    saveTaskFromModal,
  } = useTasks();

  const {
    pendingScheduleTodo,
    setPendingScheduleTodo,
    scheduleTodo,
  } = useTodos();

  const {
    showQuickNote,
    setShowQuickNote,
    quickNoteInput,
    setQuickNoteInput,
    quickNoteRef,
    addQuickNote,
  } = useQuickNotes();

  const { lightboxImage, openLightbox, closeLightbox } = useBragDocs();

  const handleTimerExpired = useCallback((timer: { type: string; taskName?: string; id: string }) => {
    onTimerExpired(timer.type as "focus" | "task", timer.taskName, timer.id);
  }, [onTimerExpired]);

  const {
    activeTimers,
    timerStates,
    startTimer,
    stopTimer,
    formatTime,
    getFocusTimers,
  } = useTimer({ onExpired: handleTimerExpired });

  useEffect(() => {
    onRegisterStopTimer(() => stopTimer());
  }, [stopTimer, onRegisterStopTimer]);

  const [activeView, setActiveView] = useState<NavView>("today");
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showChangelog, setShowChangelog] = useState(false);
  const [showFeatureRequests, setShowFeatureRequests] = useState(false);
  const [showBugReports, setShowBugReports] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerModalType, setTimerModalType] = useState<"focus" | "task">("focus");
  const [timerModalTaskId, setTimerModalTaskId] = useState<string | undefined>();
  const [timerModalTaskName, setTimerModalTaskName] = useState<string | undefined>();

  const openFocusTimer = useCallback(() => {
    setTimerModalType("focus");
    setTimerModalTaskId(undefined);
    setTimerModalTaskName(undefined);
    setShowTimerModal(true);
  }, []);

  const openTaskTimer = useCallback((taskId: string, taskName: string) => {
    setTimerModalType("task");
    setTimerModalTaskId(taskId);
    setTimerModalTaskName(taskName);
    setShowTimerModal(true);
  }, []);

  const handleStartTimer = useCallback((minutes: number, name?: string) => {
    const timerName = timerModalType === "focus" ? name : timerModalTaskName;
    startTimer(minutes, timerModalType, timerModalTaskId, timerName);
    setShowTimerModal(false);
  }, [startTimer, timerModalType, timerModalTaskId, timerModalTaskName]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollToSection) {
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollToSection);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setScrollToSection(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeView, scrollToSection]);

  useEffect(() => {
    if (data) {
      expandAllSections();
    }
  }, [data?.sections.length, expandAllSections]);

  useEffect(() => {
    register("CommandOrControl+Shift+G", () => {
      getCurrentWindow().show();
      getCurrentWindow().setFocus();
    });

    return () => {
      unregister("CommandOrControl+Shift+G");
    };
  }, []);

  useEffect(() => {
    if (showQuickNote && quickNoteRef.current) {
      quickNoteRef.current.focus();
    }
  }, [showQuickNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "w") {
        e.preventDefault();
        getCurrentWindow().hide();
      }
      if (e.key === "Escape" && lightboxImage) {
        closeLightbox();
      }
      if (e.key === "Escape" && showDatePicker) {
        setShowDatePicker(false);
        setPendingScheduleTodo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, showDatePicker, closeLightbox]);

  const deleteTaskFromModal = () => {
    if (!taskEditModal) return;
    showConfirm("Delete this task?", () => {
      performDeleteTask(taskEditModal.id);
      closeTaskEditModal();
    });
  };

  const openSchedulePicker = (todo: Todo) => {
    const today = new Date();
    setCalendarPickerMonth(today.getMonth());
    setCalendarPickerYear(today.getFullYear());
    setPendingScheduleTodo(todo);
    setShowDatePicker(true);
  };

  const selectDate = (date: string) => {
    if (pendingScheduleTodo) {
      scheduleTodo(pendingScheduleTodo, date);
    } else {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const datesWithTasks = (data?.dailyTasks || []).map((t) => t.date);

  const handleOnboardingComplete = async (onboardingData: {
    userName: string;
    darkMode: boolean;
    enableNotifications: boolean;
  }) => {
    const scaffoldData = createScaffoldData(
      onboardingData.userName,
      onboardingData.darkMode,
      onboardingData.enableNotifications
    );
    await saveData(scaffoldData);
    setShowGettingStarted(true);
  };

  const getStandTimeRemaining = (): string | undefined => {
    if (!data?.notifications?.stand_reminder_enabled || !data?.notifications?.stand_mode_changed_at) {
      return undefined;
    }
    const changedAt = new Date(data.notifications.stand_mode_changed_at);
    const now = currentTime;
    const elapsedMinutes = Math.floor((now.getTime() - changedAt.getTime()) / 60000);
    const duration = data.notifications.stand_mode === "standing"
      ? (data.notifications.stand_duration_minutes || 45)
      : (data.notifications.sit_duration_minutes || 45);
    const remaining = Math.max(0, duration - elapsedMinutes);
    return `${remaining}m`;
  };

  const handleCalendarClose = () => {
    setShowDatePicker(false);
    setPendingScheduleTodo(null);
  };

  const handleCalendarGoToToday = () => {
    const today = new Date();
    setCalendarPickerMonth(today.getMonth());
    setCalendarPickerYear(today.getFullYear());
    selectDate(getTodayDate());
  };

  if (!data) {
    return (
      <div className="app-loading">
        <div className="loading-pulse" />
      </div>
    );
  }

  if (!data.onboardingComplete) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        onQuickNote={() => setShowQuickNote(true)}
        standMode={data?.notifications?.stand_mode}
        standReminderEnabled={data?.notifications?.stand_reminder_enabled}
        standTimeRemaining={getStandTimeRemaining()}
        darkMode={data?.darkMode}
        onToggleDarkMode={() => {
          if (data) {
            saveData({ ...data, darkMode: !data.darkMode });
          }
        }}
        onNavigateToSection={(view, sectionId) => {
          setActiveView(view);
          setScrollToSection(sectionId);
        }}
        onOpenChangelog={() => setShowChangelog(true)}
        onOpenFeatureRequests={() => setShowFeatureRequests(true)}
        onOpenBugReports={() => setShowBugReports(true)}
        onStartFocusTimer={openFocusTimer}
      />

      {getFocusTimers().map((timer) => {
        const state = timerStates.get(timer.id);
        if (!state) return null;
        return (
          <TimerBar
            key={timer.id}
            timerId={timer.id}
            type="focus"
            taskName={timer.taskName}
            timeRemaining={state.timeRemaining}
            totalDuration={timer.durationMinutes}
            isExpired={state.isExpired}
            formatTime={formatTime}
            onStop={stopTimer}
          />
        );
      })}

      {data.appleMusicEnabled !== false && <NowPlayingBar nowPlaying={nowPlaying} />}

      <main className="main-content">
        {activeView === "today" && (
          <TodayView currentTime={currentTime} onNavigate={setActiveView} onStartTaskTimer={openTaskTimer} />
        )}

        {activeView === "tasks" && (
          <TasksView
            selectedDate={selectedDate}
            onOpenDatePicker={openDatePicker}
            onOpenSchedulePicker={openSchedulePicker}
            onGoToToday={handleCalendarGoToToday}
            onStartTaskTimer={openTaskTimer}
          />
        )}

        {activeView === "goals" && <GoalsView />}

        {activeView === "notes" && (
          <NotesView onShowQuickNote={() => setShowQuickNote(true)} />
        )}

        {activeView === "bragdoc" && <BragDocView onOpenLightbox={openLightbox} />}

        {activeView === "settings" && <SettingsView />}
      </main>

      <QuickNoteModal
        show={showQuickNote}
        value={quickNoteInput}
        textareaRef={quickNoteRef}
        onChange={setQuickNoteInput}
        onClose={() => setShowQuickNote(false)}
        onSave={addQuickNote}
      />

      <ConfirmModal
        show={confirmModal.show}
        message={confirmModal.message}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />

      <TaskEditModal
        show={!!taskEditModal}
        dateLabel={taskEditModal ? formatDateHeader(taskEditModal.date) : ""}
        text={modalTaskText}
        description={modalTaskDescription}
        goalId={modalTaskGoalId}
        goals={getAllGoals()}
        onTextChange={setModalTaskText}
        onDescriptionChange={setModalTaskDescription}
        onGoalIdChange={setModalTaskGoalId}
        onSave={saveTaskFromModal}
        onDelete={deleteTaskFromModal}
        onClose={closeTaskEditModal}
      />

      <LightboxModal imageUrl={lightboxImage} onClose={closeLightbox} />

      <AlertOverlay
        show={!!alertOverlay?.show}
        title={alertOverlay?.title || ""}
        body={alertOverlay?.body || ""}
        type={alertOverlay?.type || ""}
        onDismiss={onDismissAlert}
      />

      <CalendarPicker
        show={showDatePicker}
        contextText={pendingScheduleTodo?.text || null}
        month={calendarPickerMonth}
        year={calendarPickerYear}
        selectedDate={selectedDate}
        datesWithTasks={datesWithTasks}
        onNavigateMonth={navigateCalendarMonth}
        onSelectDate={selectDate}
        onGoToToday={handleCalendarGoToToday}
        onClose={handleCalendarClose}
      />

      <ChangelogModal
        show={showChangelog}
        onClose={() => setShowChangelog(false)}
      />

      <FeatureRequestsModal
        show={showFeatureRequests}
        onClose={() => setShowFeatureRequests(false)}
      />

      <BugReportsModal
        show={showBugReports}
        onClose={() => setShowBugReports(false)}
      />

      <GettingStartedModal
        show={showGettingStarted}
        userName={data.userName || ""}
        onClose={() => setShowGettingStarted(false)}
      />

      {showTimerModal && (
        <TimerModal
          type={timerModalType}
          taskName={timerModalTaskName}
          onStart={handleStartTimer}
          onClose={() => setShowTimerModal(false)}
        />
      )}

      {activeTimers.filter((t) => t.type === "task").map((timer) => {
        const state = timerStates.get(timer.id);
        if (!state || state.timeRemaining <= 0) return null;
        return (
          <TimeboxOverlay
            key={timer.id}
            timerId={timer.id}
            taskName={timer.taskName}
            timeRemaining={state.timeRemaining}
            totalDuration={timer.durationMinutes}
            formatTime={formatTime}
            onStop={stopTimer}
            nowPlaying={nowPlaying}
          />
        );
      })}
    </div>
  );
}

function App() {
  const [alertOverlay, setAlertOverlay] = useState<{
    show: boolean;
    title: string;
    body: string;
    type: string;
  } | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingInfo | null>(null);
  const stopTimerRef = useRef<((timerId?: string) => void) | null>(null);
  const expiredTimerIdRef = useRef<string | null>(null);

  useEffect(() => {
    invoke<NowPlayingInfo>("get_now_playing").then(setNowPlaying);

    const unlisten = listen<NowPlayingInfo>("now-playing-changed", (event) => {
      setNowPlaying(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleAlertTriggered = useCallback(
    (alert: { type: string; title: string; body: string }) => {
      setAlertOverlay({ show: true, ...alert });
    },
    []
  );

  const handleDataRecoveredFromBackup = useCallback(() => {
    setAlertOverlay({
      show: true,
      type: "warning",
      title: "Data Recovered",
      body: "Your data file was corrupted and has been restored from a backup. Some recent changes may have been lost.",
    });
  }, []);

  const handleTimerExpired = useCallback((type: "focus" | "task", timerName?: string, timerId?: string) => {
    getCurrentWindow().show();
    getCurrentWindow().setFocus();
    expiredTimerIdRef.current = timerId || null;
    if (type === "focus") {
      setAlertOverlay({
        show: true,
        type: "timer",
        title: "Time's Up",
        body: timerName
          ? `Your timer "${timerName}" has ended.`
          : "Your timer has ended. Take a moment to reflect on what you accomplished.",
      });
    } else {
      setAlertOverlay({
        show: true,
        type: "timer",
        title: "Time's Up",
        body: timerName ? `Your timebox for "${timerName}" has ended.` : "Your task timebox has ended.",
      });
    }
  }, []);

  const handleRegisterStopTimer = useCallback((stopFn: (timerId?: string) => void) => {
    stopTimerRef.current = stopFn;
  }, []);

  const handleDismissAlert = useCallback(() => {
    if (alertOverlay?.type === "timer" && stopTimerRef.current && expiredTimerIdRef.current) {
      stopTimerRef.current(expiredTimerIdRef.current);
      expiredTimerIdRef.current = null;
    }
    setAlertOverlay(null);
  }, [alertOverlay?.type]);

  return (
    <AppDataProvider
      onAlertTriggered={handleAlertTriggered}
      onDataRecoveredFromBackup={handleDataRecoveredFromBackup}
    >
      <ConfirmModalProvider>
        <AppContent
          alertOverlay={alertOverlay}
          onDismissAlert={handleDismissAlert}
          nowPlaying={nowPlaying}
          onTimerExpired={handleTimerExpired}
          onRegisterStopTimer={handleRegisterStopTimer}
        />
      </ConfirmModalProvider>
    </AppDataProvider>
  );
}

export default App;
