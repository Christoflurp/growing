import { useState, useRef, useEffect } from "react";
import { useTasks } from "../../hooks/useTasks";
import { useGoals } from "../../hooks/useGoals";
import { useConfetti } from "../../hooks/useConfetti";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useAppData } from "../../context/AppDataContext";
import { getGreeting, formatDateTime } from "../../utils/formatUtils";
import { getTodayDate } from "../../utils/dateUtils";
import { NavView } from "../../types";
import { FrogIcon } from "../shared/FrogIcon";
import { CategoryToggle } from "../shared/CategoryToggle";

interface TodayViewProps {
  currentTime: Date;
  onNavigate: (view: NavView) => void;
  onStartTaskTimer?: (taskId: string, taskName: string) => void;
}

export function TodayView({ currentTime, onNavigate, onStartTaskTimer }: TodayViewProps) {
  const { data } = useAppData();
  const { showConfirm } = useConfirmModal();
  const { getAllGoals, getGoalById } = useGoals();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFrog, setIsDraggingFrog] = useState(false);
  const [frogDropTarget, setFrogDropTarget] = useState<string | null>(null);
  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
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
    getTodayTasks,
    getFrogForDate,
    addTask,
    toggleTaskComplete,
    deleteTask: performDeleteTask,
    startEditingTask,
    cancelEditingTask,
    updateTask,
    reorderTasks,
    setFrogTask,
    clearFrog,
  } = useTasks();

  const todayTasks = getTodayTasks();
  useConfetti(todayTasks);

  const deleteTask = (taskId: string) => {
    showConfirm("Delete this task?", () => {
      performDeleteTask(taskId);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest("select") || target.closest(".frog-indicator")) {
      return;
    }
    e.preventDefault();
    setDraggedIndex(index);
  };

  useEffect(() => {
    if (draggedIndex === null) return;
    const today = getTodayDate();
    const tasks = getTodayTasks();

    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < tasks.length; i++) {
        const ref = taskRefs.current[i];
        if (!ref || i === draggedIndex) continue;
        const rect = ref.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY >= rect.top && e.clientY < midY) {
          if (dragOverIndex !== i) setDragOverIndex(i);
          return;
        }
        if (e.clientY >= midY && e.clientY <= rect.bottom) {
          if (dragOverIndex !== i) setDragOverIndex(i);
          return;
        }
      }
    };

    const handleMouseUp = async () => {
      if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
        await reorderTasks(today, draggedIndex, dragOverIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedIndex, dragOverIndex, getTodayTasks, reorderTasks]);

  const today = getTodayDate();
  const frogEnabled = data?.frogEnabled !== false;
  const hasFrog = frogEnabled && !!getFrogForDate(today);

  const handleFrogDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFrog(true);
  };

  useEffect(() => {
    if (!isDraggingFrog) return;
    const tasks = getTodayTasks();

    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < tasks.length; i++) {
        const ref = taskRefs.current[i];
        if (!ref) continue;
        const rect = ref.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right) {
          if (!tasks[i].isFrog) {
            setFrogDropTarget(tasks[i].id);
          }
          return;
        }
      }
      setFrogDropTarget(null);
    };

    const handleMouseUp = async () => {
      if (frogDropTarget) {
        await setFrogTask(frogDropTarget, today);
      } else if (hasFrog) {
        await clearFrog(today);
      }
      setIsDraggingFrog(false);
      setFrogDropTarget(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingFrog, frogDropTarget, getTodayTasks, setFrogTask, clearFrog, hasFrog, today]);

  return (
    <div className="view today-view">
      <header className="view-header today-header entrance-1">
        <h1>Today</h1>
        <div className="header-right">
          <span className="greeting">{getGreeting(currentTime)}{data?.userName ? `, ${data.userName}` : ""}</span>
          <span className="header-datetime">{formatDateTime(currentTime)}</span>
        </div>
      </header>

      <div className="today-nav entrance-2">
        <button className="today-nav-btn" onClick={() => onNavigate("tasks")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <span>Tasks</span>
        </button>
        <button className="today-nav-btn" onClick={() => onNavigate("goals")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
          <span>Goals</span>
        </button>
        <button className="today-nav-btn" onClick={() => onNavigate("notes")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 3v4a1 1 0 001 1h4" />
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          </svg>
          <span>Notes</span>
        </button>
        <button className="today-nav-btn" onClick={() => onNavigate("bragdoc")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Brag Doc</span>
        </button>
      </div>

      <div className={`today-tasks-card entrance-4 ${todayTasks.length === 0 ? "empty" : ""}`}>
        <div className="today-tasks-header">
          <h2>Today's Tasks</h2>
          <div className="header-actions">
            {frogEnabled && !hasFrog && (
              <span
                className={`frog-drag-source ${isDraggingFrog ? "dragging" : ""}`}
                onMouseDown={handleFrogDragStart}
                title="Drag onto a task to mark it as today's frog (most important task)"
              >
                <FrogIcon size={32} />
              </span>
            )}
            <button className="header-action" onClick={() => setShowTaskForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {showTaskForm && (
          <div className="task-form">
            <input
              type="text"
              placeholder="What do you need to do?"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="task-text-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && taskText.trim()) {
                  addTask();
                }
                if (e.key === "Escape") {
                  setShowTaskForm(false);
                  setTaskText("");
                  setTaskDescription("");
                  setTaskGoalId(null);
                  setTaskIsFrog(false);
                }
              }}
            />
            <textarea
              placeholder="Description (optional)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="task-description-input"
            />
            <select
              value={taskGoalId || ""}
              onChange={(e) => setTaskGoalId(e.target.value || null)}
              className="task-goal-select"
            >
              <option value="">Link to goal (optional)</option>
              {getAllGoals().map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.sectionTitle}: {goal.text}
                </option>
              ))}
            </select>
            <CategoryToggle value={taskCategory} onChange={setTaskCategory} />
            {frogEnabled && !hasFrog && (
              <label className="frog-checkbox-label">
                <input
                  type="checkbox"
                  checked={taskIsFrog}
                  onChange={(e) => setTaskIsFrog(e.target.checked)}
                />
                <span><FrogIcon size={20} /> Make this today's frog</span>
              </label>
            )}
            <div className="task-form-actions">
              <button
                className="btn-save"
                onClick={addTask}
                disabled={!taskText.trim()}
              >
                Add Task
              </button>
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowTaskForm(false);
                  setTaskText("");
                  setTaskDescription("");
                  setTaskGoalId(null);
                  setTaskIsFrog(false);
                  setTaskCategory("work");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {todayTasks.length === 0 && !showTaskForm ? (
          <div className="empty-state today-empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <p>No tasks for today</p>
            <button className="add-task-btn" onClick={() => setShowTaskForm(true)}>
              Add your first task
            </button>
          </div>
        ) : (
          <div className={`today-tasks ${draggedIndex !== null ? "dragging-active" : ""}`}>
            {todayTasks.map((task, index) => {
              const goalInfo = task.goalId ? getGoalById(task.goalId) : null;
              const isEditing = editingTaskId === task.id;
              const isDragOver = dragOverIndex === index && draggedIndex !== index;
              const isDragging = draggedIndex === index;
              const canDrag = !isEditing;
              return (
                <div
                  key={task.id}
                  ref={(el) => { taskRefs.current[index] = el; }}
                  className={`task-card ${task.completed ? "completed" : ""} ${isEditing ? "editing" : ""} ${isDragOver ? "drag-over" : ""} ${isDragging ? "dragging" : ""} ${frogDropTarget === task.id ? "frog-drop-target" : ""} ${task.isFrog ? "is-frog" : ""}`}
                  onMouseDown={canDrag ? (e) => handleMouseDown(e, index) : undefined}
                >
                  {isEditing ? (
                    <div className="task-edit-form">
                      <input
                        type="text"
                        value={editTaskText}
                        onChange={(e) => setEditTaskText(e.target.value)}
                        className="task-text-input"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && editTaskText.trim()) {
                            updateTask();
                          }
                          if (e.key === "Escape") {
                            cancelEditingTask();
                          }
                        }}
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={editTaskDescription}
                        onChange={(e) => setEditTaskDescription(e.target.value)}
                        className="task-description-input"
                      />
                      <select
                        value={editTaskGoalId || ""}
                        onChange={(e) => setEditTaskGoalId(e.target.value || null)}
                        className="task-goal-select"
                      >
                        <option value="">Link to goal (optional)</option>
                        {getAllGoals().map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.sectionTitle}: {goal.text}
                          </option>
                        ))}
                      </select>
                      <CategoryToggle value={editTaskCategory} onChange={setEditTaskCategory} />
                      {frogEnabled && (
                        <label className="frog-checkbox-label">
                          <input
                            type="checkbox"
                            checked={editTaskIsFrog}
                            onChange={(e) => setEditTaskIsFrog(e.target.checked)}
                          />
                          <span><FrogIcon size={20} /> {editTaskIsFrog ? "This is today's frog" : (hasFrog ? "Make this the frog (replaces current)" : "Make this today's frog")}</span>
                        </label>
                      )}
                      <div className="task-form-actions">
                        <button
                          className="btn-save"
                          onClick={updateTask}
                          disabled={!editTaskText.trim()}
                        >
                          Save
                        </button>
                        <button className="btn-cancel" onClick={cancelEditingTask}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {frogEnabled && task.isFrog && (
                        <span
                          className={`frog-indicator draggable ${isDraggingFrog ? "dragging" : ""}`}
                          onMouseDown={handleFrogDragStart}
                          title="Drag to another task to reassign frog"
                        >
                          <FrogIcon size={26} />
                        </span>
                      )}
                      <button
                        className="checkbox"
                        onClick={() => toggleTaskComplete(task.id)}
                      >
                        {task.completed && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <div className="task-card-content">
                        <p className="task-card-text">{task.text}</p>
                        {task.description && (
                          <p className="task-card-description">{task.description}</p>
                        )}
                        {goalInfo && (
                          <span className="task-goal-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="9" />
                              <circle cx="12" cy="12" r="5" />
                              <circle cx="12" cy="12" r="1" fill="currentColor" />
                            </svg>
                            {goalInfo.sectionTitle}
                          </span>
                        )}
                        <span className={`task-category-badge ${task.category || "work"}`}>
                          {task.category === "personal" ? "Personal" : "Work"}
                        </span>
                      </div>
                      {!task.completed && onStartTaskTimer && (
                        <button className="task-timer-btn" onClick={() => onStartTaskTimer(task.id, task.text)} title="Start timer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </button>
                      )}
                      <button className="task-edit" onClick={() => startEditingTask(task)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="task-delete" onClick={() => deleteTask(task.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
