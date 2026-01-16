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
    return (data.dailyTasks || []).filter((task) => task.date === today);
  }, [data]);

  const getTasksForDate = useCallback(
    (date: string) => {
      if (!data) return [];
      return (data.dailyTasks || []).filter((task) => task.date === date);
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
    const newTask: DailyTask = {
      id: crypto.randomUUID(),
      text: taskText.trim(),
      description: taskDescription.trim(),
      goalId: taskGoalId || undefined,
      completed: false,
      date: getTodayDate(),
    };
    const newData = {
      ...data,
      dailyTasks: [newTask, ...(data.dailyTasks || [])],
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
      };
      const newData = {
        ...data,
        dailyTasks: (data.dailyTasks || []).map((t) =>
          t.id === task.id ? { ...t, movedToDate: today } : t
        ),
      };
      newData.dailyTasks = [newTask, ...newData.dailyTasks];
      await saveData(newData);
    },
    [data, saveData]
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
  };
}
