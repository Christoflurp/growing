import { TaskCategory } from "../../types";

interface CategoryToggleProps {
  value: TaskCategory;
  onChange: (category: TaskCategory) => void;
}

export function CategoryToggle({ value, onChange }: CategoryToggleProps) {
  return (
    <div className="category-toggle">
      <button
        type="button"
        className={`category-btn work ${value === "work" ? "active" : ""}`}
        onClick={() => onChange("work")}
      >
        Work
      </button>
      <button
        type="button"
        className={`category-btn personal ${value === "personal" ? "active" : ""}`}
        onClick={() => onChange("personal")}
      >
        Personal
      </button>
    </div>
  );
}
