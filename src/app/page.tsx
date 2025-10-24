export const dynamic = 'force-dynamic';  // or: export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, TrendingUp, Clock, Sparkles } from "lucide-react";

interface Video {
  id: string;
  title: string;
  poster_url: string | null;
  view_count: number;
  published_at: string;
  duration_seconds: number;
  channel_name: string;
  channel_handle: string;
}

function VideoGrid({ videos, title, icon }: { videos: Video[]; title: string; icon: React.ReactNode }) {
  if (videos.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center gap-2">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="group space-y-3"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {video.poster_url ? (
                <img
                  src={video.poster_url}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                {Math.floor(video.duration_seconds / 60)}:
                {(video.duration_seconds % 60).toString().padStart(2, "0")}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {video.channel_name}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{video.view_count.toLocaleString()} views</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(video.published_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: trendingData } = await supabase.rpc("get_trending_videos", {
    limit_count: 12,
  });

  const { data: freshData } = await supabase.rpc("get_fresh_videos", {
    limit_count: 12,
  });

  let personalizedData = null;
  if (currentUser) {
    const { data } = await supabase.rpc("get_personalized_videos", {
      user_id_param: currentUser.id,
      limit_count: 12,
    });
    personalizedData = data;
  }

  const trendingVideos: Video[] = (trendingData || []).map((v: any) => ({
    id: v.id,
    title: v.title,
    poster_url: v.poster_url,
    view_count: v.view_count,
    published_at: v.published_at,
    duration_seconds: v.duration_seconds,
    channel_name: v.channel_name,
    channel_handle: v.channel_handle,
  }));

  const freshVideos: Video[] = (freshData || []).map((v: any) => ({
    id: v.id,
    title: v.title,
    poster_url: v.poster_url,
    view_count: v.view_count,
    published_at: v.published_at,
    duration_seconds: v.duration_seconds,
    channel_name: v.channel_name,
    channel_handle: v.channel_handle,
  }));

  const personalizedVideos: Video[] = personalizedData
    ? personalizedData.map((v: any) => ({
        id: v.id,
        title: v.title,
        poster_url: v.poster_url,
        view_count: v.view_count,
        published_at: v.published_at,
        duration_seconds: v.duration_seconds,
        channel_name: v.channel_name,
        channel_handle: v.channel_handle,
      }))
    : [];

  return (
    <div className="container py-8">
      {personalizedVideos.length > 0 && (
        <VideoGrid
          videos={personalizedVideos}
          title="For You"
          icon={<Sparkles className="h-6 w-6" />}
        />
      )}

      <VideoGrid
        videos={trendingVideos}
        title="Trending"
        icon={<TrendingUp className="h-6 w-6" />}
      />

      <VideoGrid
        videos={freshVideos}
        title="Fresh"
        icon={<Clock className="h-6 w-6" />}
      />
    </div>
  );
}
