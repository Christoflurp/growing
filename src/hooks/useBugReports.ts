import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { BugReport } from "../types";

export function useBugReports() {
  const { data, saveData } = useAppData();

  const [showBugForm, setShowBugForm] = useState(false);
  const [bugText, setBugText] = useState("");
  const [editingBugId, setEditingBugId] = useState<string | null>(null);
  const [editBugText, setEditBugText] = useState("");

  const addBugReport = useCallback(async () => {
    if (!data || !bugText.trim()) return;
    const newBug: BugReport = {
      id: crypto.randomUUID(),
      text: bugText.trim(),
      createdAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      bugReports: [newBug, ...(data.bugReports || [])],
    };
    await saveData(newData);
    setBugText("");
    setShowBugForm(false);
  }, [data, saveData, bugText]);

  const deleteBugReport = useCallback(
    async (bugId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        bugReports: (data.bugReports || []).filter((b) => b.id !== bugId),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const startEditingBug = useCallback((bug: BugReport) => {
    setEditingBugId(bug.id);
    setEditBugText(bug.text);
  }, []);

  const cancelEditingBug = useCallback(() => {
    setEditingBugId(null);
    setEditBugText("");
  }, []);

  const updateBugReport = useCallback(async () => {
    if (!data || !editingBugId || !editBugText.trim()) return;
    const newData = {
      ...data,
      bugReports: (data.bugReports || []).map((bug) =>
        bug.id === editingBugId ? { ...bug, text: editBugText.trim() } : bug
      ),
    };
    await saveData(newData);
    cancelEditingBug();
  }, [data, saveData, editingBugId, editBugText, cancelEditingBug]);

  const completeBugReport = useCallback(
    async (bugId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        bugReports: (data.bugReports || []).map((bug) =>
          bug.id === bugId
            ? { ...bug, completed: true, completedAt: new Date().toISOString() }
            : bug
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const uncompleteBugReport = useCallback(
    async (bugId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        bugReports: (data.bugReports || []).map((bug) =>
          bug.id === bugId
            ? { ...bug, completed: false, completedAt: undefined }
            : bug
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const getPendingBugs = useCallback(() => {
    return (data?.bugReports || []).filter((b) => !b.completed);
  }, [data]);

  const getCompletedBugs = useCallback(() => {
    return (data?.bugReports || []).filter((b) => b.completed);
  }, [data]);

  return {
    showBugForm,
    setShowBugForm,
    bugText,
    setBugText,
    editingBugId,
    editBugText,
    setEditBugText,
    addBugReport,
    deleteBugReport,
    startEditingBug,
    cancelEditingBug,
    updateBugReport,
    completeBugReport,
    uncompleteBugReport,
    getPendingBugs,
    getCompletedBugs,
  };
}
