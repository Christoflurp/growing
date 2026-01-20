import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { NowPlayingInfo } from "../../types";

interface NowPlayingBarProps {
  nowPlaying: NowPlayingInfo | null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NowPlayingBar({ nowPlaying }: NowPlayingBarProps) {
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (nowPlaying?.position !== undefined) {
      setCurrentPosition(nowPlaying.position);
      lastUpdateRef.current = Date.now();
    }
  }, [nowPlaying?.position, nowPlaying?.title]);

  useEffect(() => {
    if (!nowPlaying?.is_playing || nowPlaying.duration === undefined) {
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
  }, [nowPlaying?.is_playing, nowPlaying?.position, nowPlaying?.duration]);

  if (!nowPlaying?.is_playing) {
    return null;
  }

  const { title, artist, album, duration } = nowPlaying;

  const timeDisplay =
    duration !== undefined
      ? `${formatTime(currentPosition)} / ${formatTime(duration)}`
      : null;

  const handleClick = () => {
    invoke("open_apple_music");
  };

  return (
    <div className="now-playing-bar" onClick={handleClick}>
      <div className="now-playing-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
      <div className="now-playing-content">
        <span className="now-playing-track" title={`${artist} - ${title}`}>
          {artist} - {title}
        </span>
        {timeDisplay && (
          <span className="now-playing-time">[{timeDisplay}]</span>
        )}
        {album && (
          <span className="now-playing-album" title={album}>
            ({album})
          </span>
        )}
      </div>
    </div>
  );
}
