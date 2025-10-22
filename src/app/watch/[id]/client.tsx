"use client";

import { useRef } from "react";
import { VideoPlayer } from "@/components/watch/video-player";
import { VideoInfo } from "@/components/watch/video-info";
import { ChannelCard } from "@/components/watch/channel-card";
import { CommentsSection } from "@/components/watch/comments-section";
import { UpNext } from "@/components/watch/up-next";
import { trackPlayEvent, incrementViewCount } from "@/lib/watch/actions";

interface WatchPageClientProps {
  videoId: string;
  hlsUrl: string;
  posterUrl: string | null;
  videoInfo: any;
  channelInfo: any;
  channelUser: any;
  comments: any[];
  currentUser: any;
  recommendedVideos: any[];
}

export function WatchPageClient({
  videoId,
  hlsUrl,
  posterUrl,
  videoInfo,
  channelInfo,
  channelUser,
  comments,
  currentUser,
  recommendedVideos,
}: WatchPageClientProps) {
  const lastPositionRef = useRef(0);
  const viewCountedRef = useRef(false);
  const watchStartRef = useRef(0);

  const handlePlay = async () => {
    watchStartRef.current = Date.now();

    if (!viewCountedRef.current) {
      await incrementViewCount(videoId);
      viewCountedRef.current = true;
    }
  };

  const handleTimeUpdate = async (currentTime: number) => {
    lastPositionRef.current = currentTime;

    if (currentUser) {
      const watchDuration = Math.floor((Date.now() - watchStartRef.current) / 1000);
      await trackPlayEvent(videoId, currentTime, watchDuration);
      watchStartRef.current = Date.now();
    }
  };

  const handlePause = async (currentTime: number) => {
    if (currentUser) {
      const watchDuration = Math.floor((Date.now() - watchStartRef.current) / 1000);
      await trackPlayEvent(videoId, currentTime, watchDuration);
    }
  };

  const handleEnded = async (currentTime: number) => {
    if (currentUser) {
      const watchDuration = Math.floor((Date.now() - watchStartRef.current) / 1000);
      await trackPlayEvent(videoId, currentTime, watchDuration);
    }
  };

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <VideoPlayer
              videoId={videoId}
              hlsUrl={hlsUrl}
              posterUrl={posterUrl || undefined}
              onPlay={handlePlay}
              onTimeUpdate={handleTimeUpdate}
              onPause={handlePause}
              onEnded={handleEnded}
            />

            <VideoInfo video={videoInfo} />

            <ChannelCard channel={channelInfo} user={channelUser} />

            <CommentsSection
              videoId={videoId}
              comments={comments}
              currentUser={currentUser}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <UpNext videos={recommendedVideos} />
        </div>
      </div>
    </div>
  );
}
