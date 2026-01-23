import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { DailyTask, TaskCategory } from "../types";
import { getTodayDate } from "../utils/dateUtils";

export function useTasks() {
  const { data, saveData } = useAppData();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskGoalId, setTaskGoalId] = useState<string | null>(null);
  const [taskIsFrog, setTaskIsFrog] = useState(false);
  const [taskCategory, setTaskCategory] = useState<TaskCategory>("work");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskGoalId, setEditTaskGoalId] = useState<string | null>(null);
  const [editTaskIsFrog, setEditTaskIsFrog] = useState(false);
  const [editTaskCategory, setEditTaskCategory] = useState<TaskCategory>("work");

  const [taskEditModal, setTaskEditModal] = useState<DailyTask | null>(null);
  const [modalTaskText, setModalTaskText] = useState("");
  const [modalTaskDescription, setModalTaskDescription] = useState("");
  const [modalTaskGoalId, setModalTaskGoalId] = useState<string | null>(null);

  const sortTasks = (tasks: DailyTask[]) => {
    return tasks.sort((a, b) => {
      if (a.isFrog && !b.isFrog) return -1;
      if (!a.isFrog && b.isFrog) return 1;
      return (a.order ?? Infinity) - (b.order ?? Infinity);
    });
  };

  const getTodayTasks = useCallback(() => {
    if (!data) return [];
    const today = getTodayDate();
    const tasks = (data.dailyTasks || []).filter((task) => task.date === today);
    return sortTasks(tasks);
  }, [data]);

  const getTasksForDate = useCallback(
    (date: string) => {
      if (!data) return [];
      const tasks = (data.dailyTasks || []).filter((task) => task.date === date);
      return sortTasks(tasks);
    },
    [data]
  );

  const getFrogForDate = useCallback(
    (date: string) => {
      if (!data) return null;
      return (data.dailyTasks || []).find((task) => task.date === date && task.isFrog) || null;
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
      isFrog: taskIsFrog || undefined,
      category: taskCategory,
    };
    const updatedTasks = (data.dailyTasks || []).map((task) => {
      if (task.date !== today) return task;
      const updates: Partial<DailyTask> = {};
      if (task.order !== undefined) updates.order = task.order + 1;
      if (taskIsFrog && task.isFrog) updates.isFrog = undefined;
      return Object.keys(updates).length > 0 ? { ...task, ...updates } : task;
    });
    const newData = {
      ...data,
      dailyTasks: [newTask, ...updatedTasks],
    };
    await saveData(newData);
    setTaskText("");
    setTaskDescription("");
    setTaskGoalId(null);
    setTaskIsFrog(false);
    setTaskCategory("work");
    setShowTaskForm(false);
  }, [data, saveData, taskText, taskDescription, taskGoalId, taskIsFrog, taskCategory]);

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
    setEditTaskIsFrog(task.isFrog || false);
    setEditTaskCategory(task.category || "work");
  }, []);

  const cancelEditingTask = useCallback(() => {
    setEditingTaskId(null);
    setEditTaskText("");
    setEditTaskDescription("");
    setEditTaskGoalId(null);
    setEditTaskIsFrog(false);
    setEditTaskCategory("work");
  }, []);

  const updateTask = useCallback(async () => {
    if (!data || !editingTaskId || !editTaskText.trim()) return;
    const editingTask = (data.dailyTasks || []).find((t) => t.id === editingTaskId);
    if (!editingTask) return;
    const taskDate = editingTask.date;
    const newData = {
      ...data,
      dailyTasks: (data.dailyTasks || []).map((task) => {
        if (task.id === editingTaskId) {
          return {
            ...task,
            text: editTaskText.trim(),
            description: editTaskDescription.trim(),
            goalId: editTaskGoalId || undefined,
            isFrog: editTaskIsFrog || undefined,
            order: editTaskIsFrog ? 0 : task.order,
            category: editTaskCategory,
          };
        }
        if (editTaskIsFrog && task.date === taskDate && task.isFrog) {
          return { ...task, isFrog: undefined };
        }
        return task;
      }),
    };
    await saveData(newData);
    cancelEditingTask();
  }, [data, saveData, editingTaskId, editTaskText, editTaskDescription, editTaskGoalId, editTaskIsFrog, editTaskCategory, cancelEditingTask]);

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
        category: task.category || "work",
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

  const setFrogTask = useCallback(
    async (taskId: string, date: string) => {
      if (!data) return;
      const tasksForDate = (data.dailyTasks || []).filter((t) => t.date === date);
      const targetTask = tasksForDate.find((t) => t.id === taskId);
      if (!targetTask || targetTask.isFrog) return;
      const newData = {
        ...data,
        dailyTasks: (data.dailyTasks || []).map((task) => {
          if (task.date !== date) return task;
          if (task.id === taskId) {
            return { ...task, isFrog: true, order: 0 };
          }
          const wasFrog = task.isFrog;
          const newOrder = (task.order ?? 0) + 1;
          return { ...task, isFrog: undefined, order: wasFrog ? newOrder : newOrder };
        }),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const clearFrog = useCallback(
    async (date: string) => {
      if (!data) return;
      const newData = {
        ...data,
        dailyTasks: (data.dailyTasks || []).map((task) =>
          task.date === date && task.isFrog ? { ...task, isFrog: undefined } : task
        ),
      };
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
    taskIsFrog,
    setTaskIsFrog,
    taskCategory,
    setTaskCategory,
    editingTaskId,
    editTaskText,
    setEditTaskText,
    editTaskDescription,
    setEditTaskDescription,
    editTaskGoalId,
    setEditTaskGoalId,
    editTaskIsFrog,
    setEditTaskIsFrog,
    editTaskCategory,
    setEditTaskCategory,
    taskEditModal,
    modalTaskText,
    setModalTaskText,
    modalTaskDescription,
    setModalTaskDescription,
    modalTaskGoalId,
    setModalTaskGoalId,
    getTodayTasks,
    getTasksForDate,
    getFrogForDate,
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
    setFrogTask,
    clearFrog,
  };
}
