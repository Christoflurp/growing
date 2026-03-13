import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppData } from "../../context/AppDataContext";
import { useNotificationPermission } from "../../hooks/useNotificationPermission";
import { NotificationSettings } from "../../types";
import { TimePickerModal } from "../shared/TimePickerModal";
import { DayTimePickerModal } from "../shared/DayTimePickerModal";

export function SettingsView() {
  const [showDailyTimePicker, setShowDailyTimePicker] = useState(false);
  const [showWeeklyPicker, setShowWeeklyPicker] = useState(false);
  const { data, saveData } = useAppData();
  const {
    notificationPermission,
    requestPermission,
    launchAtLogin,
    toggleLaunchAtLogin,
  } = useNotificationPermission();

  const updateNotifications = async (updates: Partial<NotificationSettings>) => {
    if (!data) return;
    const newData = {
      ...data,
      notifications: { ...data.notifications, ...updates },
    };
    await saveData(newData);
  };

  const formatTime12Hour = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const getDayShort = (day: string) => {
    const days: Record<string, string> = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };
    return days[day] || day;
  };

  if (!data) return null;

  return (
    <div className="view settings-view">
      <header className="view-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-group">
        <h2>Notifications</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Enable notifications</span>
            <span className="setting-desc">Receive scheduled reminders</span>
          </div>
          <button
            className={`toggle ${data.notifications.enabled ? "on" : ""}`}
            onClick={() => updateNotifications({ enabled: !data.notifications.enabled })}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        {data.notifications.enabled && (
          <>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Daily reminder</span>
                <span className="setting-desc">
                  {data.notifications.daily_reminder
                    ? `Every day at ${formatTime12Hour(data.notifications.daily_time || "09:00")}`
                    : "Get a daily check-in prompt"}
                </span>
              </div>
              <div className="setting-controls">
                {data.notifications.daily_reminder && (
                  <button
                    className="schedule-icon-btn"
                    onClick={() => setShowDailyTimePicker(true)}
                    title="Change time"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </button>
                )}
                <button
                  className={`toggle ${data.notifications.daily_reminder ? "on" : ""}`}
                  onClick={() => updateNotifications({ daily_reminder: !data.notifications.daily_reminder })}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Weekly reminder</span>
                <span className="setting-desc">
                  {data.notifications.weekly_reminder
                    ? `${getDayShort(data.notifications.weekly_day || "monday")} at ${formatTime12Hour(data.notifications.weekly_time || "09:00")}`
                    : "Schedule a weekly review"}
                </span>
              </div>
              <div className="setting-controls">
                {data.notifications.weekly_reminder && (
                  <button
                    className="schedule-icon-btn"
                    onClick={() => setShowWeeklyPicker(true)}
                    title="Change day and time"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </button>
                )}
                <button
                  className={`toggle ${data.notifications.weekly_reminder ? "on" : ""}`}
                  onClick={() => updateNotifications({ weekly_reminder: !data.notifications.weekly_reminder })}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </>
        )}

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Permission</span>
            <span className="setting-desc">
              {notificationPermission === "granted"
                ? "Granted"
                : notificationPermission === "denied"
                ? "Denied -- check System Settings"
                : "Not yet requested"}
            </span>
          </div>
          {notificationPermission !== "granted" && (
            <button className="request-btn" onClick={requestPermission}>
              Request
            </button>
          )}
        </div>
      </div>

      <TimePickerModal
        show={showDailyTimePicker}
        title="Daily Reminder Time"
        time={data.notifications.daily_time || "09:00"}
        onSave={(time) => updateNotifications({ daily_time: time })}
        onClose={() => setShowDailyTimePicker(false)}
      />

      <DayTimePickerModal
        show={showWeeklyPicker}
        title="Weekly Reminder"
        day={data.notifications.weekly_day || "monday"}
        time={data.notifications.weekly_time || "09:00"}
        onSave={(day, time) => updateNotifications({ weekly_day: day, weekly_time: time })}
        onClose={() => setShowWeeklyPicker(false)}
      />

      <div className="settings-group" id="stand-up-reminder">
        <h2>Stand Up Reminder</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Enable stand reminders</span>
            <span className="setting-desc">Alternate between sitting and standing</span>
          </div>
          <button
            className={`toggle ${data.notifications.stand_reminder_enabled ? "on" : ""}`}
            onClick={() => {
              const enabling = !data.notifications.stand_reminder_enabled;
              updateNotifications({
                stand_reminder_enabled: enabling,
                ...(enabling && {
                  stand_mode: data.notifications.stand_mode || "sitting",
                  stand_mode_changed_at: new Date().toISOString(),
                }),
              });
            }}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        {data.notifications.stand_reminder_enabled && (
          <div className="stand-controls">
            <div className="stand-slider-wrapper">
              <span className="stand-time-label">🪑 {data.notifications.sit_duration_minutes || 45}m</span>
              <input
                type="range"
                min="15"
                max="75"
                value={data.notifications.sit_duration_minutes || 45}
                onChange={(e) => {
                  const sitMinutes = parseInt(e.target.value);
                  updateNotifications({
                    sit_duration_minutes: sitMinutes,
                    stand_duration_minutes: 90 - sitMinutes,
                  });
                }}
                className="stand-slider"
              />
              <span className="stand-time-label">{90 - (data.notifications.sit_duration_minutes || 45)}m 🧍</span>
            </div>
            <button
              className="stand-mode-switch-btn"
              onClick={() => {
                const newMode = data.notifications.stand_mode === "standing" ? "sitting" : "standing";
                updateNotifications({
                  stand_mode: newMode,
                  stand_mode_changed_at: new Date().toISOString(),
                });
              }}
            >
              {data.notifications.stand_mode === "standing" ? "Sit Down" : "Stand Up"}
            </button>
          </div>
        )}
      </div>

      <div className="settings-group">
        <h2>Features</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Eat the Frog</span>
            <span className="setting-desc">Mark one task as your daily priority</span>
          </div>
          <button
            className={`toggle ${data.frogEnabled !== false ? "on" : ""}`}
            onClick={() => saveData({ ...data, frogEnabled: data.frogEnabled === false })}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Apple Music</span>
            <span className="setting-desc">Now playing widget and transport controls</span>
          </div>
          <button
            className={`toggle ${data.appleMusicEnabled !== false ? "on" : ""}`}
            onClick={() => saveData({ ...data, appleMusicEnabled: data.appleMusicEnabled === false })}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">MCP Server</span>
            <span className="setting-desc">
              {data.mcpServerEnabled
                ? "Running on port 21517"
                : "Expose app data to LLMs via MCP"}
            </span>
          </div>
          <button
            className={`toggle ${data.mcpServerEnabled ? "on" : ""}`}
            onClick={async () => {
              const enabling = !data.mcpServerEnabled;
              try {
                if (enabling) {
                  await invoke("start_mcp_server");
                  await invoke("register_mcp_with_claude_code", { enable: true });
                } else {
                  await invoke("stop_mcp_server");
                  await invoke("register_mcp_with_claude_code", { enable: false });
                }
                await saveData({ ...data, mcpServerEnabled: enabling });
              } catch (e) {
                console.error("MCP toggle failed:", e);
              }
            }}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        {data.mcpServerEnabled && (
          <div className="mcp-tools-list">
            <span className="mcp-tools-label">Available tools</span>
            <div className="mcp-tools-grid">
              <span className="mcp-tool">get_tasks</span>
              <span className="mcp-tool">add_task</span>
              <span className="mcp-tool">complete_task</span>
              <span className="mcp-tool">get_goals</span>
              <span className="mcp-tool">add_note</span>
              <span className="mcp-tool">add_review</span>
              <span className="mcp-tool">add_brag_doc</span>
              <span className="mcp-tool">get_weekly_recap</span>
            </div>
          </div>
        )}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Weekly Recap</span>
            <span className="setting-desc">
              {data.weeklyRecapEnabled
                ? data.weeklyRecapPath
                  ? `Reading from ${data.weeklyRecapPath.split("/").pop()}/`
                  : "Enabled -- select a folder"
                : "View weekly field notes from JSON files"}
            </span>
          </div>
          <button
            className={`toggle ${data.weeklyRecapEnabled ? "on" : ""}`}
            onClick={() => saveData({ ...data, weeklyRecapEnabled: !data.weeklyRecapEnabled })}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        {data.weeklyRecapEnabled && (
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Recap folder</span>
              <span className="setting-desc recap-path-desc">
                {data.weeklyRecapPath || "No folder selected"}
              </span>
            </div>
            <button
              className="browse-btn"
              onClick={async () => {
                const selected = await open({
                  directory: true,
                  multiple: false,
                  title: "Select Weekly Recap folder",
                });
                if (selected && typeof selected === "string") {
                  await saveData({ ...data, weeklyRecapPath: selected });
                }
              }}
            >
              Browse
            </button>
          </div>
        )}
      </div>

      <div className="settings-group">
        <h2>Scratches</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Scratches</span>
            <span className="setting-desc">
              {data.scratchesEnabled
                ? data.scratchesPath
                  ? `Reading from ${data.scratchesPath.split("/").pop()}/`
                  : "Enabled — select a folder"
                : "Browse markdown scratch notes from a folder"}
            </span>
          </div>
          <button
            className={`toggle ${data.scratchesEnabled ? "on" : ""}`}
            onClick={() => saveData({ ...data, scratchesEnabled: !data.scratchesEnabled })}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        {data.scratchesEnabled && (
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Scratches folder</span>
              <span className="setting-desc recap-path-desc">
                {data.scratchesPath || "No folder selected"}
              </span>
            </div>
            <button
              className="browse-btn"
              onClick={async () => {
                const selected = await open({
                  directory: true,
                  multiple: false,
                  title: "Select Scratches folder",
                });
                if (selected && typeof selected === "string") {
                  await saveData({ ...data, scratchesPath: selected });
                }
              }}
            >
              Browse
            </button>
          </div>
        )}
      </div>

      <div className="settings-group">
        <h2>System</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Launch at login</span>
            <span className="setting-desc">Start Growing when you log in</span>
          </div>
          <button
            className={`toggle ${launchAtLogin ? "on" : ""}`}
            onClick={toggleLaunchAtLogin}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Global shortcut</span>
            <span className="setting-desc">Cmd+Shift+G to show window</span>
          </div>
        </div>
      </div>
    </div>
  );
}
