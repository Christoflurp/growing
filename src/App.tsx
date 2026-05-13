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
import { CuriositiesView } from "./components/views/CuriositiesView";
import { ReviewsView } from "./components/views/ReviewsView";
import { SettingsView } from "./components/views/SettingsView";
import { CuriosityModal } from "./components/shared/CuriosityModal";
import { ReviewModal } from "./components/shared/ReviewModal";
import { TaskModal } from "./components/shared/TaskModal";
import { BragDocModal } from "./components/shared/BragDocModal";
import { OneOnOneNoteModal } from "./components/shared/OneOnOneNoteModal";
import { OneOnOnesView } from "./components/views/OneOnOnesView";
import { PairingView } from "./components/views/PairingView";
import { WeeklyRecapView } from "./components/views/WeeklyRecapView";
import { ScratchesView } from "./components/views/ScratchesView";
import { QuestionsModal } from "./components/shared/QuestionsModal";
import { DayViewModal } from "./components/shared/DayViewModal";
import { NavView, Todo, NowPlayingInfo, Curiosity, Review, TaskCategory, DailyTask, BragDocEntry, OneOnOneNoteType } from "./types";
import { useOneOnOnes } from "./hooks/useOneOnOnes";
import { getNextOneOnOneDate } from "./utils/oneOnOneUtils";
import { getTodayDate } from "./utils/dateUtils";
import { parsePrLink } from "./hooks/useReviews";
import { formatDateHeader } from "./utils/formatUtils";
import { createScaffoldData } from "./utils/scaffoldData";
import "./App.css";

interface AppContentProps {
  alertOverlay: { show: boolean; title: string; body: string; type: string } | null;
  onDismissAlert: () => void;
  nowPlaying: NowPlayingInfo | null;
  onRefreshNowPlaying: () => void;
  onTimerExpired: (type: "focus" | "task", taskName?: string, timerId?: string) => void;
  onRegisterStopTimer: (stopFn: (timerId?: string) => void) => void;
}

function AppContent({ alertOverlay, onDismissAlert, nowPlaying, onRefreshNowPlaying, onTimerExpired, onRegisterStopTimer }: AppContentProps) {
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
  const [showCuriosityModal, setShowCuriosityModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [dayViewDate, setDayViewDate] = useState<string | null>(null);
  const [pendingDayView, setPendingDayView] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showBragDocModal, setShowBragDocModal] = useState(false);
  const [showOneOnOneNoteModal, setShowOneOnOneNoteModal] = useState(false);
  const [pendingScheduleOneOnOneNote, setPendingScheduleOneOnOneNote] = useState<string | null>(null);

  const { getConfig: getOneOnOneConfig, addNote: addOneOnOneNote, getPendingNotes: getOneOnOnePendingNotes, scheduleNoteAsTask: scheduleOneOnOneNoteAsTask } = useOneOnOnes();

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

  const getTodayReviewCount = useCallback(() => {
    const today = getTodayDate();
    return (data?.reviews || []).filter((r) => r.date === today && r.completed).length;
  }, [data]);

  const handleAddCuriosity = useCallback(async (title: string, description: string) => {
    if (!data) return;
    const newCuriosity: Curiosity = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    await saveData({
      ...data,
      curiosities: [newCuriosity, ...(data.curiosities || [])],
    });
    setShowCuriosityModal(false);
  }, [data, saveData]);

  const checkReviewDuplicate = useCallback((url: string) => {
    const { prKey } = parsePrLink(url);
    if (!prKey) return false;
    return (data?.reviews || []).some((r) => {
      const existingKey = r.title.replace(/^\[|\]$/g, "").toLowerCase();
      return existingKey === prKey;
    });
  }, [data]);

  const handleAddReview = useCallback(async (prLink: string, isReReview: boolean) => {
    if (!data) return;
    const { title, source } = parsePrLink(prLink);
    const newReview: Review = {
      id: crypto.randomUUID(),
      prLink,
      title,
      source,
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      date: getTodayDate(),
      ...(isReReview && { isReReview: true }),
    };
    await saveData({
      ...data,
      reviews: [newReview, ...(data.reviews || [])],
    });
    setShowReviewModal(false);
  }, [data, saveData]);

  const getFrogForToday = useCallback(() => {
    const today = getTodayDate();
    return (data?.dailyTasks || []).find((t) => t.date === today && t.isFrog);
  }, [data]);

  const handleAddTask = useCallback(async (task: {
    text: string;
    description: string;
    goalId: string | null;
    category: TaskCategory;
    isFrog: boolean;
  }) => {
    if (!data) return;
    const today = getTodayDate();
    const todayTasks = (data.dailyTasks || []).filter((t) => t.date === today);
    const maxOrder = todayTasks.length > 0 ? Math.max(...todayTasks.map((t) => t.order ?? 0)) : 0;

    const newTask: DailyTask = {
      id: crypto.randomUUID(),
      text: task.text,
      description: task.description,
      goalId: task.goalId ?? undefined,
      category: task.category,
      completed: false,
      date: today,
      order: maxOrder + 1,
      isFrog: task.isFrog,
    };

    let updatedTasks = [...(data.dailyTasks || []), newTask];
    if (task.isFrog) {
      updatedTasks = updatedTasks.map((t) =>
        t.date === today && t.id !== newTask.id ? { ...t, isFrog: false } : t
      );
    }

    await saveData({ ...data, dailyTasks: updatedTasks });
    setShowTaskModal(false);
  }, [data, saveData]);

  const handleAddBragDoc = useCallback(async (entry: {
    title: string;
    text: string;
    links: string[];
    pendingImages: string[];
  }) => {
    if (!data) return;
    const imageFilenames: string[] = [];
    for (const dataUrl of entry.pendingImages) {
      const base64Data = dataUrl.split(",")[1];
      const mimeMatch = dataUrl.match(/data:image\/(\w+);/);
      const extension = mimeMatch ? mimeMatch[1] : "png";
      try {
        const filename = await invoke<string>("save_image", { base64Data, extension });
        imageFilenames.push(filename);
      } catch (err) {
        console.error("Failed to save image:", err);
      }
    }

    const newEntry: BragDocEntry = {
      id: crypto.randomUUID(),
      title: entry.title,
      text: entry.text,
      links: entry.links.length > 0 ? entry.links : undefined,
      images: imageFilenames.length > 0 ? imageFilenames : undefined,
      timestamp: new Date().toISOString(),
    };

    await saveData({
      ...data,
      bragDocs: [newEntry, ...(data.bragDocs || [])],
    });
    setShowBragDocModal(false);
  }, [data, saveData]);

  const handleAddOneOnOneNote = useCallback(async (text: string, noteType: OneOnOneNoteType) => {
    await addOneOnOneNote(text, noteType);
    setShowOneOnOneNoteModal(false);
  }, [addOneOnOneNote]);

  const handleOpenOneOnOneNoteModal = useCallback(() => {
    const config = getOneOnOneConfig();
    if (!config) {
      setActiveView("one-on-ones");
      return;
    }
    setShowOneOnOneNoteModal(true);
  }, [getOneOnOneConfig]);

  const isOneOnOneDayToday = useCallback(() => {
    const config = getOneOnOneConfig();
    if (!config) return false;
    const today = getTodayDate();
    return getNextOneOnOneDate(config, today) === today;
  }, [getOneOnOneConfig]);

  const getOneOnOnePendingCount = useCallback(() => {
    const config = getOneOnOneConfig();
    if (!config) return 0;
    return getOneOnOnePendingNotes(config.id).length;
  }, [getOneOnOneConfig, getOneOnOnePendingNotes]);

  const handleScheduleOneOnOneNote = useCallback((noteId: string) => {
    const today = new Date();
    setCalendarPickerMonth(today.getMonth());
    setCalendarPickerYear(today.getFullYear());
    setPendingScheduleOneOnOneNote(noteId);
    setShowDatePicker(true);
  }, [setCalendarPickerMonth, setCalendarPickerYear, setShowDatePicker]);

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
        setPendingScheduleOneOnOneNote(null);
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
    if (pendingScheduleOneOnOneNote) {
      scheduleOneOnOneNoteAsTask(pendingScheduleOneOnOneNote, date);
      setPendingScheduleOneOnOneNote(null);
    } else if (pendingScheduleTodo) {
      scheduleTodo(pendingScheduleTodo, date);
    } else if (pendingDayView) {
      setDayViewDate(date);
      setPendingDayView(false);
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
    const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - changedAt.getTime()) / 60000));
    const duration = data.notifications.stand_mode === "standing"
      ? (data.notifications.stand_duration_minutes || 45)
      : (data.notifications.sit_duration_minutes || 45);
    const remaining = Math.max(0, duration - elapsedMinutes);
    return `${remaining}m`;
  };

  const handleCalendarClose = () => {
    setShowDatePicker(false);
    setPendingScheduleTodo(null);
    setPendingScheduleOneOnOneNote(null);
    setPendingDayView(false);
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
      {import.meta.env.DEV && <div className="dev-mode-badge">DEV</div>}
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
        onAddCuriosity={() => setShowCuriosityModal(true)}
        onAddReview={() => setShowReviewModal(true)}
        onAddTask={() => setShowTaskModal(true)}
        onAddBragDoc={() => setShowBragDocModal(true)}
        onAddOneOnOneNote={handleOpenOneOnOneNoteModal}
        onAddPairingNote={() => setActiveView("pairing")}
        onOpenDayView={() => {
          setPendingDayView(true);
          openDatePicker();
        }}
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

      {data.appleMusicEnabled !== false && activeView !== "today" && <NowPlayingBar nowPlaying={nowPlaying} />}

      <main className="main-content">
        {activeView === "today" && (
          <TodayView currentTime={currentTime} onNavigate={setActiveView} onStartTaskTimer={openTaskTimer} onOpenQuestions={() => setShowQuestionsModal(true)} todayReviewCount={getTodayReviewCount()} nowPlaying={nowPlaying} onRefreshNowPlaying={onRefreshNowPlaying} isOneOnOneDay={isOneOnOneDayToday()} oneOnOnePendingCount={getOneOnOnePendingCount()} />
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

        {activeView === "scratches" && <ScratchesView />}

        {activeView === "notes" && (
          <NotesView onShowQuickNote={() => setShowQuickNote(true)} />
        )}

        {activeView === "bragdoc" && <BragDocView onOpenLightbox={openLightbox} />}

        {activeView === "curiosities" && <CuriositiesView />}

        {activeView === "reviews" && <ReviewsView />}

        {activeView === "one-on-ones" && (
          <OneOnOnesView onScheduleNote={handleScheduleOneOnOneNote} />
        )}

        {activeView === "pairing" && <PairingView />}

        {activeView === "weekly-recap" && <WeeklyRecapView />}

        {activeView === "settings" && <SettingsView />}
      </main>

      <QuestionsModal
        show={showQuestionsModal}
        onClose={() => setShowQuestionsModal(false)}
      />

      {dayViewDate && data && (
        <DayViewModal
          date={dayViewDate}
          data={data}
          onClose={() => setDayViewDate(null)}
        />
      )}

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
        contextText={pendingDayView ? "Select a date to view" : pendingScheduleOneOnOneNote ? "Schedule 1-1 action item" : pendingScheduleTodo?.text || null}
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

      <CuriosityModal
        show={showCuriosityModal}
        onClose={() => setShowCuriosityModal(false)}
        onSave={handleAddCuriosity}
      />

      <ReviewModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSave={handleAddReview}
        checkDuplicate={checkReviewDuplicate}
      />

      <TaskModal
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleAddTask}
        hasFrog={!!getFrogForToday()}
      />

      <BragDocModal
        show={showBragDocModal}
        onClose={() => setShowBragDocModal(false)}
        onSave={handleAddBragDoc}
      />

      <OneOnOneNoteModal
        show={showOneOnOneNoteModal}
        onClose={() => setShowOneOnOneNoteModal(false)}
        onSave={handleAddOneOnOneNote}
      />

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

  const handleRefreshNowPlaying = useCallback(() => {
    invoke<NowPlayingInfo>("get_now_playing").then(setNowPlaying);
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
          onRefreshNowPlaying={handleRefreshNowPlaying}
          onTimerExpired={handleTimerExpired}
          onRegisterStopTimer={handleRegisterStopTimer}
        />
      </ConfirmModalProvider>
    </AppDataProvider>
  );
}

export default App;
