import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { AppData } from "../types";

interface AppDataContextValue {
  data: AppData | null;
  saveData: (newData: AppData) => Promise<void>;
  reloadData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

interface AppDataProviderProps {
  children: ReactNode;
  onDataLoad?: (data: AppData) => void;
  onSystemWake?: () => void;
  onAlertTriggered?: (alert: { type: string; title: string; body: string }) => void;
  onDataRecoveredFromBackup?: () => void;
}

export function AppDataProvider({
  children,
  onDataLoad,
  onSystemWake,
  onAlertTriggered,
  onDataRecoveredFromBackup,
}: AppDataProviderProps) {
  const [data, setData] = useState<AppData | null>(null);

  const loadData = async () => {
    const loadedData = await invoke<AppData>("load_data");
    const normalizedData = { ...loadedData, quickNotes: loadedData.quickNotes || [] };

    if (normalizedData.activeTimer && !normalizedData.activeTimers?.length) {
      const migratedTimer = {
        ...normalizedData.activeTimer,
        id: normalizedData.activeTimer.id || crypto.randomUUID(),
      };
      normalizedData.activeTimers = [migratedTimer];
      normalizedData.activeTimer = undefined;
    }

    setData(normalizedData);
    return normalizedData;
  };

  const saveData = async (newData: AppData) => {
    setData(newData);
    await invoke("save_data", { data: newData });
  };

  const reloadData = async () => {
    await loadData();
  };

  useEffect(() => {
    const init = async () => {
      const loadedData = await loadData();
      onDataLoad?.(loadedData);
    };
    init();
  }, []);

  useEffect(() => {
    const unlisten = listen("system-wake", async () => {
      console.log("System wake detected, reloading data...");
      await loadData();
      onSystemWake?.();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onSystemWake]);

  useEffect(() => {
    const unlisten = listen<{ type: string; title: string; body: string }>(
      "alert-triggered",
      async (event) => {
        await loadData();
        onAlertTriggered?.(event.payload);
      }
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onAlertTriggered]);

  useEffect(() => {
    const unlisten = listen("data-recovered-from-backup", () => {
      console.log("Data recovered from backup");
      onDataRecoveredFromBackup?.();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onDataRecoveredFromBackup]);

  useEffect(() => {
    const theme = data?.theme || "editorial";
    document.documentElement.setAttribute("data-theme", theme);
  }, [data?.theme]);

  useEffect(() => {
    if (data?.darkMode) {
      document.documentElement.setAttribute("data-dark", "true");
    } else {
      document.documentElement.removeAttribute("data-dark");
    }
  }, [data?.darkMode]);

  return (
    <AppDataContext.Provider value={{ data, saveData, reloadData }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
