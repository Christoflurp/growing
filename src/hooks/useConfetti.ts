import { useRef, useEffect } from "react";
import { DailyTask } from "../types";
import { fireConfetti } from "../utils/confetti";

export function useConfetti(tasks: DailyTask[]) {
  const activeTasks = tasks.filter((t) => !t.movedToDate);
  const allCompleted = activeTasks.length > 0 && activeTasks.every((t) => t.completed);
  const prevAllCompletedRef = useRef(allCompleted);

  useEffect(() => {
    if (allCompleted && !prevAllCompletedRef.current) {
      fireConfetti();
    }
    prevAllCompletedRef.current = allCompleted;
  }, [allCompleted]);
}
