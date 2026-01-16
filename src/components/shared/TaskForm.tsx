interface Goal {
  id: string;
  text: string;
  sectionTitle: string;
}

interface TaskFormProps {
  text: string;
  description?: string;
  goalId?: string | null;
  goals?: Goal[];
  placeholder?: string;
  submitLabel: string;
  showDescription?: boolean;
  showGoalSelect?: boolean;
  autoFocus?: boolean;
  className?: string;
  onTextChange: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onGoalIdChange?: (value: string | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function TaskForm({
  text,
  description = "",
  goalId = null,
  goals = [],
  placeholder = "What do you need to do?",
  submitLabel,
  showDescription = true,
  showGoalSelect = true,
  autoFocus = true,
  className = "",
  onTextChange,
  onDescriptionChange,
  onGoalIdChange,
  onSubmit,
  onCancel,
  onKeyDown,
}: TaskFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && text.trim()) {
      onSubmit();
    }
    if (e.key === "Escape") {
      onCancel();
    }
    onKeyDown?.(e);
  };

  return (
    <div className={`task-form ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="task-text-input"
        autoFocus={autoFocus}
        onKeyDown={handleKeyDown}
      />
      {showDescription && onDescriptionChange && (
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="task-description-input"
        />
      )}
      {showGoalSelect && onGoalIdChange && goals.length > 0 && (
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
      )}
      <div className="task-form-actions">
        <button
          className="btn-save"
          onClick={onSubmit}
          disabled={!text.trim()}
        >
          {submitLabel}
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
