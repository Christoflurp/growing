import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { PlanItem } from "../types";

export function useGoals() {
  const { data, saveData } = useAppData();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const startEditingNotes = useCallback((item: PlanItem) => {
    setEditingItem(item.id);
    setEditNotes(item.notes);
  }, []);

  const cancelEditingNotes = useCallback(() => {
    setEditingItem(null);
    setEditNotes("");
  }, []);

  const getCompletedTasksForGoal = useCallback(
    (goalId: string) => {
      if (!data) return [];
      return (data.dailyTasks || []).filter(
        (task) => task.goalId === goalId && task.completed
      );
    },
    [data]
  );

  const isItemComplete = useCallback(
    (item: PlanItem) => {
      if (item.targetExamples !== undefined && item.targetExamples > 0) {
        const linkedTasks = getCompletedTasksForGoal(item.id);
        return linkedTasks.length >= item.targetExamples;
      }
      return item.completed;
    },
    [getCompletedTasksForGoal]
  );

  const getTotalProgress = useCallback(() => {
    if (!data) return 0;
    const total = data.sections.reduce((acc, s) => acc + s.items.length, 0);
    const completed = data.sections.reduce(
      (acc, s) => acc + s.items.filter((i) => isItemComplete(i)).length,
      0
    );
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [data, isItemComplete]);

  const getAllGoals = useCallback(() => {
    if (!data) return [];
    return data.sections.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        sectionTitle: section.title,
      }))
    );
  }, [data]);

  const getGoalById = useCallback(
    (goalId: string) => {
      if (!data) return null;
      for (const section of data.sections) {
        const item = section.items.find((i) => i.id === goalId);
        if (item) return { item, sectionTitle: section.title };
      }
      return null;
    },
    [data]
  );

  const toggleItemComplete = useCallback(
    async (sectionId: string, itemId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        sections: data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === itemId ? { ...item, completed: !item.completed } : item
                ),
              }
            : section
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const saveItemNotes = useCallback(
    async (sectionId: string, itemId: string, notes: string) => {
      if (!data) return;
      const newData = {
        ...data,
        sections: data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === itemId ? { ...item, notes } : item
                ),
              }
            : section
        ),
      };
      await saveData(newData);
      setEditingItem(null);
    },
    [data, saveData]
  );

  const expandAllSections = useCallback(() => {
    if (!data) return;
    const allIds = new Set(data.sections.map((s) => s.id));
    setExpandedSections(allIds);
  }, [data]);

  return {
    expandedSections,
    editingItem,
    editNotes,
    setEditNotes,
    toggleSection,
    startEditingNotes,
    cancelEditingNotes,
    isItemComplete,
    getTotalProgress,
    getAllGoals,
    getGoalById,
    getCompletedTasksForGoal,
    toggleItemComplete,
    saveItemNotes,
    expandAllSections,
  };
}
