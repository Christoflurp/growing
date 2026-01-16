import { useState, useRef, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { QuickNote } from "../types";

export function useQuickNotes() {
  const { data, saveData } = useAppData();

  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteInput, setQuickNoteInput] = useState("");
  const quickNoteRef = useRef<HTMLTextAreaElement>(null);

  const addQuickNote = useCallback(async () => {
    if (!data || !quickNoteInput.trim()) return;
    const newNote: QuickNote = {
      id: crypto.randomUUID(),
      text: quickNoteInput.trim(),
      timestamp: new Date().toISOString(),
    };
    const newData = {
      ...data,
      quickNotes: [newNote, ...(data.quickNotes || [])],
    };
    await saveData(newData);
    setQuickNoteInput("");
    setShowQuickNote(false);
  }, [data, saveData, quickNoteInput]);

  const deleteQuickNote = useCallback(
    async (noteId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        quickNotes: (data.quickNotes || []).filter((n) => n.id !== noteId),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const focusQuickNoteInput = useCallback(() => {
    if (quickNoteRef.current) {
      quickNoteRef.current.focus();
    }
  }, []);

  return {
    showQuickNote,
    setShowQuickNote,
    quickNoteInput,
    setQuickNoteInput,
    quickNoteRef,
    addQuickNote,
    deleteQuickNote,
    focusQuickNoteInput,
  };
}
