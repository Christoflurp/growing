interface Goal {
  id: string;
  text: string;
  sectionTitle: string;
}

interface TaskEditModalProps {
  show: boolean;
  dateLabel: string;
  text: string;
  description: string;
  goalId: string | null;
  goals: Goal[];
  onTextChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGoalIdChange: (value: string | null) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function TaskEditModal({
  show,
  dateLabel,
  text,
  description,
  goalId,
  goals,
  onTextChange,
  onDescriptionChange,
  onGoalIdChange,
  onSave,
  onDelete,
  onClose,
}: TaskEditModalProps) {
  if (!show) return null;

  return (
    <div className="task-edit-overlay" onClick={onClose}>
      <div className="task-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-edit-modal-header">
          <h3>Edit Task</h3>
          <span className="task-edit-modal-date">{dateLabel}</span>
        </div>
        <div className="task-edit-modal-form">
          <input
            type="text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="task-text-input"
            placeholder="Task"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                onSave();
              }
              if (e.key === "Escape") {
                onClose();
              }
            }}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="task-description-input"
          />
          <select
            value={goalId || ""}
            onChange={(e) => onGoalIdChange(e.target.value || null)}
            className="task-goal-select"
          >
            <option value="">Link to goal (optional)</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.sectionTitle}: {goal.text}
              </option>
            ))}
          </select>
        </div>
        <div className="task-edit-modal-actions">
          <button className="btn-delete" onClick={onDelete}>
            Delete
          </button>
          <div className="task-edit-modal-right">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-save"
              onClick={onSave}
              disabled={!text.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
