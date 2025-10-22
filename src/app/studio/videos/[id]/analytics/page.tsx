import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import { VideoAnalytics } from "@/components/studio/video-analytics";

export default async function VideoAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/signin");
  }

  const { data: video } = await supabase
    .from("videos")
    .select(
      `
      id,
      title,
      view_count,
      duration_seconds,
      channels!inner(
        user_id
      )
    `
    )
    .eq("id", id)
    .single();

  if (!video) {
    notFound();
  }

  const channelData = Array.isArray(video.channels)
    ? video.channels[0]
    : video.channels;

  if (channelData.user_id !== currentUser.id) {
    redirect("/studio");
  }

  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("video_id", id);

  const { count: commentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("video_id", id);

  const { data: viewsOverTime } = await supabase
    .from("play_history")
    .select("created_at")
    .eq("video_id", id)
    .order("created_at", { ascending: true });

  const { data: retentionData } = await supabase
    .from("play_history")
    .select("last_position, watch_duration")
    .eq("video_id", id);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Video Analytics</h1>
        <p className="text-muted-foreground">{video.title}</p>
      </div>

      <VideoAnalytics
        videoId={video.id}
        viewCount={video.view_count}
        likeCount={likeCount || 0}
        commentCount={commentCount || 0}
        duration={video.duration_seconds}
        viewsOverTime={viewsOverTime || []}
        retentionData={retentionData || []}
      />
    </div>
  );
}
