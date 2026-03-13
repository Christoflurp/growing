import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppData } from "../context/AppDataContext";
import { ScratchFolder } from "../types";

export function useScratches() {
  const { data } = useAppData();
  const [folders, setFolders] = useState<ScratchFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const loadFolders = useCallback(async () => {
    if (!data?.scratchesEnabled || !data?.scratchesPath) return;
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<ScratchFolder[]>("list_scratches", { path: data.scratchesPath });
      setFolders(result);
    } catch (e) {
      setError(String(e));
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [data?.scratchesEnabled, data?.scratchesPath]);

  const loadFile = useCallback(async (folder: string, filename: string) => {
    if (!data?.scratchesPath) return;
    setLoadingFile(true);
    try {
      const content = await invoke<string>("load_scratch_file", {
        path: data.scratchesPath,
        folder,
        filename,
      });
      setFileContent(content);
    } catch (e) {
      setFileContent(`Error loading file: ${e}`);
    } finally {
      setLoadingFile(false);
    }
  }, [data?.scratchesPath]);

  const clearFile = useCallback(() => {
    setFileContent(null);
  }, []);

  return {
    folders,
    loading,
    error,
    fileContent,
    loadingFile,
    loadFolders,
    loadFile,
    clearFile,
  };
}
