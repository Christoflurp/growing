import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { Review, ReviewSource } from "../types";
import { getTodayDate } from "../utils/dateUtils";

export interface ParsedPrLink {
  title: string;
  source: ReviewSource;
  isValid: boolean;
  prKey: string | null;
}

export function parsePrLink(url: string): ParsedPrLink {
  const cleanUrl = url.split("?")[0];

  const githubMatch = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (githubMatch) {
    const [, org, repo, prNumber] = githubMatch;
    const prKey = `${org}/${repo}#${prNumber}`.toLowerCase();
    return { title: `[${org}/${repo}#${prNumber}]`, source: "github", isValid: true, prKey };
  }

  const graphiteMatch = cleanUrl.match(/app\.graphite\.com\/github\/pr\/([^/]+)\/([^/]+)\/(\d+)/);
  if (graphiteMatch) {
    const [, org, repo, prNumber] = graphiteMatch;
    const prKey = `${org}/${repo}#${prNumber}`.toLowerCase();
    return { title: `[${org}/${repo}#${prNumber}]`, source: "graphite", isValid: true, prKey };
  }

  return { title: "", source: "github", isValid: false, prKey: null };
}

export function useReviews() {
  const { data, saveData } = useAppData();

  const [showForm, setShowForm] = useState(false);
  const [prLink, setPrLink] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrLink, setEditPrLink] = useState("");
  const [isReReview, setIsReReview] = useState(false);

  const getReviews = useCallback(() => {
    return data?.reviews || [];
  }, [data]);

  const getTodayReviewCount = useCallback(() => {
    const today = getTodayDate();
    return (data?.reviews || []).filter((r) => r.date === today && r.completed).length;
  }, [data]);

  const getReviewsForDate = useCallback(
    (date: string) => {
      return (data?.reviews || []).filter((r) => r.date === date);
    },
    [data]
  );

  const isDuplicate = useCallback(
    (prKey: string, excludeId?: string) => {
      return (data?.reviews || []).some((r) => {
        if (excludeId && r.id === excludeId) return false;
        const existingKey = r.title.replace(/^\[|\]$/g, "").toLowerCase();
        return existingKey === prKey;
      });
    },
    [data]
  );

  const addReview = useCallback(async () => {
    if (!data || !prLink.trim()) return;
    const { title, source, isValid, prKey } = parsePrLink(prLink.trim());
    if (!isValid || !prKey) return;
    if (!isReReview && isDuplicate(prKey)) return;

    const newReview: Review = {
      id: crypto.randomUUID(),
      prLink: prLink.trim(),
      title,
      source,
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      date: getTodayDate(),
    };
    await saveData({
      ...data,
      reviews: [newReview, ...(data.reviews || [])],
    });
    setPrLink("");
    setIsReReview(false);
    setShowForm(false);
  }, [data, saveData, prLink, isDuplicate, isReReview]);

  const toggleComplete = useCallback(
    async (id: string) => {
      if (!data) return;
      await saveData({
        ...data,
        reviews: (data.reviews || []).map((r) =>
          r.id === id
            ? {
                ...r,
                completed: !r.completed,
                completedAt: !r.completed ? new Date().toISOString() : undefined,
              }
            : r
        ),
      });
    },
    [data, saveData]
  );

  const deleteReview = useCallback(
    async (id: string) => {
      if (!data) return;
      await saveData({
        ...data,
        reviews: (data.reviews || []).filter((r) => r.id !== id),
      });
    },
    [data, saveData]
  );

  const startEditing = useCallback((review: Review) => {
    setEditingId(review.id);
    setEditPrLink(review.prLink);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditPrLink("");
  }, []);

  const updateReview = useCallback(async () => {
    if (!data || !editingId || !editPrLink.trim()) return;
    const { title, source, isValid, prKey } = parsePrLink(editPrLink.trim());
    if (!isValid || !prKey) return;
    if (isDuplicate(prKey, editingId)) return;

    await saveData({
      ...data,
      reviews: (data.reviews || []).map((r) =>
        r.id === editingId ? { ...r, prLink: editPrLink.trim(), title, source } : r
      ),
    });
    cancelEditing();
  }, [data, saveData, editingId, editPrLink, cancelEditing, isDuplicate]);

  const checkDuplicate = useCallback(
    (url: string, excludeId?: string) => {
      const { prKey } = parsePrLink(url);
      if (!prKey) return false;
      return isDuplicate(prKey, excludeId);
    },
    [isDuplicate]
  );

  return {
    showForm,
    setShowForm,
    prLink,
    setPrLink,
    editingId,
    editPrLink,
    setEditPrLink,
    isReReview,
    setIsReReview,
    getReviews,
    getTodayReviewCount,
    getReviewsForDate,
    addReview,
    toggleComplete,
    deleteReview,
    startEditing,
    cancelEditing,
    updateReview,
    checkDuplicate,
  };
}
