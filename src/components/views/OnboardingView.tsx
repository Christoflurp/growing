import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface OnboardingViewProps {
  onComplete: (data: {
    userName: string;
    darkMode: boolean;
    enableNotifications: boolean;
  }) => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const handleRequestNotifications = async () => {
    try {
      const status = await invoke<string>("request_notification_permission");
      setNotificationStatus(status);
    } catch (e) {
      console.error("Failed to request notifications:", e);
    }
  };

  const handleComplete = () => {
    if (!userName.trim()) return;
    onComplete({
      userName: userName.trim(),
      darkMode,
      enableNotifications: enableNotifications && notificationStatus === "granted",
    });
  };

  return (
    <div className="onboarding-view">
      <div className="onboarding-container">
        {step === 1 && (
          <div className="onboarding-step">
            <div className="onboarding-icon">🌱</div>
            <h1>Welcome to Growing</h1>
            <p className="onboarding-subtitle">
              A personal growth tracker to help you set goals, track progress, and celebrate wins.
            </p>
            <div className="onboarding-form">
              <label className="onboarding-label">What should we call you?</label>
              <input
                type="text"
                className="onboarding-input"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userName.trim()) {
                    setStep(2);
                  }
                }}
                autoFocus
              />
              <p className="onboarding-hint">
                Your app will be called "Growing {userName || '...'}"
              </p>
            </div>
            <button
              className="onboarding-btn primary"
              onClick={() => setStep(2)}
              disabled={!userName.trim()}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <div className="onboarding-icon">🎨</div>
            <h1>Choose your style</h1>
            <p className="onboarding-subtitle">
              Pick a theme that feels right for you.
            </p>
            <div className="onboarding-themes">
              <button
                className={`theme-option ${!darkMode ? "selected" : ""}`}
                onClick={() => setDarkMode(false)}
              >
                <div className="theme-preview light">
                  <div className="theme-preview-sidebar" />
                  <div className="theme-preview-content">
                    <div className="theme-preview-card" />
                    <div className="theme-preview-card" />
                  </div>
                </div>
                <span>Light</span>
              </button>
              <button
                className={`theme-option ${darkMode ? "selected" : ""}`}
                onClick={() => setDarkMode(true)}
              >
                <div className="theme-preview dark">
                  <div className="theme-preview-sidebar" />
                  <div className="theme-preview-content">
                    <div className="theme-preview-card" />
                    <div className="theme-preview-card" />
                  </div>
                </div>
                <span>Dark</span>
              </button>
            </div>
            <div className="onboarding-nav">
              <button className="onboarding-btn secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="onboarding-btn primary" onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <div className="onboarding-icon">🔔</div>
            <h1>Stay on track</h1>
            <p className="onboarding-subtitle">
              Get gentle reminders to check in on your goals.
            </p>
            <div className="onboarding-notifications">
              <div className="notification-option">
                <div className="notification-info">
                  <span className="notification-title">Enable notifications</span>
                  <span className="notification-desc">
                    Daily and weekly reminders to reflect on your progress
                  </span>
                </div>
                <button
                  className={`toggle ${enableNotifications ? "on" : ""}`}
                  onClick={() => setEnableNotifications(!enableNotifications)}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
              {enableNotifications && !notificationStatus && (
                <button
                  className="onboarding-btn secondary request-btn"
                  onClick={handleRequestNotifications}
                >
                  Grant Permission
                </button>
              )}
              {notificationStatus === "granted" && (
                <p className="notification-granted">Notifications enabled</p>
              )}
              {notificationStatus === "denied" && (
                <p className="notification-denied">
                  Permission denied. You can enable this later in System Settings.
                </p>
              )}
            </div>
            <div className="onboarding-nav">
              <button className="onboarding-btn secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="onboarding-btn primary" onClick={handleComplete}>
                Get Started
              </button>
            </div>
          </div>
        )}

        <div className="onboarding-progress">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`progress-dot ${s === step ? "active" : ""} ${s < step ? "complete" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
