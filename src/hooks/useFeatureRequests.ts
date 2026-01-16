import { useState, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { FeatureRequest } from "../types";

export function useFeatureRequests() {
  const { data, saveData } = useAppData();

  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [featureText, setFeatureText] = useState("");
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editFeatureText, setEditFeatureText] = useState("");

  const addFeatureRequest = useCallback(async () => {
    if (!data || !featureText.trim()) return;
    const newFeature: FeatureRequest = {
      id: crypto.randomUUID(),
      text: featureText.trim(),
      createdAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      featureRequests: [newFeature, ...(data.featureRequests || [])],
    };
    await saveData(newData);
    setFeatureText("");
    setShowFeatureForm(false);
  }, [data, saveData, featureText]);

  const deleteFeatureRequest = useCallback(
    async (featureId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        featureRequests: (data.featureRequests || []).filter(
          (f) => f.id !== featureId
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const startEditingFeature = useCallback((feature: FeatureRequest) => {
    setEditingFeatureId(feature.id);
    setEditFeatureText(feature.text);
  }, []);

  const cancelEditingFeature = useCallback(() => {
    setEditingFeatureId(null);
    setEditFeatureText("");
  }, []);

  const updateFeatureRequest = useCallback(async () => {
    if (!data || !editingFeatureId || !editFeatureText.trim()) return;
    const newData = {
      ...data,
      featureRequests: (data.featureRequests || []).map((feature) =>
        feature.id === editingFeatureId
          ? { ...feature, text: editFeatureText.trim() }
          : feature
      ),
    };
    await saveData(newData);
    cancelEditingFeature();
  }, [data, saveData, editingFeatureId, editFeatureText, cancelEditingFeature]);

  const completeFeatureRequest = useCallback(
    async (featureId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        featureRequests: (data.featureRequests || []).map((feature) =>
          feature.id === featureId
            ? { ...feature, completed: true, completedAt: new Date().toISOString() }
            : feature
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const uncompleteFeatureRequest = useCallback(
    async (featureId: string) => {
      if (!data) return;
      const newData = {
        ...data,
        featureRequests: (data.featureRequests || []).map((feature) =>
          feature.id === featureId
            ? { ...feature, completed: false, completedAt: undefined }
            : feature
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const getPendingFeatures = useCallback(() => {
    return (data?.featureRequests || []).filter((f) => !f.completed);
  }, [data]);

  const getCompletedFeatures = useCallback(() => {
    return (data?.featureRequests || []).filter((f) => f.completed);
  }, [data]);

  return {
    showFeatureForm,
    setShowFeatureForm,
    featureText,
    setFeatureText,
    editingFeatureId,
    editFeatureText,
    setEditFeatureText,
    addFeatureRequest,
    deleteFeatureRequest,
    startEditingFeature,
    cancelEditingFeature,
    updateFeatureRequest,
    completeFeatureRequest,
    uncompleteFeatureRequest,
    getPendingFeatures,
    getCompletedFeatures,
  };
}
