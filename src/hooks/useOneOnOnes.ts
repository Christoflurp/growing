import { useCallback, useEffect } from "react";
import { useAppData } from "../context/AppDataContext";
import {
  OneOnOneConfig,
  OneOnOneNote,
  OneOnOneNoteType,
  OneOnOneCadence,
  OneOnOneSession,
  DailyTask,
} from "../types";
import { getTodayDate } from "../utils/dateUtils";
import { shouldClearOverride } from "../utils/oneOnOneUtils";

export function useOneOnOnes() {
  const { data, saveData } = useAppData();

  useEffect(() => {
    if (!data) return;
    const config = (data.oneOnOneConfigs || [])[0];
    if (!config || !shouldClearOverride(config, getTodayDate())) return;
    const updated = { ...config, nextOverrideDate: undefined };
    saveData({ ...data, oneOnOneConfigs: [updated] });
  }, [data?.oneOnOneConfigs]);

  const getConfigs = useCallback(() => {
    return data?.oneOnOneConfigs || [];
  }, [data]);

  const getConfig = useCallback(() => {
    return (data?.oneOnOneConfigs || [])[0] || null;
  }, [data]);

  const getNotes = useCallback(() => {
    return data?.oneOnOneNotes || [];
  }, [data]);

  const getSessions = useCallback(() => {
    return data?.oneOnOneSessions || [];
  }, [data]);

  const getPendingNotes = useCallback((configId: string) => {
    return (data?.oneOnOneNotes || []).filter(
      (n) => n.configId === configId && !n.sessionId
    );
  }, [data]);

  const getSessionNotes = useCallback((sessionId: string) => {
    return (data?.oneOnOneNotes || []).filter((n) => n.sessionId === sessionId);
  }, [data]);

  const getSessionsForConfig = useCallback((configId: string) => {
    return (data?.oneOnOneSessions || [])
      .filter((s) => s.configId === configId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  const saveConfig = useCallback(async (config: {
    personName: string;
    dayOfWeek: string;
    cadence: OneOnOneCadence;
  }) => {
    if (!data) return;
    const existing = (data.oneOnOneConfigs || [])[0];
    const now = new Date().toISOString();
    const today = getTodayDate();

    if (existing) {
      const cadenceChanged = existing.cadence !== config.cadence;
      const updatedConfig: OneOnOneConfig = {
        ...existing,
        personName: config.personName,
        dayOfWeek: config.dayOfWeek,
        cadence: config.cadence,
        ...(cadenceChanged && { startDate: today }),
      };
      await saveData({
        ...data,
        oneOnOneConfigs: [updatedConfig],
      });
    } else {
      const newConfig: OneOnOneConfig = {
        id: crypto.randomUUID(),
        personName: config.personName,
        dayOfWeek: config.dayOfWeek,
        cadence: config.cadence,
        startDate: today,
        createdAt: now,
      };
      await saveData({
        ...data,
        oneOnOneConfigs: [newConfig],
      });
    }
  }, [data, saveData]);

  const addNote = useCallback(async (text: string, noteType: OneOnOneNoteType, configId?: string) => {
    if (!data || !text.trim()) return;
    const config = configId || (data.oneOnOneConfigs || [])[0]?.id;
    if (!config) return;

    const newNote: OneOnOneNote = {
      id: crypto.randomUUID(),
      configId: config,
      text: text.trim(),
      noteType,
      createdAt: new Date().toISOString(),
    };
    await saveData({
      ...data,
      oneOnOneNotes: [newNote, ...(data.oneOnOneNotes || [])],
    });
  }, [data, saveData]);

  const updateNote = useCallback(async (noteId: string, text: string, noteType: OneOnOneNoteType) => {
    if (!data || !text.trim()) return;
    await saveData({
      ...data,
      oneOnOneNotes: (data.oneOnOneNotes || []).map((n) =>
        n.id === noteId ? { ...n, text: text.trim(), noteType } : n
      ),
    });
  }, [data, saveData]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!data) return;
    await saveData({
      ...data,
      oneOnOneNotes: (data.oneOnOneNotes || []).filter((n) => n.id !== noteId),
    });
  }, [data, saveData]);

  const completeSession = useCallback(async (configId: string) => {
    if (!data) return;
    const sessionId = crypto.randomUUID();
    const today = getTodayDate();

    const newSession: OneOnOneSession = {
      id: sessionId,
      configId,
      date: today,
      completedAt: new Date().toISOString(),
    };

    const updatedNotes = (data.oneOnOneNotes || []).map((n) =>
      n.configId === configId && !n.sessionId
        ? { ...n, sessionId }
        : n
    );

    await saveData({
      ...data,
      oneOnOneNotes: updatedNotes,
      oneOnOneSessions: [newSession, ...(data.oneOnOneSessions || [])],
    });
  }, [data, saveData]);

  const scheduleNoteAsTask = useCallback(async (noteId: string, date: string) => {
    if (!data) return;
    const note = (data.oneOnOneNotes || []).find((n) => n.id === noteId);
    if (!note) return;

    const taskId = crypto.randomUUID();
    const newTask: DailyTask = {
      id: taskId,
      text: note.text,
      description: "",
      completed: false,
      date,
      category: "work",
    };

    const updatedNotes = (data.oneOnOneNotes || []).map((n) =>
      n.id === noteId ? { ...n, scheduledAsTaskId: taskId } : n
    );

    await saveData({
      ...data,
      dailyTasks: [newTask, ...(data.dailyTasks || [])],
      oneOnOneNotes: updatedNotes,
    });
  }, [data, saveData]);

  const rescheduleNextOneOnOne = useCallback(async (date: string) => {
    if (!data) return;
    const config = (data.oneOnOneConfigs || [])[0];
    if (!config) return;
    const updated = { ...config, nextOverrideDate: date };
    await saveData({ ...data, oneOnOneConfigs: [updated] });
  }, [data, saveData]);

  const clearReschedule = useCallback(async () => {
    if (!data) return;
    const config = (data.oneOnOneConfigs || [])[0];
    if (!config) return;
    const updated = { ...config, nextOverrideDate: undefined };
    await saveData({ ...data, oneOnOneConfigs: [updated] });
  }, [data, saveData]);

  return {
    getConfigs,
    getConfig,
    getNotes,
    getSessions,
    getPendingNotes,
    getSessionNotes,
    getSessionsForConfig,
    saveConfig,
    addNote,
    updateNote,
    deleteNote,
    completeSession,
    scheduleNoteAsTask,
    rescheduleNextOneOnOne,
    clearReschedule,
  };
}
