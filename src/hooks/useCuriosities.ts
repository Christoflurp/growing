import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { Curiosity } from "../types";

export function useCuriosities() {
  const { data, saveData } = useAppData();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const getCuriosities = useCallback(() => {
    return data?.curiosities || [];
  }, [data]);

  const addCuriosity = useCallback(async () => {
    if (!data || !title.trim()) return;
    const newCuriosity: Curiosity = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    await saveData({
      ...data,
      curiosities: [newCuriosity, ...(data.curiosities || [])],
    });
    setTitle("");
    setDescription("");
    setShowForm(false);
  }, [data, saveData, title, description]);

  const toggleComplete = useCallback(
    async (id: string) => {
      if (!data) return;
      await saveData({
        ...data,
        curiosities: (data.curiosities || []).map((c) =>
          c.id === id
            ? {
                ...c,
                completed: !c.completed,
                completedAt: !c.completed ? new Date().toISOString() : undefined,
              }
            : c
        ),
      });
    },
    [data, saveData]
  );

  const deleteCuriosity = useCallback(
    async (id: string) => {
      if (!data) return;
      await saveData({
        ...data,
        curiosities: (data.curiosities || []).filter((c) => c.id !== id),
      });
    },
    [data, saveData]
  );

  const startEditing = useCallback((curiosity: Curiosity) => {
    setEditingId(curiosity.id);
    setEditTitle(curiosity.title);
    setEditDescription(curiosity.description);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }, []);

  const updateCuriosity = useCallback(async () => {
    if (!data || !editingId || !editTitle.trim()) return;
    await saveData({
      ...data,
      curiosities: (data.curiosities || []).map((c) =>
        c.id === editingId
          ? { ...c, title: editTitle.trim(), description: editDescription.trim() }
          : c
      ),
    });
    cancelEditing();
  }, [data, saveData, editingId, editTitle, editDescription, cancelEditing]);

  return {
    showForm,
    setShowForm,
    title,
    setTitle,
    description,
    setDescription,
    editingId,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    getCuriosities,
    addCuriosity,
    toggleComplete,
    deleteCuriosity,
    startEditing,
    cancelEditing,
    updateCuriosity,
  };
}
