import { useState, useCallback, useEffect, useRef } from "react";
import { useAppData } from "../context/AppDataContext";
import { ActiveTimer } from "../types";

interface TimerState {
  timer: ActiveTimer;
  timeRemaining: number;
  isExpired: boolean;
}

interface UseTimerOptions {
  onExpired?: (timer: ActiveTimer) => void;
}

export function useTimer(options?: UseTimerOptions) {
  const { data, saveData } = useAppData();
  const [timerStates, setTimerStates] = useState<Map<string, TimerState>>(new Map());
  const intervalRef = useRef<number | null>(null);
  const expiredTimersRef = useRef<Set<string>>(new Set());

  const activeTimers = data?.activeTimers || [];

  const calculateTimeRemaining = useCallback((endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((end - now) / 1000));
  }, []);

  useEffect(() => {
    if (activeTimers.length === 0) {
      setTimerStates(new Map());
      expiredTimersRef.current = new Set();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateTimerStates = () => {
      const newStates = new Map<string, TimerState>();
      for (const timer of activeTimers) {
        const remaining = calculateTimeRemaining(timer.endTime);
        const isExpired = remaining <= 0;
        newStates.set(timer.id, { timer, timeRemaining: remaining, isExpired });

        if (isExpired && !expiredTimersRef.current.has(timer.id)) {
          expiredTimersRef.current.add(timer.id);
          options?.onExpired?.(timer);
        }
      }
      setTimerStates(newStates);
    };

    updateTimerStates();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(updateTimerStates, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTimers, calculateTimeRemaining, options]);

  const startTimer = useCallback(
    async (durationMinutes: number, type: "focus" | "task", taskId?: string, taskName?: string) => {
      if (!data) return;
      const endTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      const newTimer: ActiveTimer = {
        id: crypto.randomUUID(),
        type,
        taskId,
        taskName,
        endTime,
        durationMinutes,
      };
      const existingTimers = data.activeTimers || [];
      const newData = {
        ...data,
        activeTimers: [...existingTimers, newTimer],
        activeTimer: undefined,
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const stopTimer = useCallback(async (timerId?: string) => {
    if (!data) return;
    const existingTimers = data.activeTimers || [];

    let newTimers: ActiveTimer[];
    if (timerId) {
      newTimers = existingTimers.filter((t) => t.id !== timerId);
    } else {
      newTimers = [];
    }

    const newData = {
      ...data,
      activeTimers: newTimers,
      activeTimer: undefined,
    };
    await saveData(newData);
  }, [data, saveData]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getTimerState = useCallback((timerId: string): TimerState | undefined => {
    return timerStates.get(timerId);
  }, [timerStates]);

  const getFocusTimers = useCallback(() => {
    return activeTimers.filter((t) => t.type === "focus");
  }, [activeTimers]);

  const getTaskTimer = useCallback((taskId: string): ActiveTimer | undefined => {
    return activeTimers.find((t) => t.type === "task" && t.taskId === taskId);
  }, [activeTimers]);

  return {
    activeTimers,
    timerStates,
    startTimer,
    stopTimer,
    formatTime,
    getTimerState,
    getFocusTimers,
    getTaskTimer,
  };
}
