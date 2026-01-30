import { useState, useRef, useEffect, ClipboardEvent } from "react";

interface BragDocModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (entry: {
    title: string;
    text: string;
    links: string[];
    pendingImages: string[];
  }) => void;
}

export function BragDocModal({ show, onClose, onSave }: BragDocModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [links, setLinks] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            setPendingImages((prev) => [...prev, dataUrl]);
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return;
    const linkArray = links
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    onSave({ title: title.trim(), text: text.trim(), links: linkArray, pendingImages });
    setTitle("");
    setText("");
    setLinks("");
    setPendingImages([]);
  };

  const handleClose = () => {
    setTitle("");
    setText("");
    setLinks("");
    setPendingImages([]);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="bragdoc-modal" onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        <div className="modal-header">
          <h2>Add Brag Doc Entry</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="modal-input"
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
        />
        <textarea
          placeholder="What did you accomplish? (Paste images here)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="modal-textarea bragdoc-textarea"
        />
        <input
          type="text"
          placeholder="Links (comma separated, optional)"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          className="modal-input"
        />
        {pendingImages.length > 0 && (
          <div className="bragdoc-pending-images">
            {pendingImages.map((dataUrl, index) => (
              <div key={index} className="pending-image">
                <img src={dataUrl} alt={`Pending ${index + 1}`} />
                <button
                  className="pending-image-remove"
                  onClick={() => removePendingImage(index)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-save" onClick={handleSave} disabled={!title.trim() || !text.trim()}>
            Save
          </button>
          <button className="btn-cancel" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
