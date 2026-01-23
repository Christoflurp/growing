import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { Todo, DailyTask } from "../types";

export function useTodos() {
  const { data, saveData } = useAppData();

  const [showBacklogForm, setShowBacklogForm] = useState(false);
  const [backlogText, setBacklogText] = useState("");
  const [backlogDescription, setBacklogDescription] = useState("");
  const [backlogGoalId, setBacklogGoalId] = useState<string | null>(null);

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTodoText, setEditTodoText] = useState("");
  const [editTodoDescription, setEditTodoDescription] = useState("");
  const [editTodoGoalId, setEditTodoGoalId] = useState<string | null>(null);

  const [pendingScheduleTodo, setPendingScheduleTodo] = useState<Todo | null>(null);

  const addTodo = useCallback(async () => {
    if (!data || !backlogText.trim()) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: backlogText.trim(),
      description: backlogDescription.trim(),
      goalId: backlogGoalId || undefined,
      createdAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      todos: [newTodo, ...(data.todos || [])],
    };
    await saveData(newData);
    setBacklogText("");
    setBacklogDescription("");
    setBacklogGoalId(null);
    setShowBacklogForm(false);
  }, [data, saveData, backlogText, backlogDescription, backlogGoalId]);

  const deleteTodo = useCallback(
    async (todoId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        todos: (data.todos || []).filter((t) => t.id !== todoId),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const startEditingTodo = useCallback((todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditTodoText(todo.text);
    setEditTodoDescription(todo.description);
    setEditTodoGoalId(todo.goalId || null);
  }, []);

  const cancelEditingTodo = useCallback(() => {
    setEditingTodoId(null);
    setEditTodoText("");
    setEditTodoDescription("");
    setEditTodoGoalId(null);
  }, []);

  const updateTodo = useCallback(async () => {
    if (!data || !editingTodoId || !editTodoText.trim()) return;
    const newData = {
      ...data,
      todos: (data.todos || []).map((todo) =>
        todo.id === editingTodoId
          ? {
              ...todo,
              text: editTodoText.trim(),
              description: editTodoDescription.trim(),
              goalId: editTodoGoalId || undefined,
            }
          : todo
      ),
    };
    await saveData(newData);
    cancelEditingTodo();
  }, [data, saveData, editingTodoId, editTodoText, editTodoDescription, editTodoGoalId, cancelEditingTodo]);

  const scheduleTodo = useCallback(
    async (todo: Todo, date: string) => {
      if (!data) return;
      const newTask: DailyTask = {
        id: crypto.randomUUID(),
        text: todo.text,
        description: todo.description,
        goalId: todo.goalId,
        completed: false,
        date: date,
        category: "work",
      };
      const newData = {
        ...data,
        dailyTasks: [newTask, ...(data.dailyTasks || [])],
        todos: (data.todos || []).filter((t) => t.id !== todo.id),
      };
      await saveData(newData);
      setPendingScheduleTodo(null);
    },
    [data, saveData]
  );

  const deferTaskToBacklog = useCallback(
    async (task: DailyTask) => {
      if (!data) return;
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: task.text,
        description: task.description,
        goalId: task.goalId,
        lastScheduledDate: task.date,
        createdAt: new Date().toISOString(),
      };
      const newData = {
        ...data,
        todos: [newTodo, ...(data.todos || [])],
        dailyTasks: (data.dailyTasks || []).filter((t) => t.id !== task.id),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  return {
    showBacklogForm,
    setShowBacklogForm,
    backlogText,
    setBacklogText,
    backlogDescription,
    setBacklogDescription,
    backlogGoalId,
    setBacklogGoalId,
    editingTodoId,
    editTodoText,
    setEditTodoText,
    editTodoDescription,
    setEditTodoDescription,
    editTodoGoalId,
    setEditTodoGoalId,
    pendingScheduleTodo,
    setPendingScheduleTodo,
    addTodo,
    deleteTodo,
    startEditingTodo,
    cancelEditingTodo,
    updateTodo,
    scheduleTodo,
    deferTaskToBacklog,
  };
}
