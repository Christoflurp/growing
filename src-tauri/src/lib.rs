use tauri::{
    AppHandle,
    Emitter,
    Manager,
    tray::TrayIconBuilder,
    menu::{Menu, MenuItem},
};


use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use chrono::{Local, Timelike, Datelike, Weekday};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct NowPlayingInfo {
    pub is_playing: bool,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub album_year: Option<i32>,
    pub duration: Option<f64>,
    pub position: Option<f64>,
}

#[cfg(target_os = "macos")]
fn query_apple_music() -> NowPlayingInfo {
    let script = r#"
        tell application "System Events"
            if not (exists process "Music") then
                return "NOT_RUNNING"
            end if
        end tell
        tell application "Music"
            if player state is not playing then
                return "NOT_PLAYING"
            end if
            set trackName to name of current track
            set trackArtist to artist of current track
            set trackAlbum to album of current track
            set trackDuration to duration of current track
            set trackPosition to player position
            try
                set trackYear to year of current track
            on error
                set trackYear to 0
            end try
            return trackName & "|||" & trackArtist & "|||" & trackAlbum & "|||" & trackYear & "|||" & trackDuration & "|||" & trackPosition
        end tell
    "#;

    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output();

    match output {
        Ok(out) => {
            let result = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if result == "NOT_RUNNING" || result == "NOT_PLAYING" || result.is_empty() {
                return NowPlayingInfo::default();
            }
            let parts: Vec<&str> = result.split("|||").collect();
            if parts.len() >= 6 {
                NowPlayingInfo {
                    is_playing: true,
                    title: Some(parts[0].to_string()),
                    artist: Some(parts[1].to_string()),
                    album: Some(parts[2].to_string()),
                    album_year: parts[3].parse().ok().filter(|&y| y > 0),
                    duration: parts[4].parse().ok(),
                    position: parts[5].parse().ok(),
                }
            } else {
                NowPlayingInfo::default()
            }
        }
        Err(_) => NowPlayingInfo::default(),
    }
}

#[cfg(not(target_os = "macos"))]
fn query_apple_music() -> NowPlayingInfo {
    NowPlayingInfo::default()
}

#[tauri::command]
fn get_now_playing() -> NowPlayingInfo {
    query_apple_music()
}

#[tauri::command]
fn open_apple_music() {
    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .arg("-a")
            .arg("Music")
            .spawn();
    }
}

fn get_data_dir(app: &AppHandle) -> PathBuf {
    #[cfg(debug_assertions)]
    {
        let dev_dir = std::env::current_dir().unwrap_or_default().join("dev-data");
        if !dev_dir.exists() {
            fs::create_dir_all(&dev_dir).ok();
        }
        return dev_dir;
    }
    #[cfg(not(debug_assertions))]
    {
        app.path().app_local_data_dir().expect("Failed to get app data dir")
    }
}

fn get_data_path(app: &AppHandle) -> PathBuf {
    get_data_dir(app).join("data.json")
}

fn get_images_path(app: &AppHandle) -> PathBuf {
    get_data_dir(app).join("images")
}

fn get_backups_path(app: &AppHandle) -> PathBuf {
    get_data_dir(app).join("backups")
}

fn create_daily_backup(app: &AppHandle) -> Result<(), String> {
    let data_path = get_data_path(app);
    if !data_path.exists() {
        return Ok(());
    }

    let backups_dir = get_backups_path(app);
    if !backups_dir.exists() {
        fs::create_dir_all(&backups_dir)
            .map_err(|e| format!("Failed to create backups dir: {}", e))?;
    }

    let today = Local::now().format("%Y-%m-%d").to_string();
    let backup_filename = format!("data.backup.{}.json", today);
    let backup_path = backups_dir.join(&backup_filename);

    if backup_path.exists() {
        return Ok(());
    }

    fs::copy(&data_path, &backup_path)
        .map_err(|e| format!("Failed to create backup: {}", e))?;

    eprintln!("Created daily backup: {}", backup_filename);
    cleanup_old_backups(app);
    Ok(())
}

fn cleanup_old_backups(app: &AppHandle) {
    let backups_dir = get_backups_path(app);
    if !backups_dir.exists() {
        return;
    }

    let mut backups: Vec<_> = fs::read_dir(&backups_dir)
        .ok()
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| {
                    e.file_name()
                        .to_string_lossy()
                        .starts_with("data.backup.")
                })
                .collect()
        })
        .unwrap_or_default();

    backups.sort_by_key(|e| std::cmp::Reverse(e.file_name()));

    for old_backup in backups.iter().skip(7) {
        let _ = fs::remove_file(old_backup.path());
        eprintln!("Removed old backup: {:?}", old_backup.file_name());
    }
}

fn try_load_from_backup(app: &AppHandle) -> Option<AppData> {
    let backups_dir = get_backups_path(app);
    if !backups_dir.exists() {
        return None;
    }

    let mut backups: Vec<_> = fs::read_dir(&backups_dir)
        .ok()?
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.file_name()
                .to_string_lossy()
                .starts_with("data.backup.")
        })
        .collect();

    backups.sort_by_key(|e| std::cmp::Reverse(e.file_name()));

    for backup in backups {
        if let Ok(content) = fs::read_to_string(backup.path()) {
            if let Ok(data) = serde_json::from_str::<AppData>(&content) {
                eprintln!("Recovered data from backup: {:?}", backup.file_name());
                return Some(data);
            }
        }
    }

    None
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct PlanItem {
    pub id: String,
    pub text: String,
    pub completed: bool,
    #[serde(default)]
    pub notes: String,
    #[serde(default, rename = "targetExamples", skip_serializing_if = "Option::is_none")]
    pub target_examples: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Section {
    pub id: String,
    pub title: String,
    pub period: String,
    pub items: Vec<PlanItem>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct NotificationSettings {
    pub enabled: bool,
    pub daily_reminder: bool,
    pub daily_time: String,
    pub weekly_reminder: bool,
    pub weekly_day: String,
    pub weekly_time: String,
    #[serde(default)]
    pub stand_reminder_enabled: bool,
    #[serde(default = "default_sit_duration")]
    pub sit_duration_minutes: u32,
    #[serde(default = "default_stand_duration")]
    pub stand_duration_minutes: u32,
    #[serde(default)]
    pub stand_mode: String,  // "sitting" or "standing"
    #[serde(default)]
    pub stand_mode_changed_at: Option<String>,  // ISO timestamp
}

fn default_sit_duration() -> u32 { 45 }
fn default_stand_duration() -> u32 { 10 }

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct QuickNote {
    pub id: String,
    pub text: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct BragDocEntry {
    pub id: String,
    pub title: String,
    pub text: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<String>>,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct DailyTask {
    pub id: String,
    pub text: String,
    #[serde(default)]
    pub description: String,
    #[serde(default, rename = "goalId", skip_serializing_if = "Option::is_none")]
    pub goal_id: Option<String>,
    pub completed: bool,
    #[serde(default, rename = "completedAt", skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<String>,
    pub date: String,
    #[serde(default, rename = "movedToDate", skip_serializing_if = "Option::is_none")]
    pub moved_to_date: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub order: Option<i32>,
    #[serde(default, rename = "isFrog", skip_serializing_if = "Option::is_none")]
    pub is_frog: Option<bool>,
    #[serde(default = "default_category")]
    pub category: String,
    #[serde(default, rename = "timeboxMinutes", skip_serializing_if = "Option::is_none")]
    pub timebox_minutes: Option<i32>,
}

fn default_category() -> String {
    "work".to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ActiveTimer {
    pub id: String,
    #[serde(rename = "type")]
    pub timer_type: String,
    #[serde(default, rename = "taskId", skip_serializing_if = "Option::is_none")]
    pub task_id: Option<String>,
    #[serde(default, rename = "taskName", skip_serializing_if = "Option::is_none")]
    pub task_name: Option<String>,
    #[serde(rename = "endTime")]
    pub end_time: String,
    #[serde(rename = "durationMinutes")]
    pub duration_minutes: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Todo {
    pub id: String,
    pub text: String,
    #[serde(default)]
    pub description: String,
    #[serde(default, rename = "goalId", skip_serializing_if = "Option::is_none")]
    pub goal_id: Option<String>,
    #[serde(default, rename = "lastScheduledDate", skip_serializing_if = "Option::is_none")]
    pub last_scheduled_date: Option<String>,
    #[serde(default, rename = "createdAt")]
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct FeatureRequest {
    pub id: String,
    pub text: String,
    #[serde(default, rename = "createdAt")]
    pub created_at: String,
    #[serde(default)]
    pub completed: bool,
    #[serde(default, rename = "completedAt", skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct BugReport {
    pub id: String,
    pub text: String,
    #[serde(default, rename = "createdAt")]
    pub created_at: String,
    #[serde(default)]
    pub completed: bool,
    #[serde(default, rename = "completedAt", skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AppData {
    pub sections: Vec<Section>,
    pub notifications: NotificationSettings,
    #[serde(default, rename = "quickNotes")]
    pub quick_notes: Vec<QuickNote>,
    #[serde(default, rename = "bragDocs")]
    pub brag_docs: Vec<BragDocEntry>,
    #[serde(default, rename = "dailyTasks")]
    pub daily_tasks: Vec<DailyTask>,
    #[serde(default)]
    pub todos: Vec<Todo>,
    #[serde(default, rename = "featureRequests")]
    pub feature_requests: Vec<FeatureRequest>,
    #[serde(default, rename = "bugReports")]
    pub bug_reports: Vec<BugReport>,
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default, rename = "darkMode")]
    pub dark_mode: bool,
    #[serde(default, rename = "userName")]
    pub user_name: Option<String>,
    #[serde(default, rename = "onboardingComplete")]
    pub onboarding_complete: bool,
    #[serde(default = "default_true", rename = "appleMusicEnabled")]
    pub apple_music_enabled: bool,
    #[serde(default = "default_true", rename = "frogEnabled")]
    pub frog_enabled: bool,
    #[serde(default, rename = "atcDays", skip_serializing_if = "Vec::is_empty")]
    pub atc_days: Vec<String>,
    #[serde(default, rename = "activeTimer", skip_serializing_if = "Option::is_none")]
    pub active_timer: Option<ActiveTimer>,
    #[serde(default, rename = "activeTimers", skip_serializing_if = "Vec::is_empty")]
    pub active_timers: Vec<ActiveTimer>,
}

fn default_theme() -> String {
    "editorial".to_string()
}

fn default_true() -> bool {
    true
}

#[tauri::command]
fn load_data(app: AppHandle) -> Result<AppData, String> {
    let path = get_data_path(&app);

    if !path.exists() {
        return Ok(AppData::default());
    }

    let content = match fs::read_to_string(&path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to read data.json: {}. Trying backup...", e);
            if let Some(backup_data) = try_load_from_backup(&app) {
                let _ = app.emit("data-recovered-from-backup", ());
                return Ok(backup_data);
            }
            return Ok(AppData::default());
        }
    };

    match serde_json::from_str(&content) {
        Ok(data) => Ok(data),
        Err(e) => {
            eprintln!("Failed to parse data.json: {}. Trying backup...", e);
            if let Some(backup_data) = try_load_from_backup(&app) {
                let _ = app.emit("data-recovered-from-backup", ());
                return Ok(backup_data);
            }
            eprintln!("No valid backup found. Starting fresh.");
            Ok(AppData::default())
        }
    }
}

#[tauri::command]
fn save_data(app: AppHandle, data: AppData) -> Result<(), String> {
    let data_dir = get_data_dir(&app);
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir)
            .map_err(|e| format!("Failed to create data dir: {}", e))?;
    }

    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    fs::write(get_data_path(&app), content)
        .map_err(|e| format!("Failed to write data: {}", e))?;

    Ok(())
}

#[tauri::command]
fn save_image(app: AppHandle, base64_data: String, extension: String) -> Result<String, String> {
    let images_dir = get_images_path(&app);
    if !images_dir.exists() {
        fs::create_dir_all(&images_dir)
            .map_err(|e| format!("Failed to create images dir: {}", e))?;
    }

    let id = Uuid::new_v4().to_string();
    let filename = format!("{}.{}", id, extension);
    let path = images_dir.join(&filename);

    let bytes = BASE64.decode(&base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    fs::write(&path, bytes)
        .map_err(|e| format!("Failed to write image: {}", e))?;

    Ok(filename)
}

#[tauri::command]
fn get_image(app: AppHandle, filename: String) -> Result<String, String> {
    let path = get_images_path(&app).join(&filename);

    let bytes = fs::read(&path)
        .map_err(|e| format!("Failed to read image: {}", e))?;

    let base64_data = BASE64.encode(&bytes);
    let extension = filename.split('.').last().unwrap_or("png");
    let mime = match extension {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        _ => "image/png",
    };

    Ok(format!("data:{};base64,{}", mime, base64_data))
}

#[tauri::command]
fn delete_image(app: AppHandle, filename: String) -> Result<(), String> {
    let path = get_images_path(&app).join(&filename);

    if path.exists() {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to delete image: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn check_notification_permission(app: AppHandle) -> Result<String, String> {
    use tauri_plugin_notification::{NotificationExt, PermissionState};

    let permission = app.notification().permission_state()
        .map_err(|e| format!("Failed to check permission: {}", e))?;

    let state = match permission {
        PermissionState::Granted => "granted",
        PermissionState::Denied => "denied",
        _ => "unknown",
    };

    Ok(state.to_string())
}

#[tauri::command]
fn request_notification_permission(app: AppHandle) -> Result<String, String> {
    use tauri_plugin_notification::{NotificationExt, PermissionState};

    let result = app.notification().request_permission()
        .map_err(|e| format!("Failed to request permission: {}", e))?;

    let state = match result {
        PermissionState::Granted => "granted",
        PermissionState::Denied => "denied",
        _ => "unknown",
    };

    Ok(state.to_string())
}

#[tauri::command]
fn send_notification(title: String, body: String, app: AppHandle) -> Result<String, String> {
    use tauri_plugin_notification::{NotificationExt, PermissionState};

    let permission = app.notification().permission_state()
        .map_err(|e| format!("Failed to check permission: {}", e))?;

    if permission != PermissionState::Granted {
        return Ok(format!("Permission not granted (state: {:?}). Please enable notifications for this app in System Settings > Notifications.", permission));
    }

    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .sound("Ping")
        .show()
        .map_err(|e| format!("Failed to send notification: {}", e))?;

    Ok("sent".to_string())
}

#[derive(Default)]
struct LastNotification {
    daily_date: Option<String>,
    weekly_date: Option<String>,
}

fn parse_time(time_str: &str) -> Option<(u32, u32)> {
    let parts: Vec<&str> = time_str.split(':').collect();
    if parts.len() == 2 {
        let hour = parts[0].parse().ok()?;
        let minute = parts[1].parse().ok()?;
        Some((hour, minute))
    } else {
        None
    }
}

fn day_matches(day_str: &str, weekday: Weekday) -> bool {
    match day_str.to_lowercase().as_str() {
        "monday" => weekday == Weekday::Mon,
        "tuesday" => weekday == Weekday::Tue,
        "wednesday" => weekday == Weekday::Wed,
        "thursday" => weekday == Weekday::Thu,
        "friday" => weekday == Weekday::Fri,
        "saturday" => weekday == Weekday::Sat,
        "sunday" => weekday == Weekday::Sun,
        _ => false,
    }
}

fn start_notification_scheduler(app_handle: AppHandle) {
    let last_sent = Arc::new(Mutex::new(LastNotification::default()));

    thread::spawn(move || {
        loop {
            thread::sleep(Duration::from_secs(30));

            let data = match load_data_internal(&app_handle) {
                Ok(d) => d,
                Err(_) => continue,
            };

            if !data.notifications.enabled {
                continue;
            }

            let now = Local::now();
            let today = now.format("%Y-%m-%d").to_string();
            let current_hour = now.hour();
            let current_minute = now.minute();

            let mut last = last_sent.lock().unwrap();

            if data.notifications.daily_reminder {
                if let Some((target_hour, target_minute)) = parse_time(&data.notifications.daily_time) {
                    let should_send = current_hour == target_hour
                        && current_minute >= target_minute
                        && current_minute < target_minute + 5
                        && last.daily_date.as_ref() != Some(&today);

                    if should_send {
                        let _ = send_notification_internal(
                            &app_handle,
                            "Daily Check-in",
                            "Time to review your growth goals!",
                        );
                        last.daily_date = Some(today.clone());
                    }
                }
            }

            if data.notifications.weekly_reminder {
                if let Some((target_hour, target_minute)) = parse_time(&data.notifications.weekly_time) {
                    let weekday = now.weekday();
                    let should_send = day_matches(&data.notifications.weekly_day, weekday)
                        && current_hour == target_hour
                        && current_minute >= target_minute
                        && current_minute < target_minute + 5
                        && last.weekly_date.as_ref() != Some(&today);

                    if should_send {
                        let _ = send_notification_internal(
                            &app_handle,
                            "Weekly Reflection",
                            "Take a moment to reflect on your week's progress.",
                        );
                        last.weekly_date = Some(today.clone());
                    }
                }
            }

            // Stand reminder check
            if data.notifications.stand_reminder_enabled {
                let current_mode = if data.notifications.stand_mode.is_empty() {
                    "sitting"
                } else {
                    &data.notifications.stand_mode
                };

                let duration_minutes = if current_mode == "sitting" {
                    data.notifications.sit_duration_minutes
                } else {
                    data.notifications.stand_duration_minutes
                };

                let should_switch = if let Some(ref changed_at) = data.notifications.stand_mode_changed_at {
                    if let Ok(changed_time) = chrono::DateTime::parse_from_rfc3339(changed_at) {
                        let elapsed = now.signed_duration_since(changed_time);
                        elapsed.num_minutes() >= duration_minutes as i64
                    } else {
                        true // Invalid timestamp, trigger switch
                    }
                } else {
                    true // No timestamp, start the cycle
                };

                if should_switch {
                    let new_mode = if current_mode == "sitting" { "standing" } else { "sitting" };
                    let (title, body) = if new_mode == "standing" {
                        ("Time to Stand!", "Take a break and stand up for a bit.")
                    } else {
                        ("You Can Sit Now", "Good job standing! You can sit down now.")
                    };

                    // Send notification
                    let _ = send_notification_internal(&app_handle, title, body);

                    // Emit event to frontend for overlay
                    let _ = app_handle.emit("alert-triggered", serde_json::json!({
                        "type": "stand",
                        "title": title,
                        "body": body,
                        "mode": new_mode
                    }));

                    // Show and focus window
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }

                    // Update data with new mode
                    let mut updated_data = data.clone();
                    updated_data.notifications.stand_mode = new_mode.to_string();
                    updated_data.notifications.stand_mode_changed_at = Some(now.to_rfc3339());
                    let _ = save_data_internal(&app_handle, &updated_data);
                }
            }
        }
    });
}

fn load_data_internal(app: &AppHandle) -> Result<AppData, String> {
    let path = get_data_path(app);
    if !path.exists() {
        return Ok(AppData::default());
    }
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read data: {}", e))?;
    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse data: {}", e))
}

fn save_data_internal(app: &AppHandle, data: &AppData) -> Result<(), String> {
    let data_dir = get_data_dir(app);
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir)
            .map_err(|e| format!("Failed to create data dir: {}", e))?;
    }
    let content = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;
    fs::write(get_data_path(app), content)
        .map_err(|e| format!("Failed to write data: {}", e))?;
    Ok(())
}

fn send_notification_internal(app: &AppHandle, title: &str, body: &str) -> Result<(), String> {
    use tauri_plugin_notification::{NotificationExt, PermissionState};

    let permission = app.notification().permission_state()
        .map_err(|e| format!("Failed to check permission: {}", e))?;

    if permission != PermissionState::Granted {
        return Ok(());
    }

    app.notification()
        .builder()
        .title(title)
        .body(body)
        .sound("Ping")
        .show()
        .map_err(|e| format!("Failed to send notification: {}", e))?;

    Ok(())
}

#[tauri::command]
fn send_delayed_notification(title: String, body: String, delay_secs: u64, app: AppHandle) {
    thread::spawn(move || {
        thread::sleep(Duration::from_secs(delay_secs));
        let _ = send_notification_internal(&app, &title, &body);
    });
}

#[tauri::command]
fn show_main_window(app: AppHandle) {
    if let Some(main) = app.get_webview_window("main") {
        main.show().unwrap();
        main.set_focus().unwrap();
    }
}

#[cfg(target_os = "macos")]
fn start_now_playing_listener(app_handle: AppHandle) {
    use objc::runtime::{Class, Object, Sel};
    use objc::{msg_send, sel, sel_impl};
    use std::sync::Once;

    type Id = *mut Object;

    static REGISTER_MUSIC_OBSERVER_CLASS: Once = Once::new();
    static mut MUSIC_APP_HANDLE: Option<AppHandle> = None;

    unsafe {
        MUSIC_APP_HANDLE = Some(app_handle);
    }

    extern "C" fn handle_music_notification(_this: &Object, _sel: Sel, _notification: Id) {
        unsafe {
            if let Some(ref app) = MUSIC_APP_HANDLE {
                let info = query_apple_music();
                let _ = app.emit("now-playing-changed", &info);
            }
        }
    }

    REGISTER_MUSIC_OBSERVER_CLASS.call_once(|| {
        let superclass = Class::get("NSObject").unwrap();
        let mut decl = objc::declare::ClassDecl::new("GrowingMusicObserver", superclass).unwrap();

        unsafe {
            decl.add_method(
                sel!(handleMusicNotification:),
                handle_music_notification as extern "C" fn(&Object, Sel, Id),
            );
        }

        decl.register();
    });

    unsafe {
        let observer_class = Class::get("GrowingMusicObserver").unwrap();
        let observer: Id = msg_send![observer_class, new];

        let notification_center_class = Class::get("NSDistributedNotificationCenter").unwrap();
        let notification_center: Id = msg_send![notification_center_class, defaultCenter];

        let nsstring_class = Class::get("NSString").unwrap();
        let notification_name: Id = msg_send![nsstring_class, stringWithUTF8String: b"com.apple.Music.playerInfo\0".as_ptr()];

        let _: () = msg_send![
            notification_center,
            addObserver: observer
            selector: sel!(handleMusicNotification:)
            name: notification_name
            object: std::ptr::null::<Object>()
        ];

        eprintln!("Apple Music listener registered");
        let _ = observer;
    }
}

#[cfg(not(target_os = "macos"))]
fn start_now_playing_listener(_app_handle: AppHandle) {
    eprintln!("Apple Music listener not supported on this platform");
}

#[cfg(target_os = "macos")]
fn start_wake_listener(app_handle: AppHandle) {
    use objc::runtime::{Class, Object, Sel};
    use objc::{msg_send, sel, sel_impl};
    use std::sync::Once;

    type Id = *mut Object;

    static REGISTER_OBSERVER_CLASS: Once = Once::new();
    static mut APP_HANDLE: Option<AppHandle> = None;

    unsafe {
        APP_HANDLE = Some(app_handle);
    }

    extern "C" fn handle_wake_notification(_this: &Object, _sel: Sel, _notification: Id) {
        eprintln!("System wake detected!");
        unsafe {
            if let Some(ref app) = APP_HANDLE {
                let _ = app.emit("system-wake", ());
            }
        }
    }

    REGISTER_OBSERVER_CLASS.call_once(|| {
        let superclass = Class::get("NSObject").unwrap();
        let mut decl = objc::declare::ClassDecl::new("GrowingWakeObserver", superclass).unwrap();

        unsafe {
            decl.add_method(
                sel!(handleWakeNotification:),
                handle_wake_notification as extern "C" fn(&Object, Sel, Id),
            );
        }

        decl.register();
    });

    unsafe {
        let observer_class = Class::get("GrowingWakeObserver").unwrap();
        let observer: Id = msg_send![observer_class, new];

        let workspace_class = Class::get("NSWorkspace").unwrap();
        let workspace: Id = msg_send![workspace_class, sharedWorkspace];
        let notification_center: Id = msg_send![workspace, notificationCenter];

        let nsstring_class = Class::get("NSString").unwrap();
        let notification_name: Id = msg_send![nsstring_class, stringWithUTF8String: b"NSWorkspaceDidWakeNotification\0".as_ptr()];

        let _: () = msg_send![
            notification_center,
            addObserver: observer
            selector: sel!(handleWakeNotification:)
            name: notification_name
            object: std::ptr::null::<Object>()
        ];

        eprintln!("Wake listener registered");

        // Keep observer alive for the lifetime of the app
        // The pointer is intentionally leaked since we want it to persist
        let _ = observer;
    }
}

#[cfg(not(target_os = "macos"))]
fn start_wake_listener(_app_handle: AppHandle) {
    eprintln!("Wake listener not supported on this platform");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default();

    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }));
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None))
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            // Create daily backup on startup
            if let Err(e) = create_daily_backup(&app.handle()) {
                eprintln!("Failed to create daily backup: {}", e);
            }

            // First launch: resize to quarter screen if no data.json exists yet
            let data_path = get_data_path(&app.handle());
            if !data_path.exists() {
                if let Some(window) = app.get_webview_window("main") {
                    if let Some(monitor) = window.current_monitor().ok().flatten() {
                        let size = monitor.size();
                        let scale = monitor.scale_factor();
                        let width = (size.width as f64 / scale / 2.0) as u32;
                        let height = (size.height as f64 / scale / 2.0) as u32;
                        let _ = window.set_size(tauri::LogicalSize::new(width, height));
                    }
                }
            }

            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(false)
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            start_notification_scheduler(app.handle().clone());
            start_wake_listener(app.handle().clone());
            start_now_playing_listener(app.handle().clone());

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            show_main_window,
            load_data,
            save_data,
            save_image,
            get_image,
            delete_image,
            send_notification,
            send_delayed_notification,
            check_notification_permission,
            request_notification_permission,
            get_now_playing,
            open_apple_music,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}