import { useState, useCallback, useEffect, useRef } from "react";
import { useAppData } from "../context/AppDataContext";
import { ActiveTimer } from "../types";

interface UseTimerOptions {
  onExpired?: (timer: ActiveTimer) => void;
}

export function useTimer(options?: UseTimerOptions) {
  const { data, saveData } = useAppData();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hasTriggeredExpiredRef = useRef<string | null>(null);

  const activeTimer = data?.activeTimer || null;

  const calculateTimeRemaining = useCallback((endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((end - now) / 1000));
    return remaining;
  }, []);

  useEffect(() => {
    if (!activeTimer) {
      setTimeRemaining(null);
      hasTriggeredExpiredRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const remaining = calculateTimeRemaining(activeTimer.endTime);
    setTimeRemaining(remaining);

    if (remaining <= 0) {
      if (hasTriggeredExpiredRef.current !== activeTimer.endTime) {
        hasTriggeredExpiredRef.current = activeTimer.endTime;
        options?.onExpired?.(activeTimer);
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      const newRemaining = calculateTimeRemaining(activeTimer.endTime);
      setTimeRemaining(newRemaining);
      if (newRemaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (hasTriggeredExpiredRef.current !== activeTimer.endTime) {
          hasTriggeredExpiredRef.current = activeTimer.endTime;
          options?.onExpired?.(activeTimer);
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTimer, calculateTimeRemaining, options]);

  const startTimer = useCallback(
    async (durationMinutes: number, type: "focus" | "task", taskId?: string, taskName?: string) => {
      if (!data) return;
      const endTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      const newTimer: ActiveTimer = {
        type,
        taskId,
        taskName,
        endTime,
        durationMinutes,
      };
      const newData = {
        ...data,
        activeTimer: newTimer,
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const stopTimer = useCallback(async () => {
    if (!data) return;
    const newData = {
      ...data,
      activeTimer: undefined,
    };
    await saveData(newData);
  }, [data, saveData]);

  const isExpired = activeTimer && timeRemaining !== null && timeRemaining <= 0;

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    activeTimer,
    timeRemaining,
    isExpired,
    startTimer,
    stopTimer,
    formatTime,
  };
}
