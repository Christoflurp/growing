interface AlertOverlayProps {
  show: boolean;
  title: string;
  body: string;
  type: string;
  onDismiss: () => void;
}

export function AlertOverlay({ show, title, body, type, onDismiss }: AlertOverlayProps) {
  if (!show) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        <div className={`alert-icon ${type}`}>
          {type === "stand" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="5" r="3" />
              <path d="M12 8v8M8 20l4-4 4 4" />
              <path d="M8 12h8" />
            </svg>
          )}
          {type === "warning" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          )}
          {type === "timer" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <path d="M9 2h6M12 2v3" />
            </svg>
          )}
        </div>
        <h2 className="alert-title">{title}</h2>
        <p className="alert-body">{body}</p>
        <button className="alert-dismiss" onClick={onDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}
