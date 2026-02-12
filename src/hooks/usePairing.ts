import { useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { PairingConfig, PairingSession, PairingNote, Todo } from "../types";
import { getTodayDate } from "../utils/dateUtils";

export function usePairing() {
  const { data, saveData } = useAppData();

  const getPartners = useCallback(() => {
    return data?.pairingConfigs || [];
  }, [data]);

  const addPartner = useCallback(async (name: string) => {
    if (!data || !name.trim()) return;
    const newConfig: PairingConfig = {
      id: crypto.randomUUID(),
      personName: name.trim(),
      createdAt: new Date().toISOString(),
    };
    await saveData({
      ...data,
      pairingConfigs: [...(data.pairingConfigs || []), newConfig],
    });
  }, [data, saveData]);

  const removePartner = useCallback(async (id: string) => {
    if (!data) return;
    await saveData({
      ...data,
      pairingConfigs: (data.pairingConfigs || []).filter((c) => c.id !== id),
      pairingSessions: (data.pairingSessions || []).filter((s) => s.configId !== id),
      pairingNotes: (data.pairingNotes || []).filter((n) => n.configId !== id),
    });
  }, [data, saveData]);

  const getSessionsForPartner = useCallback((configId: string) => {
    return (data?.pairingSessions || [])
      .filter((s) => s.configId === configId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data]);

  const getActiveSession = useCallback((configId: string): PairingSession | null => {
    return (data?.pairingSessions || []).find(
      (s) => s.configId === configId && !s.completedAt
    ) || null;
  }, [data]);

  const getCompletedSessions = useCallback((configId: string) => {
    return (data?.pairingSessions || [])
      .filter((s) => s.configId === configId && s.completedAt)
      .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
  }, [data]);

  const getSessionNotes = useCallback((sessionId: string) => {
    return (data?.pairingNotes || []).filter((n) => n.sessionId === sessionId);
  }, [data]);

  const startSession = useCallback(async (configId: string, topic: string) => {
    if (!data || !topic.trim()) return;
    const newSession: PairingSession = {
      id: crypto.randomUUID(),
      configId,
      topic: topic.trim(),
      date: getTodayDate(),
      notes: "",
      createdAt: new Date().toISOString(),
    };
    await saveData({
      ...data,
      pairingSessions: [newSession, ...(data.pairingSessions || [])],
    });
  }, [data, saveData]);

  const completeSession = useCallback(async (sessionId: string) => {
    if (!data) return;
    const updatedSessions = (data.pairingSessions || []).map((s) =>
      s.id === sessionId
        ? { ...s, completedAt: new Date().toISOString() }
        : s
    );
    await saveData({
      ...data,
      pairingSessions: updatedSessions,
    });
  }, [data, saveData]);

  const updateSessionNotes = useCallback(async (sessionId: string, notes: string) => {
    if (!data) return;
    const updatedSessions = (data.pairingSessions || []).map((s) =>
      s.id === sessionId ? { ...s, notes } : s
    );
    await saveData({
      ...data,
      pairingSessions: updatedSessions,
    });
  }, [data, saveData]);

  const deleteSession = useCallback(async (id: string) => {
    if (!data) return;
    await saveData({
      ...data,
      pairingSessions: (data.pairingSessions || []).filter((s) => s.id !== id),
      pairingNotes: (data.pairingNotes || []).filter((n) => n.sessionId !== id),
    });
  }, [data, saveData]);

  const addNote = useCallback(async (
    configId: string,
    text: string,
    sessionId: string
  ) => {
    if (!data || !text.trim()) return;
    const newNote: PairingNote = {
      id: crypto.randomUUID(),
      configId,
      text: text.trim(),
      noteType: "note",
      sessionId,
      createdAt: new Date().toISOString(),
    };
    await saveData({
      ...data,
      pairingNotes: [...(data.pairingNotes || []), newNote],
    });
  }, [data, saveData]);

  const deleteNote = useCallback(async (id: string) => {
    if (!data) return;
    await saveData({
      ...data,
      pairingNotes: (data.pairingNotes || []).filter((n) => n.id !== id),
    });
  }, [data, saveData]);

  const addFollowUpTodos = useCallback(async (
    followUps: Array<{ text: string }>,
    partnerName: string,
    topic: string
  ) => {
    if (!data || followUps.length === 0) return;
    const newTodos: Todo[] = followUps.map((item) => ({
      id: crypto.randomUUID(),
      text: item.text.trim(),
      description: `Follow-up from pairing with ${partnerName}: ${topic}`,
      createdAt: new Date().toISOString(),
    }));
    await saveData({
      ...data,
      todos: [...newTodos, ...(data.todos || [])],
    });
  }, [data, saveData]);

  return {
    getPartners,
    addPartner,
    removePartner,
    getSessionsForPartner,
    getActiveSession,
    getCompletedSessions,
    getSessionNotes,
    startSession,
    completeSession,
    updateSessionNotes,
    deleteSession,
    addNote,
    deleteNote,
    addFollowUpTodos,
  };
}
