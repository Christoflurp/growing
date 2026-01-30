import { useState, useRef, useEffect } from "react";
import { useTasks } from "../../hooks/useTasks";
import { useGoals } from "../../hooks/useGoals";
import { useConfetti } from "../../hooks/useConfetti";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useAppData } from "../../context/AppDataContext";
import { getGreeting, formatDateTime } from "../../utils/formatUtils";
import { getTodayDate } from "../../utils/dateUtils";
import { NavView, DailyTask, NowPlayingInfo } from "../../types";
import { FrogIcon } from "../shared/FrogIcon";
import { CategoryToggle } from "../shared/CategoryToggle";
import { MarkdownText } from "../shared/MarkdownText";
import { TaskDetailModal } from "../shared/TaskDetailModal";
import { MusicWidget } from "../shared/MusicWidget";

interface TodayViewProps {
  currentTime: Date;
  onNavigate: (view: NavView) => void;
  onStartTaskTimer?: (taskId: string, taskName: string) => void;
  todayReviewCount?: number;
  nowPlaying?: NowPlayingInfo | null;
  onRefreshNowPlaying?: () => void;
}

export function TodayView({ currentTime, onNavigate, onStartTaskTimer, todayReviewCount, nowPlaying, onRefreshNowPlaying }: TodayViewProps) {
  const { data, saveData } = useAppData();
  const { showConfirm } = useConfirmModal();

  const today = getTodayDate();
  const isAtcToday = data?.atcDays?.includes(today) ?? false;

  const toggleAtc = async () => {
    if (!data) return;
    const currentAtcDays = data.atcDays || [];
    const newAtcDays = isAtcToday
      ? currentAtcDays.filter((d) => d !== today)
      : [...currentAtcDays, today];
    await saveData({ ...data, atcDays: newAtcDays });
  };
  const { getAllGoals, getGoalById } = useGoals();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFrog, setIsDraggingFrog] = useState(false);
  const [frogDropTarget, setFrogDropTarget] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
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
        <div className="today-title-row">
          <h1 className="greeting-title">{getGreeting(currentTime)}{data?.userName ? `, ${data.userName}` : ""}</h1>
          <div className="header-datetime-group">
            <span className="header-datetime">{formatDateTime(currentTime)}</span>
            <a
              href="https://calendar.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-link"
              title="Open Google Calendar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </a>
          </div>
        </div>
        <div className="header-actions">
          {(todayReviewCount ?? 0) > 0 && (
            <button
              className="reviews-badge"
              onClick={() => onNavigate("reviews")}
              title="PR reviews today"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {todayReviewCount}
            </button>
          )}
          <button
            className={`atc-toggle ${isAtcToday ? "active" : ""}`}
            onClick={toggleAtc}
            title={isAtcToday ? "You're on ATC today" : "Mark as ATC day"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            ATC
          </button>
          {frogEnabled && !hasFrog && (
            <span
              className={`frog-drag-source ${isDraggingFrog ? "dragging" : ""}`}
              onMouseDown={handleFrogDragStart}
              title="Drag onto a task to mark it as today's frog (most important task)"
            >
              <FrogIcon size={24} />
            </span>
          )}
        </div>
      </header>

      {data?.appleMusicEnabled !== false && (
        <MusicWidget nowPlaying={nowPlaying ?? null} onRefresh={onRefreshNowPlaying} />
      )}

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
            {!showTaskForm && (
              <button className="add-task-card" onClick={() => setShowTaskForm(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add task</span>
              </button>
            )}
            {todayTasks.map((task, index) => {
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
                      <div className="task-card-content clickable" onClick={() => setSelectedTask(task)}>
                        <div className="task-card-title-row">
                          <p className="task-card-text">{task.text}</p>
                          {frogEnabled && task.isFrog && (
                            <span
                              className={`frog-indicator draggable ${isDraggingFrog ? "dragging" : ""}`}
                              onMouseDown={handleFrogDragStart}
                              title="Drag to another task to reassign frog"
                            >
                              <FrogIcon size={20} />
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="task-card-description"><MarkdownText text={task.description} disableLinks /></p>
                        )}
                        <div className="task-card-meta">
                          <span className={`task-category-badge ${task.category || "work"}`}>
                            {task.category === "personal" ? "Personal" : "Work"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          goalInfo={selectedTask.goalId ? (() => {
            const goal = getGoalById(selectedTask.goalId);
            return goal ? { sectionTitle: goal.sectionTitle, goalText: goal.item.text } : null;
          })() : null}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            startEditingTask(selectedTask);
            setSelectedTask(null);
          }}
          onToggleComplete={() => {
            toggleTaskComplete(selectedTask.id);
            setSelectedTask(null);
          }}
          onStartTimer={onStartTaskTimer ? () => {
            onStartTaskTimer(selectedTask.id, selectedTask.text);
            setSelectedTask(null);
          } : undefined}
          onDelete={() => {
            deleteTask(selectedTask.id);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
