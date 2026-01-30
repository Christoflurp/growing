import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { NowPlayingInfo } from "../../types";

interface MusicWidgetProps {
  nowPlaying: NowPlayingInfo | null;
  onRefresh?: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MusicWidget({ nowPlaying, onRefresh }: MusicWidgetProps) {
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (nowPlaying?.position !== undefined) {
      setCurrentPosition(nowPlaying.position);
      lastUpdateRef.current = Date.now();
    }
    setIsPlaying(nowPlaying?.is_playing ?? false);
  }, [nowPlaying?.position, nowPlaying?.title, nowPlaying?.is_playing]);

  useEffect(() => {
    if (!isPlaying || nowPlaying?.duration === undefined) {
      return;
    }

    const duration = nowPlaying.duration;
    const basePosition = nowPlaying.position || 0;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastUpdateRef.current) / 1000;
      const newPosition = basePosition + elapsed;
      if (newPosition <= duration) {
        setCurrentPosition(newPosition);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, nowPlaying?.position, nowPlaying?.duration]);

  const handlePlayPause = async () => {
    await invoke("play_pause_music");
    setIsPlaying(!isPlaying);
    setTimeout(() => onRefresh?.(), 300);
  };

  const handlePrevious = async () => {
    await invoke("previous_track");
    setTimeout(() => onRefresh?.(), 500);
  };

  const handleNext = async () => {
    await invoke("next_track");
    setTimeout(() => onRefresh?.(), 500);
  };

  const handleOpenMusic = () => {
    invoke("open_apple_music");
  };

  const handleOpenArtist = () => {
    if (nowPlaying?.artist) {
      invoke("open_artist_in_music", { artist: nowPlaying.artist });
    }
  };

  const handleOpenAlbum = () => {
    if (nowPlaying?.album) {
      invoke("open_album_in_music", { album: nowPlaying.album, artist: nowPlaying.artist });
    }
  };

  if (!nowPlaying?.title) {
    return (
      <div className="music-widget music-widget-empty" onClick={handleOpenMusic}>
        <div className="music-widget-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <span className="music-widget-empty-text">Open Apple Music</span>
      </div>
    );
  }

  const { title, artist, album, duration, artwork } = nowPlaying;
  const progress = duration ? (currentPosition / duration) * 100 : 0;

  const getArtworkUrl = (base64: string): string => {
    if (base64.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${base64}`;
    } else if (base64.startsWith('iVBOR')) {
      return `data:image/png;base64,${base64}`;
    }
    return `data:image/jpeg;base64,${base64}`;
  };

  const artworkUrl = artwork ? getArtworkUrl(artwork) : null;

  return (
    <div className={`music-widget ${!isPlaying ? "paused" : ""}`}>
      <div className="music-widget-art" onClick={handleOpenAlbum} title={`Open "${album}" in Apple Music`}>
        {artworkUrl ? (
          <img src={artworkUrl} alt={`${album} artwork`} />
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        )}
      </div>
      <div className="music-widget-info">
        <p className="music-widget-title" title={title}>{title}</p>
        <p className="music-widget-artist clickable" title={`Open "${artist}" in Apple Music`} onClick={handleOpenArtist}>{artist}</p>
        {album && <p className="music-widget-album clickable" title={`Open "${album}" in Apple Music`} onClick={handleOpenAlbum}>{album}</p>}
        <div className="music-widget-progress">
          <div className="music-widget-progress-bar">
            <div className="music-widget-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="music-widget-time">
            <span>{formatTime(currentPosition)}</span>
            <span>{duration ? formatTime(duration) : "--:--"}</span>
          </div>
        </div>
      </div>
      <div className="music-widget-controls-wrapper">
        <div className="music-widget-controls">
          <button className="music-control-btn" onClick={handlePrevious} title="Previous">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button className="music-control-btn music-control-play" onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button className="music-control-btn" onClick={handleNext} title="Next">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
        <button className="music-open-btn" onClick={handleOpenMusic} title="Open Apple Music">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
