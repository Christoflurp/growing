import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { DailyTask } from "../types";
import { getTodayDate } from "../utils/dateUtils";

export function useTasks() {
  const { data, saveData } = useAppData();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskGoalId, setTaskGoalId] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskGoalId, setEditTaskGoalId] = useState<string | null>(null);

  const [taskEditModal, setTaskEditModal] = useState<DailyTask | null>(null);
  const [modalTaskText, setModalTaskText] = useState("");
  const [modalTaskDescription, setModalTaskDescription] = useState("");
  const [modalTaskGoalId, setModalTaskGoalId] = useState<string | null>(null);

  const getTodayTasks = useCallback(() => {
    if (!data) return [];
    const today = getTodayDate();
    return (data.dailyTasks || [])
      .filter((task) => task.date === today)
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }, [data]);

  const getTasksForDate = useCallback(
    (date: string) => {
      if (!data) return [];
      return (data.dailyTasks || [])
        .filter((task) => task.date === date)
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    },
    [data]
  );

  const getFutureTasks = useCallback(() => {
    if (!data) return [];
    const today = getTodayDate();
    return (data.dailyTasks || [])
      .filter((task) => task.date > today && !task.movedToDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const getIncompleteTasksBeforeDate = useCallback(
    (date: string) => {
      if (!data) return [];
      return (data.dailyTasks || []).filter(
        (task) =>
          task.date < date && !task.completed && !task.movedToDate
      );
    },
    [data]
  );

  const addTask = useCallback(async () => {
    if (!data || !taskText.trim()) return;
    const today = getTodayDate();
    const newTask: DailyTask = {
      id: crypto.randomUUID(),
      text: taskText.trim(),
      description: taskDescription.trim(),
      goalId: taskGoalId || undefined,
      completed: false,
      date: today,
      order: 0,
    };
    const updatedTasks = (data.dailyTasks || []).map((task) =>
      task.date === today && task.order !== undefined
        ? { ...task, order: task.order + 1 }
        : task
    );
    const newData = {
      ...data,
      dailyTasks: [newTask, ...updatedTasks],
    };
    await saveData(newData);
    setTaskText("");
    setTaskDescription("");
    setTaskGoalId(null);
    setShowTaskForm(false);
  }, [data, saveData, taskText, taskDescription, taskGoalId]);

  const toggleTaskComplete = useCallback(
    async (taskId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        dailyTasks: (data.dailyTasks || []).map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : undefined,
              }
            : task
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        dailyTasks: (data.dailyTasks || []).filter((t) => t.id !== taskId),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const startEditingTask = useCallback((task: DailyTask) => {
    setEditingTaskId(task.id);
    setEditTaskText(task.text);
    setEditTaskDescription(task.description);
    setEditTaskGoalId(task.goalId || null);
  }, []);

  const cancelEditingTask = useCallback(() => {
    setEditingTaskId(null);
    setEditTaskText("");
    setEditTaskDescription("");
    setEditTaskGoalId(null);
  }, []);

  const updateTask = useCallback(async () => {
    if (!data || !editingTaskId || !editTaskText.trim()) return;
    const newData = {
      ...data,
      dailyTasks: (data.dailyTasks || []).map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              text: editTaskText.trim(),
              description: editTaskDescription.trim(),
              goalId: editTaskGoalId || undefined,
            }
          : task
      ),
    };
    await saveData(newData);
    cancelEditingTask();
  }, [data, saveData, editingTaskId, editTaskText, editTaskDescription, editTaskGoalId, cancelEditingTask]);

  const openTaskEditModal = useCallback((task: DailyTask) => {
    setTaskEditModal(task);
    setModalTaskText(task.text);
    setModalTaskDescription(task.description);
    setModalTaskGoalId(task.goalId || null);
  }, []);

  const closeTaskEditModal = useCallback(() => {
    setTaskEditModal(null);
    setModalTaskText("");
    setModalTaskDescription("");
    setModalTaskGoalId(null);
  }, []);

  const saveTaskFromModal = useCallback(async () => {
    if (!data || !taskEditModal || !modalTaskText.trim()) return;
    const newData = {
      ...data,
      dailyTasks: (data.dailyTasks || []).map((task) =>
        task.id === taskEditModal.id
          ? {
              ...task,
              text: modalTaskText.trim(),
              description: modalTaskDescription.trim(),
              goalId: modalTaskGoalId || undefined,
            }
          : task
      ),
    };
    await saveData(newData);
    closeTaskEditModal();
  }, [data, saveData, taskEditModal, modalTaskText, modalTaskDescription, modalTaskGoalId, closeTaskEditModal]);

  const carryForwardTask = useCallback(
    async (task: DailyTask) => {
      if (!data) return;
      const today = getTodayDate();
      const newTask: DailyTask = {
        id: crypto.randomUUID(),
        text: task.text,
        description: task.description,
        goalId: task.goalId,
        completed: false,
        date: today,
        order: 0,
      };
      const updatedTasks = (data.dailyTasks || []).map((t) => {
        if (t.id === task.id) return { ...t, movedToDate: today };
        if (t.date === today && t.order !== undefined) return { ...t, order: t.order + 1 };
        return t;
      });
      const newData = {
        ...data,
        dailyTasks: [newTask, ...updatedTasks],
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const reorderTasks = useCallback(
    async (date: string, fromIndex: number, toIndex: number) => {
      if (!data || fromIndex === toIndex) return;
      const tasksForDate = getTasksForDate(date);
      const [movedTask] = tasksForDate.splice(fromIndex, 1);
      tasksForDate.splice(toIndex, 0, movedTask);
      const reorderedIds = new Map(tasksForDate.map((t, i) => [t.id, i]));
      const newData = {
        ...data,
        dailyTasks: (data.dailyTasks || []).map((task) =>
          reorderedIds.has(task.id) ? { ...task, order: reorderedIds.get(task.id) } : task
        ),
      };
      await saveData(newData);
    },
    [data, saveData, getTasksForDate]
  );

  return {
    showTaskForm,
    setShowTaskForm,
    taskText,
    setTaskText,
    taskDescription,
    setTaskDescription,
    taskGoalId,
    setTaskGoalId,
    editingTaskId,
    editTaskText,
    setEditTaskText,
    editTaskDescription,
    setEditTaskDescription,
    editTaskGoalId,
    setEditTaskGoalId,
    taskEditModal,
    modalTaskText,
    setModalTaskText,
    modalTaskDescription,
    setModalTaskDescription,
    modalTaskGoalId,
    setModalTaskGoalId,
    getTodayTasks,
    getTasksForDate,
    getFutureTasks,
    getIncompleteTasksBeforeDate,
    addTask,
    toggleTaskComplete,
    deleteTask,
    startEditingTask,
    cancelEditingTask,
    updateTask,
    openTaskEditModal,
    closeTaskEditModal,
    saveTaskFromModal,
    carryForwardTask,
    reorderTasks,
  };
}
