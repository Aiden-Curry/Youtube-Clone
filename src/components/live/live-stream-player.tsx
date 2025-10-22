"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface LiveStreamPlayerProps {
  hlsUrl: string;
  status: string;
}

export function LiveStreamPlayer({ hlsUrl, status }: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || status !== "live") return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari || video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, attempting to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, attempting to recover");
              hls.recoverMediaError();
              break;
            default:
              console.log("Fatal error, destroying HLS instance");
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
    };
  }, [hlsUrl, status]);

  if (status === "idle") {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black">
        <div className="text-center text-white">
          <h3 className="text-xl font-semibold">Stream Not Started</h3>
          <p className="text-sm text-gray-400">
            The stream has not started yet. Check back later!
          </p>
        </div>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black">
        <div className="text-center text-white">
          <h3 className="text-xl font-semibold">Stream Ended</h3>
          <p className="text-sm text-gray-400">
            This live stream has ended. Check the channel for archived videos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        playsInline
        muted
      />
    </div>
  );
}
