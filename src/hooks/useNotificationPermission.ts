import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

export function useNotificationPermission() {
  const [notificationPermission, setNotificationPermission] =
    useState<string>("unknown");
  const [launchAtLogin, setLaunchAtLogin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const permission = await invoke<string>("check_notification_permission");
      setNotificationPermission(permission);

      const autostartEnabled = await isEnabled();
      setLaunchAtLogin(autostartEnabled);
    };
    init();
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await invoke<string>("request_notification_permission");
    setNotificationPermission(result);
    return result;
  }, []);

  const toggleLaunchAtLogin = useCallback(async () => {
    if (launchAtLogin) {
      await disable();
      setLaunchAtLogin(false);
    } else {
      await enable();
      setLaunchAtLogin(true);
    }
  }, [launchAtLogin]);

  return {
    notificationPermission,
    launchAtLogin,
    requestPermission,
    toggleLaunchAtLogin,
  };
}
