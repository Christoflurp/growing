import { useAppData } from "../../context/AppDataContext";
import { useBragDocs } from "../../hooks/useBragDocs";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { formatRelativeTime, formatFullDate } from "../../utils/formatUtils";

interface BragDocViewProps {
  onOpenLightbox: (imageUrl: string) => void;
}

export function BragDocView({ onOpenLightbox }: BragDocViewProps) {
  const { data } = useAppData();
  const { showConfirm } = useConfirmModal();
  const {
    showBragDocForm,
    setShowBragDocForm,
    bragDocTitle,
    setBragDocTitle,
    bragDocText,
    setBragDocText,
    bragDocLinks,
    setBragDocLinks,
    bragDocPendingImages,
    setBragDocPendingImages,
    loadedImages,
    handleBragDocPaste,
    removePendingImage,
    addBragDoc,
    deleteBragDoc: performDeleteBragDoc,
  } = useBragDocs();

  const deleteBragDoc = (id: string) => {
    showConfirm("Delete this brag?", () => performDeleteBragDoc(id));
  };

  return (
    <div className="view bragdoc-view">
      <header className="view-header">
        <h1>Brag Doc</h1>
        <button className="add-btn" onClick={() => setShowBragDocForm(true)}>
          Add Entry
        </button>
      </header>

      {showBragDocForm && (
        <div className="bragdoc-form" onPaste={handleBragDocPaste}>
          <input
            type="text"
            placeholder="Title"
            value={bragDocTitle}
            onChange={(e) => setBragDocTitle(e.target.value)}
            className="bragdoc-title-input"
          />
          <textarea
            placeholder="What did you accomplish? (Paste images here)"
            value={bragDocText}
            onChange={(e) => setBragDocText(e.target.value)}
            className="bragdoc-text-input"
          />
          <input
            type="text"
            placeholder="Links (comma separated, optional)"
            value={bragDocLinks}
            onChange={(e) => setBragDocLinks(e.target.value)}
            className="bragdoc-links-input"
          />
          {bragDocPendingImages.length > 0 && (
            <div className="bragdoc-pending-images">
              {bragDocPendingImages.map((dataUrl, index) => (
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
          <div className="bragdoc-form-actions">
            <button
              className="btn-save"
              onClick={addBragDoc}
              disabled={!bragDocTitle.trim() || !bragDocText.trim()}
            >
              Save
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowBragDocForm(false);
                setBragDocTitle("");
                setBragDocText("");
                setBragDocLinks("");
                setBragDocPendingImages([]);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(data?.bragDocs?.length ?? 0) === 0 && !showBragDocForm ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p>No wins documented yet</p>
          <span>Capture your accomplishments</span>
        </div>
      ) : (
        <div className="bragdoc-list">
          {data?.bragDocs?.map((entry) => (
            <div key={entry.id} className="bragdoc-card">
              <h3 className="bragdoc-card-title">{entry.title}</h3>
              <p className="bragdoc-card-text">{entry.text}</p>
              {entry.links && entry.links.length > 0 && (
                <div className="bragdoc-card-links">
                  {entry.links.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="bragdoc-link">
                      {link.replace(/^https?:\/\//, '').split('/')[0]}
                    </a>
                  ))}
                </div>
              )}
              {entry.images && entry.images.length > 0 && (
                <div className="bragdoc-card-images">
                  {entry.images.map((filename) => (
                    loadedImages[filename] && (
                      <img
                        key={filename}
                        src={loadedImages[filename]}
                        alt="Brag doc attachment"
                        className="bragdoc-image"
                        onClick={() => onOpenLightbox(loadedImages[filename])}
                      />
                    )
                  ))}
                </div>
              )}
              <div className="bragdoc-footer">
                <span className="bragdoc-timestamp" title={formatFullDate(entry.timestamp)}>
                  {formatRelativeTime(entry.timestamp)}
                </span>
                <button className="bragdoc-delete" onClick={() => deleteBragDoc(entry.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
