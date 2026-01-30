import { useState, useRef, useEffect } from "react";
import { useGoals } from "../../hooks/useGoals";
import { useAppData } from "../../context/AppDataContext";
import { TaskCategory } from "../../types";
import { CategoryToggle } from "./CategoryToggle";
import { FrogIcon } from "./FrogIcon";

interface TaskModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (task: {
    text: string;
    description: string;
    goalId: string | null;
    category: TaskCategory;
    isFrog: boolean;
  }) => void;
  hasFrog: boolean;
}

export function TaskModal({ show, onClose, onSave, hasFrog }: TaskModalProps) {
  const { data } = useAppData();
  const { getAllGoals } = useGoals();
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);
  const [category, setCategory] = useState<TaskCategory>("work");
  const [isFrog, setIsFrog] = useState(false);

  const frogEnabled = data?.frogEnabled !== false;

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ text: text.trim(), description: description.trim(), goalId, category, isFrog });
    setText("");
    setDescription("");
    setGoalId(null);
    setCategory("work");
    setIsFrog(false);
  };

  const handleClose = () => {
    setText("");
    setDescription("");
    setGoalId(null);
    setCategory("work");
    setIsFrog(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Task</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="What do you need to do?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="modal-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) handleSave();
            if (e.key === "Escape") handleClose();
          }}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="modal-textarea"
        />
        <select
          value={goalId || ""}
          onChange={(e) => setGoalId(e.target.value || null)}
          className="modal-select"
        >
          <option value="">Link to goal (optional)</option>
          {getAllGoals().map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.sectionTitle}: {goal.text}
            </option>
          ))}
        </select>
        <CategoryToggle value={category} onChange={setCategory} />
        {frogEnabled && !hasFrog && (
          <label className="frog-checkbox-label">
            <input
              type="checkbox"
              checked={isFrog}
              onChange={(e) => setIsFrog(e.target.checked)}
            />
            <span><FrogIcon size={20} /> Make this today's frog</span>
          </label>
        )}
        <div className="modal-actions">
          <button className="btn-save" onClick={handleSave} disabled={!text.trim()}>
            Add Task
          </button>
          <button className="btn-cancel" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
