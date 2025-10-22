"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  videoId: string;
  hlsUrl: string;
  posterUrl?: string;
  onTimeUpdate: (currentTime: number) => void;
  onPlay: () => void;
  onPause: (currentTime: number) => void;
  onEnded: (currentTime: number) => void;
}

export function VideoPlayer({
  videoId,
  hlsUrl,
  posterUrl,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [viewTracked, setViewTracked] = useState(false);
  const [lastWatchTime, setLastWatchTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari || video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded");
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, cannot recover");
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [hlsUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const trackView = async () => {
      if (!viewTracked && video.currentTime > 3) {
        setViewTracked(true);
        try {
          await fetch("/api/analytics/track-view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoId, sessionId }),
          });
        } catch (error) {
          console.error("Failed to track view:", error);
        }
      }
    };

    const trackWatchTime = async (currentTime: number) => {
      const watchDuration = Math.floor(currentTime - lastWatchTime);
      if (watchDuration > 5) {
        setLastWatchTime(currentTime);
        try {
          await fetch("/api/analytics/track-watch-time", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoId, watchDuration, sessionId }),
          });
        } catch (error) {
          console.error("Failed to track watch time:", error);
        }
      }
    };

    const handlePlay = () => {
      onPlay();

      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }

      heartbeatRef.current = setInterval(() => {
        if (video && !video.paused) {
          const currentTime = video.currentTime;
          onTimeUpdate(currentTime);
          trackView();
          trackWatchTime(currentTime);
        }
      }, 10000);
    };

    const handlePause = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      const currentTime = video.currentTime;
      onPause(currentTime);
      trackWatchTime(currentTime);
    };

    const handleEnded = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      const currentTime = video.currentTime;
      onEnded(currentTime);
      trackWatchTime(currentTime);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [videoId, sessionId, viewTracked, lastWatchTime, onPlay, onPause, onEnded, onTimeUpdate]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        poster={posterUrl}
        playsInline
      />
    </div>
  );
}
