import { useState, useRef, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import { useTasks } from "../../hooks/useTasks";
import { useTodos } from "../../hooks/useTodos";
import { useGoals } from "../../hooks/useGoals";
import { useConfetti } from "../../hooks/useConfetti";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { isToday, isFutureDate } from "../../utils/dateUtils";
import { formatDateHeader } from "../../utils/formatUtils";
import { Todo, DailyTask } from "../../types";
import { FrogIcon } from "../shared/FrogIcon";
import { CategoryToggle } from "../shared/CategoryToggle";
import { MarkdownText } from "../shared/MarkdownText";
import { TaskDetailModal } from "../shared/TaskDetailModal";

interface TasksViewProps {
  selectedDate: string;
  onOpenDatePicker: () => void;
  onOpenSchedulePicker: (todo: Todo) => void;
  onGoToToday: () => void;
  onStartTaskTimer?: (taskId: string, taskName: string) => void;
}

export function TasksView({ selectedDate, onOpenDatePicker, onOpenSchedulePicker, onGoToToday, onStartTaskTimer }: TasksViewProps) {
  const { data } = useAppData();
  const { showConfirm } = useConfirmModal();
  const { getAllGoals, getGoalById } = useGoals();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFrog, setIsDraggingFrog] = useState(false);
  const [frogDropTarget, setFrogDropTarget] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const taskListRef = useRef<HTMLDivElement | null>(null);
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
    getTasksForDate,
    getFrogForDate,
    getFutureTasks,
    getIncompleteTasksBeforeDate,
    addTask,
    toggleTaskComplete,
    deleteTask: performDeleteTask,
    startEditingTask,
    cancelEditingTask,
    updateTask,
    carryForwardTask,
    openTaskEditModal,
    reorderTasks,
    setFrogTask,
    clearFrog,
  } = useTasks();

  const {
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
    addTodo,
    deleteTodo: performDeleteTodo,
    startEditingTodo,
    cancelEditingTodo,
    updateTodo,
    deferTaskToBacklog,
  } = useTodos();

  const deleteTask = (taskId: string) => {
    showConfirm("Delete this task?", () => performDeleteTask(taskId));
  };

  const deleteTodo = (todoId: string) => {
    showConfirm("Delete this item?", () => performDeleteTodo(todoId));
  };

  const getFutureTaskDates = () => {
    const futureTasks = getFutureTasks();
    const uniqueDates = [...new Set(futureTasks.map((t) => t.date))];
    return uniqueDates.sort();
  };

  const getUniqueDatesWithIncompleteTasks = (beforeDate: string) => {
    const tasks = getIncompleteTasksBeforeDate(beforeDate);
    const dates = [...new Set(tasks.map((t) => t.date))];
    return dates.slice(0, 7);
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

    const handleMouseMove = (e: MouseEvent) => {
      const tasks = getTasksForDate(selectedDate);
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
        await reorderTasks(selectedDate, draggedIndex, dragOverIndex);
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
  }, [draggedIndex, dragOverIndex, selectedDate, getTasksForDate, reorderTasks]);

  const tasksForSelectedDate = getTasksForDate(selectedDate);
  useConfetti(tasksForSelectedDate);

  const frogEnabled = data?.frogEnabled !== false;
  const hasFrog = frogEnabled && !!getFrogForDate(selectedDate);

  const handleFrogDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFrog(true);
  };

  useEffect(() => {
    if (!isDraggingFrog) return;
    const tasks = getTasksForDate(selectedDate);

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
        await setFrogTask(frogDropTarget, selectedDate);
      } else if (hasFrog) {
        await clearFrog(selectedDate);
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
  }, [isDraggingFrog, frogDropTarget, selectedDate, getTasksForDate, setFrogTask, clearFrog, hasFrog]);

  return (
    <div className="view tasks-view">
      <header className="view-header tasks-header">
        <div className="date-nav">
          <button className="date-nav-title" onClick={onOpenDatePicker}>
            <h1>{formatDateHeader(selectedDate)}</h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          {!isToday(selectedDate) && (
            <button className="today-link" onClick={onGoToToday}>
              Go to today
            </button>
          )}
        </div>
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
          <button className="add-btn" onClick={() => setShowTaskForm(true)}>
            Add Task
          </button>
        </div>
      </header>

      {showTaskForm && (
        <div className="task-form">
          <input
            type="text"
            placeholder="What do you need to do?"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="task-text-input"
            autoFocus
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
              <span><FrogIcon size={20} /> Make this the frog for this day</span>
            </label>
          )}
          <div className="task-form-actions">
            <button className="btn-save" onClick={addTask} disabled={!taskText.trim()}>
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

      {getTasksForDate(selectedDate).length === 0 && !showTaskForm ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <p>No tasks for {formatDateHeader(selectedDate).toLowerCase()}</p>
          {isToday(selectedDate) && <span>Start your day with a plan</span>}
          {isFutureDate(selectedDate) && <span>Plan ahead for this day</span>}
        </div>
      ) : (
        <div
          className={`task-list ${draggedIndex !== null ? "dragging-active" : ""}`}
          ref={taskListRef}
        >
          {getTasksForDate(selectedDate).map((task, index) => {
            const isEditing = editingTaskId === task.id;
            const isMoved = !!task.movedToDate;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;
            const isDragging = draggedIndex === index;
            const canDrag = !isEditing && !isMoved;
            return (
              <div
                key={task.id}
                ref={(el) => { taskRefs.current[index] = el; }}
                className={`task-card ${task.completed ? "completed" : ""} ${isEditing ? "editing" : ""} ${isMoved ? "moved" : ""} ${isDragOver ? "drag-over" : ""} ${isDragging ? "dragging" : ""} ${frogDropTarget === task.id ? "frog-drop-target" : ""} ${task.isFrog ? "is-frog" : ""}`}
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
                        if (e.key === "Enter" && editTaskText.trim()) updateTask();
                        if (e.key === "Escape") cancelEditingTask();
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
                        <span><FrogIcon size={20} /> {editTaskIsFrog ? "This is the frog for this day" : (hasFrog ? "Make this the frog (replaces current)" : "Make this the frog")}</span>
                      </label>
                    )}
                    <div className="task-form-actions">
                      <button className="btn-save" onClick={updateTask} disabled={!editTaskText.trim()}>
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
                      className={`checkbox ${isMoved ? "disabled" : ""}`}
                      onClick={() => !isMoved && toggleTaskComplete(task.id)}
                      disabled={isMoved}
                    >
                      {task.completed && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className={`task-card-content ${!isMoved ? "clickable" : ""}`} onClick={() => !isMoved && setSelectedTask(task)}>
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
                      {isMoved && (
                        <span className="task-moved-tag">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                          Moved to {new Date(task.movedToDate! + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isToday(selectedDate) && getIncompleteTasksBeforeDate(selectedDate).length > 0 && (
        <div className="incomplete-tasks-section">
          <h2 className="subsection-title">Incomplete from previous days</h2>
          <div className="incomplete-tasks-list">
            {getUniqueDatesWithIncompleteTasks(selectedDate).map((date) => {
              const tasksForDate = getIncompleteTasksBeforeDate(selectedDate).filter((t) => t.date === date);
              return (
                <div key={date} className="incomplete-date-group">
                  <span className="incomplete-date-label">{formatDateHeader(date)}</span>
                  {tasksForDate.map((task) => (
                    <div key={task.id} className="incomplete-task-item">
                      <span className="incomplete-task-text">{task.text}</span>
                      <button className="carry-forward-btn" onClick={() => carryForwardTask(task)} title="Carry forward to today">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isToday(selectedDate) && getFutureTasks().length > 0 && (
        <div className="future-tasks-section">
          <h2 className="subsection-title">Upcoming</h2>
          <div className="future-tasks-list">
            {getFutureTaskDates().map((date) => {
              const tasksForDate = getFutureTasks().filter((t) => t.date === date);
              return (
                <div key={date} className="future-date-group">
                  <span className="future-date-label">{formatDateHeader(date)}</span>
                  {tasksForDate.map((task) => (
                      <div key={task.id} className="future-task-item clickable" onClick={() => openTaskEditModal(task)}>
                        <span className="future-task-text">{task.text}</span>
                        <button
                          className="unschedule-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deferTaskToBacklog(task);
                          }}
                          title="Move to backlog"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isToday(selectedDate) && (
        <div className="backlog-section">
          <div className="backlog-section-header">
            <h2 className="subsection-title">Backlog</h2>
            <button className="add-btn small" onClick={() => setShowBacklogForm(true)}>
              Add
            </button>
          </div>

          {showBacklogForm && (
            <div className="task-form backlog-form">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={backlogText}
                onChange={(e) => setBacklogText(e.target.value)}
                className="task-text-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && backlogText.trim()) addTodo();
                  if (e.key === "Escape") {
                    setShowBacklogForm(false);
                    setBacklogText("");
                    setBacklogDescription("");
                    setBacklogGoalId(null);
                  }
                }}
              />
              <textarea
                placeholder="Description (optional)"
                value={backlogDescription}
                onChange={(e) => setBacklogDescription(e.target.value)}
                className="task-description-input"
              />
              <select
                value={backlogGoalId || ""}
                onChange={(e) => setBacklogGoalId(e.target.value || null)}
                className="task-goal-select"
              >
                <option value="">Link to goal (optional)</option>
                {getAllGoals().map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.sectionTitle}: {goal.text}
                  </option>
                ))}
              </select>
              <div className="task-form-actions">
                <button className="btn-save" onClick={addTodo} disabled={!backlogText.trim()}>
                  Add to Backlog
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowBacklogForm(false);
                    setBacklogText("");
                    setBacklogDescription("");
                    setBacklogGoalId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {(data?.todos?.length ?? 0) === 0 && !showBacklogForm ? (
            <div className="backlog-empty">
              <p>No items in backlog</p>
            </div>
          ) : (
            <div className="backlog-list">
              {data?.todos?.map((todo) => {
                const goalInfo = todo.goalId ? getGoalById(todo.goalId) : null;
                const isEditing = editingTodoId === todo.id;
                return (
                  <div key={todo.id} className={`backlog-item ${isEditing ? "editing" : ""}`}>
                    {isEditing ? (
                      <div className="task-edit-form">
                        <input
                          type="text"
                          value={editTodoText}
                          onChange={(e) => setEditTodoText(e.target.value)}
                          className="task-text-input"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editTodoText.trim()) updateTodo();
                            if (e.key === "Escape") cancelEditingTodo();
                          }}
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={editTodoDescription}
                          onChange={(e) => setEditTodoDescription(e.target.value)}
                          className="task-description-input"
                        />
                        <select
                          value={editTodoGoalId || ""}
                          onChange={(e) => setEditTodoGoalId(e.target.value || null)}
                          className="task-goal-select"
                        >
                          <option value="">Link to goal (optional)</option>
                          {getAllGoals().map((goal) => (
                            <option key={goal.id} value={goal.id}>
                              {goal.sectionTitle}: {goal.text}
                            </option>
                          ))}
                        </select>
                        <div className="task-form-actions">
                          <button className="btn-save" onClick={updateTodo} disabled={!editTodoText.trim()}>
                            Save
                          </button>
                          <button className="btn-cancel" onClick={cancelEditingTodo}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button className="schedule-btn" onClick={() => onOpenSchedulePicker(todo)} title="Schedule task">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <polyline points="9 16 12 13 15 16" />
                          </svg>
                        </button>
                        <div className="backlog-item-content">
                          <p className="backlog-item-text">{todo.text}</p>
                          {todo.description && <p className="backlog-item-description"><MarkdownText text={todo.description} /></p>}
                          {todo.lastScheduledDate && (
                            <span className="task-scheduled-tag">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              Last scheduled {new Date(todo.lastScheduledDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
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
                        </div>
                        <button className="task-edit" onClick={() => startEditingTodo(todo)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="task-delete" onClick={() => deleteTodo(todo.id)}>
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
          onStartTimer={onStartTaskTimer && isToday(selectedDate) ? () => {
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
