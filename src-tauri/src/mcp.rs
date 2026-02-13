use axum::{
    Router,
    routing::{get, post},
    response::Json,
    extract::State,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, OnceLock};
use tokio::sync::oneshot;

static SERVER_HANDLE: OnceLock<Mutex<Option<ServerHandle>>> = OnceLock::new();

struct ServerHandle {
    shutdown_tx: oneshot::Sender<()>,
}

const MCP_PORT: u16 = 21517;

#[derive(Clone)]
struct McpState {
    data_dir: PathBuf,
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct JsonRpcRequest {
    jsonrpc: String,
    id: Option<Value>,
    method: String,
    #[serde(default)]
    params: Value,
}

#[derive(Serialize)]
struct JsonRpcResponse {
    jsonrpc: String,
    id: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<Value>,
}

impl JsonRpcResponse {
    fn success(id: Value, result: Value) -> Self {
        Self { jsonrpc: "2.0".to_string(), id, result: Some(result), error: None }
    }

    fn error(id: Value, code: i64, message: &str) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            id,
            result: None,
            error: Some(json!({ "code": code, "message": message })),
        }
    }
}

fn load_app_data(data_dir: &PathBuf) -> Result<Value, String> {
    let path = data_dir.join("data.json");
    if !path.exists() {
        return Ok(json!({}));
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

fn save_app_data(data_dir: &PathBuf, data: &Value) -> Result<(), String> {
    let path = data_dir.join("data.json");
    let content = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

fn handle_initialize(id: Value) -> JsonRpcResponse {
    JsonRpcResponse::success(id, json!({
        "protocolVersion": "2025-03-26",
        "capabilities": {
            "tools": {}
        },
        "serverInfo": {
            "name": "growing",
            "version": "1.4.0"
        }
    }))
}

fn handle_tools_list(id: Value) -> JsonRpcResponse {
    JsonRpcResponse::success(id, json!({
        "tools": [
            {
                "name": "get_tasks",
                "description": "Get tasks for a specific date. Returns all daily tasks including their completion status, descriptions, and categories.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "date": { "type": "string", "description": "Date in YYYY-MM-DD format. Defaults to today." }
                    }
                }
            },
            {
                "name": "add_task",
                "description": "Add a new daily task.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "text": { "type": "string", "description": "Task title" },
                        "description": { "type": "string", "description": "Task description" },
                        "category": { "type": "string", "enum": ["work", "personal"], "description": "Task category. Defaults to work." },
                        "date": { "type": "string", "description": "Date in YYYY-MM-DD format. Defaults to today." }
                    },
                    "required": ["text"]
                }
            },
            {
                "name": "complete_task",
                "description": "Mark a task as completed by its ID.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "string", "description": "Task ID" }
                    },
                    "required": ["id"]
                }
            },
            {
                "name": "get_goals",
                "description": "Get all goals organized by timeframe (ongoing, quarterly, monthly) with completion status.",
                "inputSchema": { "type": "object", "properties": {} }
            },
            {
                "name": "add_note",
                "description": "Add a quick note with a timestamp.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "text": { "type": "string", "description": "Note text" }
                    },
                    "required": ["text"]
                }
            },
            {
                "name": "add_review",
                "description": "Log a PR review.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "prLink": { "type": "string", "description": "Full GitHub or Graphite PR URL" },
                        "isReReview": { "type": "boolean", "description": "Whether this is a re-review of the same PR" }
                    },
                    "required": ["prLink"]
                }
            },
            {
                "name": "add_brag_doc",
                "description": "Add a brag doc entry to track accomplishments.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "title": { "type": "string", "description": "Entry title" },
                        "text": { "type": "string", "description": "Description of the accomplishment" },
                        "links": { "type": "array", "items": { "type": "string" }, "description": "Related URLs" }
                    },
                    "required": ["title", "text"]
                }
            },
            {
                "name": "get_weekly_recap",
                "description": "Get the latest or a specific weekly recap.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "week": { "type": "string", "description": "Week identifier like 2026-W06. Defaults to the latest available." }
                    }
                }
            }
        ]
    }))
}

fn get_today() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

fn handle_tools_call(id: Value, params: &Value, state: &McpState) -> JsonRpcResponse {
    let tool_name = params.get("name").and_then(|n| n.as_str()).unwrap_or("");
    let args = params.get("arguments").cloned().unwrap_or(json!({}));

    match tool_name {
        "get_tasks" => {
            let data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let date = args.get("date").and_then(|d| d.as_str()).map(String::from).unwrap_or_else(get_today);
            let tasks: Vec<&Value> = data.get("dailyTasks")
                .and_then(|t| t.as_array())
                .map(|arr| arr.iter().filter(|t| t.get("date").and_then(|d| d.as_str()) == Some(&date)).collect())
                .unwrap_or_default();
            JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": serde_json::to_string_pretty(&tasks).unwrap_or_default() }] }))
        }
        "add_task" => {
            let mut data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let text = args.get("text").and_then(|t| t.as_str()).unwrap_or("");
            if text.is_empty() {
                return JsonRpcResponse::error(id, -32602, "text is required");
            }
            let date = args.get("date").and_then(|d| d.as_str()).map(String::from).unwrap_or_else(get_today);
            let category = args.get("category").and_then(|c| c.as_str()).unwrap_or("work");
            let description = args.get("description").and_then(|d| d.as_str()).unwrap_or("");
            let task_id = uuid::Uuid::new_v4().to_string();
            let new_task = json!({
                "id": task_id,
                "text": text,
                "description": description,
                "category": category,
                "completed": false,
                "date": date,
                "order": 0
            });
            let tasks = data.get_mut("dailyTasks").and_then(|t| t.as_array_mut());
            match tasks {
                Some(arr) => arr.push(new_task.clone()),
                None => { data["dailyTasks"] = json!([new_task.clone()]); }
            }
            if let Err(e) = save_app_data(&state.data_dir, &data) {
                return JsonRpcResponse::error(id, -32000, &e);
            }
            JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": format!("Task added: {} ({})", text, task_id) }] }))
        }
        "complete_task" => {
            let mut data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let task_id = args.get("id").and_then(|i| i.as_str()).unwrap_or("");
            if task_id.is_empty() {
                return JsonRpcResponse::error(id, -32602, "id is required");
            }
            let mut found = false;
            if let Some(tasks) = data.get_mut("dailyTasks").and_then(|t| t.as_array_mut()) {
                for task in tasks.iter_mut() {
                    if task.get("id").and_then(|i| i.as_str()) == Some(task_id) {
                        task["completed"] = json!(true);
                        task["completedAt"] = json!(chrono::Local::now().to_rfc3339());
                        found = true;
                        break;
                    }
                }
            }
            if !found {
                return JsonRpcResponse::error(id, -32602, "Task not found");
            }
            if let Err(e) = save_app_data(&state.data_dir, &data) {
                return JsonRpcResponse::error(id, -32000, &e);
            }
            JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": format!("Task {} marked complete", task_id) }] }))
        }
        "get_goals" => {
            let data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let sections = data.get("sections").cloned().unwrap_or(json!([]));
            JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": serde_json::to_string_pretty(&sections).unwrap_or_default() }] }))
        }
        "add_note" => {
            let mut data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let text = args.get("text").and_then(|t| t.as_str()).unwrap_or("");
            if text.is_empty() {
                return JsonRpcResponse::error(id, -32602, "text is required");
            }
            let note = json!({
                "id": uuid::Uuid::new_v4().to_string(),
                "text": text,
                "timestamp": chrono::Local::now().to_rfc3339()
            });
            let notes = data.get_mut("quickNotes").and_then(|n| n.as_array_mut());
            match notes {
                Some(arr) => arr.insert(0, note),
                None => { data["quickNotes"] = json!([note]); }
            }
            if let Err(e) = save_app_data(&state.data_dir, &data) {
                return JsonRpcResponse::error(id, -32000, &e);
            }
            JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": "Note added" }] }))
        }
        "add_review" => {
            let mut data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let pr_link = args.get("prLink").and_then(|l| l.as_str()).unwrap_or("");
            if pr_link.is_empty() {
                return JsonRpcResponse::error(id, -32602, "prLink is required");
            }
            let is_re_review = args.get("isReReview").and_then(|r| r.as_bool()).unwrap_or(false);
            let title = parse_pr_title(pr_link);
            let source = if pr_link.contains("graphite") { "graphite" } else { "github" };
            let review = json!({
                "id": uuid::Uuid::new_v4().to_string(),
                "prLink": pr_link,
                "title": title,
                "source": source,
                "completed": true,
                "completedAt": chrono::Local::now().to_rfc3339(),
                "createdAt": chrono::Local::now().to_rfc3339(),
                "date": get_today(),
                "isReReview": is_re_review
            });
            let reviews = data.get_mut("reviews").and_then(|r| r.as_array_mut());
            match reviews {
                Some(arr) => arr.insert(0, review),
                None => { data["reviews"] = json!([review]); }
            }
            if let Err(e) = save_app_data(&state.data_dir, &data) {
                return JsonRpcResponse::error(id, -32000, &e);
            }
            JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": format!("Review logged: {}", title) }] }))
        }
        "add_brag_doc" => {
            let mut data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let title = args.get("title").and_then(|t| t.as_str()).unwrap_or("");
            let text = args.get("text").and_then(|t| t.as_str()).unwrap_or("");
            if title.is_empty() || text.is_empty() {
                return JsonRpcResponse::error(id, -32602, "title and text are required");
            }
            let links = args.get("links").cloned();
            let mut entry = json!({
                "id": uuid::Uuid::new_v4().to_string(),
                "title": title,
                "text": text,
                "timestamp": chrono::Local::now().to_rfc3339()
            });
            if let Some(links) = links {
                entry["links"] = links;
            }
            let docs = data.get_mut("bragDocs").and_then(|b| b.as_array_mut());
            match docs {
                Some(arr) => arr.insert(0, entry),
                None => { data["bragDocs"] = json!([entry]); }
            }
            if let Err(e) = save_app_data(&state.data_dir, &data) {
                return JsonRpcResponse::error(id, -32000, &e);
            }
            JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": format!("Brag doc added: {}", title) }] }))
        }
        "get_weekly_recap" => {
            let data = match load_app_data(&state.data_dir) {
                Ok(d) => d,
                Err(e) => return JsonRpcResponse::error(id, -32000, &e),
            };
            let recap_path = data.get("weeklyRecapPath").and_then(|p| p.as_str());
            let recap_path = match recap_path {
                Some(p) if !p.is_empty() => PathBuf::from(p),
                _ => return JsonRpcResponse::error(id, -32000, "Weekly recap path not configured"),
            };
            let week = args.get("week").and_then(|w| w.as_str());
            let target_file = if let Some(week) = week {
                recap_path.join(format!("{}.json", week))
            } else {
                let mut files: Vec<_> = fs::read_dir(&recap_path)
                    .map(|entries| entries.filter_map(|e| e.ok())
                        .filter(|e| {
                            let name = e.file_name().to_string_lossy().to_string();
                            name.ends_with(".json") && name.contains("-W")
                        })
                        .collect())
                    .unwrap_or_default();
                files.sort_by_key(|e| e.file_name());
                match files.last() {
                    Some(entry) => entry.path(),
                    None => return JsonRpcResponse::error(id, -32000, "No weekly recaps found"),
                }
            };
            match fs::read_to_string(&target_file) {
                Ok(content) => {
                    let recap: Value = serde_json::from_str(&content).unwrap_or(json!({}));
                    JsonRpcResponse::success(id, json!({ "content": [{ "type": "text", "text": serde_json::to_string_pretty(&recap).unwrap_or_default() }] }))
                }
                Err(e) => JsonRpcResponse::error(id, -32000, &e.to_string()),
            }
        }
        _ => JsonRpcResponse::error(id, -32601, &format!("Unknown tool: {}", tool_name)),
    }
}

fn parse_pr_title(url: &str) -> String {
    let parts: Vec<&str> = url.split('/').collect();
    if parts.len() >= 5 {
        let pr_number = parts[parts.len() - 1];
        let repo = parts[parts.len() - 3];
        let org = parts[parts.len() - 4];
        return format!("[{}/{}#{}]", org, repo, pr_number);
    }
    format!("[{}]", url)
}

async fn handle_mcp_request(
    State(state): State<Arc<McpState>>,
    Json(request): Json<JsonRpcRequest>,
) -> Json<JsonRpcResponse> {
    let id = request.id.unwrap_or(Value::Null);
    let response = match request.method.as_str() {
        "initialize" => handle_initialize(id),
        "notifications/initialized" => return Json(JsonRpcResponse::success(id, json!({}))),
        "tools/list" => handle_tools_list(id),
        "tools/call" => handle_tools_call(id, &request.params, &state),
        _ => JsonRpcResponse::error(id, -32601, &format!("Method not found: {}", request.method)),
    };
    Json(response)
}

async fn health_check() -> &'static str {
    "Growing MCP Server"
}

pub fn start_server(data_dir: PathBuf) -> Result<String, String> {
    let handle_mutex = SERVER_HANDLE.get_or_init(|| Mutex::new(None));
    let mut handle = handle_mutex.lock().map_err(|e| e.to_string())?;

    if handle.is_some() {
        return Ok(format!("http://localhost:{}/mcp", MCP_PORT));
    }

    let state = Arc::new(McpState { data_dir });
    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();

    let app = Router::new()
        .route("/mcp", post(handle_mcp_request))
        .route("/health", get(health_check))
        .with_state(state);

    std::thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("Failed to create tokio runtime");

        rt.block_on(async {
            let addr = SocketAddr::from(([127, 0, 0, 1], MCP_PORT));
            let listener = match tokio::net::TcpListener::bind(addr).await {
                Ok(l) => l,
                Err(e) => {
                    eprintln!("MCP server failed to bind: {}", e);
                    return;
                }
            };
            eprintln!("MCP server listening on http://localhost:{}/mcp", MCP_PORT);

            axum::serve(listener, app)
                .with_graceful_shutdown(async { let _ = shutdown_rx.await; })
                .await
                .ok();

            eprintln!("MCP server stopped");
        });
    });

    *handle = Some(ServerHandle { shutdown_tx });
    Ok(format!("http://localhost:{}/mcp", MCP_PORT))
}

pub fn stop_server() -> Result<(), String> {
    let handle_mutex = SERVER_HANDLE.get_or_init(|| Mutex::new(None));
    let mut handle = handle_mutex.lock().map_err(|e| e.to_string())?;

    if let Some(h) = handle.take() {
        let _ = h.shutdown_tx.send(());
    }
    Ok(())
}

pub fn is_running() -> bool {
    SERVER_HANDLE
        .get()
        .and_then(|m| m.lock().ok())
        .map(|h| h.is_some())
        .unwrap_or(false)
}

pub fn register_with_claude_code(enable: bool) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    let settings_path = home.join(".claude").join("settings.json");

    let mut settings: Value = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or(json!({}))
    } else {
        json!({})
    };

    if enable {
        if settings.get("mcpServers").is_none() {
            settings["mcpServers"] = json!({});
        }
        settings["mcpServers"]["growing"] = json!({
            "url": format!("http://localhost:{}/mcp", MCP_PORT)
        });
    } else {
        if let Some(servers) = settings.get_mut("mcpServers") {
            if let Some(obj) = servers.as_object_mut() {
                obj.remove("growing");
            }
        }
    }

    if let Some(parent) = settings_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&settings_path, content).map_err(|e| e.to_string())?;

    Ok(())
}
