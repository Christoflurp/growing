interface LightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function LightboxModal({ imageUrl, onClose }: LightboxModalProps) {
  if (!imageUrl) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img src={imageUrl} alt="Full size" className="lightbox-image" />
      <button className="lightbox-close" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
