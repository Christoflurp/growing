import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppData } from "../context/AppDataContext";
import { WeeklyRecap, WeeklyRecapListItem } from "../types";

type SectionKey = "code" | "projects" | "slack" | "activity" | "scratchNotes";

export function useWeeklyRecap() {
  const { data } = useAppData();
  const [weeks, setWeeks] = useState<WeeklyRecapListItem[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [recap, setRecap] = useState<WeeklyRecap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    code: false,
    projects: false,
    slack: false,
    activity: false,
    scratchNotes: false,
  });

  const enabled = data?.weeklyRecapEnabled ?? false;
  const recapPath = data?.weeklyRecapPath;

  const loadWeekList = useCallback(async () => {
    if (!recapPath) {
      setWeeks([]);
      return;
    }
    try {
      const items = await invoke<WeeklyRecapListItem[]>("list_weekly_recaps", { path: recapPath });
      setWeeks(items);
      setCurrentWeekIndex(0);
      setError(null);
    } catch (e) {
      setError(String(e));
      setWeeks([]);
    }
  }, [recapPath]);

  const loadRecap = useCallback(async (filename: string) => {
    if (!recapPath) return;
    setLoading(true);
    setError(null);
    try {
      const json = await invoke<WeeklyRecap>("load_weekly_recap", { path: recapPath, filename });
      setRecap(json);
    } catch (e) {
      setError(String(e));
      setRecap(null);
    } finally {
      setLoading(false);
    }
  }, [recapPath]);

  useEffect(() => {
    if (enabled && recapPath) {
      loadWeekList();
    } else {
      setWeeks([]);
      setRecap(null);
    }
  }, [enabled, recapPath, loadWeekList]);

  useEffect(() => {
    if (weeks.length > 0 && weeks[currentWeekIndex]) {
      loadRecap(weeks[currentWeekIndex].filename);
    } else {
      setRecap(null);
    }
  }, [weeks, currentWeekIndex, loadRecap]);

  const goToPreviousWeek = useCallback(() => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex((i) => i + 1);
    }
  }, [currentWeekIndex, weeks.length]);

  const goToNextWeek = useCallback(() => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex((i) => i - 1);
    }
  }, [currentWeekIndex]);

  const toggleSection = useCallback((section: SectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const hasPreviousWeek = currentWeekIndex < weeks.length - 1;
  const hasNextWeek = currentWeekIndex > 0;
  const isLatestWeek = currentWeekIndex === 0;

  return {
    enabled,
    recapPath,
    weeks,
    recap,
    loading,
    error,
    currentWeekIndex,
    expandedSections,
    goToPreviousWeek,
    goToNextWeek,
    toggleSection,
    hasPreviousWeek,
    hasNextWeek,
    isLatestWeek,
  };
}
