import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/watch/video-player";
import { VideoInfo } from "@/components/watch/video-info";
import { ChannelCard } from "@/components/watch/channel-card";
import { CommentsSection } from "@/components/watch/comments-section";
import { UpNext } from "@/components/watch/up-next";
import { WatchPageClient } from "./client";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: video } = await supabase
    .from("videos")
    .select(
      `
      id,
      title,
      description,
      tags,
      view_count,
      published_at,
      hls_master_url,
      poster_url,
      channel:channels!inner(
        id,
        name,
        handle,
        user_id,
        subscriber_count,
        user:users!inner(
          display_name,
          username,
          avatar_url
        )
      )
    `
    )
    .eq("id", id)
    .eq("status", "public")
    .single();

  if (!video || !video.hls_master_url) {
    notFound();
  }

  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("video_id", id);

  let isLiked = false;
  let isSubscribed = false;

  if (currentUser) {
    const { data: likeData } = await supabase
      .from("likes")
      .select("id")
      .eq("video_id", id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    isLiked = !!likeData;

    const channelData = Array.isArray(video.channel) ? video.channel[0] : video.channel;

    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("channel_id", channelData.id)
      .eq("subscriber_id", currentUser.id)
      .maybeSingle();

    isSubscribed = !!subscriptionData;
  }

  const { data: commentsData } = await supabase
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      parent_id,
      user:users(
        display_name,
        username,
        avatar_url
      )
    `
    )
    .eq("video_id", id)
    .order("created_at", { ascending: false });

  const topLevelComments = (commentsData || [])
    .filter((c) => !c.parent_id)
    .map((comment) => ({
      ...comment,
      replies: (commentsData || [])
        .filter((c) => c.parent_id === comment.id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    }));

  const videoTags = video.tags || [];
  const { data: rawRecommendedVideos } = await supabase.rpc(
    "get_recommended_videos",
    {
      current_video_id: id,
      video_tags: videoTags,
      limit_count: 10,
    }
  );

  const recommendedVideos = (rawRecommendedVideos || []).map((v: any) => ({
    id: v.id,
    title: v.title,
    poster_url: v.poster_url,
    view_count: v.view_count,
    published_at: v.published_at,
    duration_seconds: v.duration_seconds,
    channel: {
      name: v.channel_name,
      handle: v.channel_handle,
    },
  }));

  const channelData = Array.isArray(video.channel) ? video.channel[0] : video.channel;
  const userData = Array.isArray(channelData.user) ? channelData.user[0] : channelData.user;

  const videoInfo = {
    id: video.id,
    title: video.title,
    description: video.description,
    tags: video.tags,
    view_count: video.view_count,
    published_at: video.published_at,
    like_count: likeCount || 0,
    is_liked: isLiked,
  };

  const channelInfo = {
    id: channelData.id,
    name: channelData.name,
    handle: channelData.handle,
    subscriber_count: channelData.subscriber_count,
    is_subscribed: isSubscribed,
  };

  const channelUser = {
    display_name: userData.display_name,
    username: userData.username,
    avatar_url: userData.avatar_url,
  };

  return (
    <WatchPageClient
      videoId={video.id}
      hlsUrl={video.hls_master_url}
      posterUrl={video.poster_url}
      videoInfo={videoInfo}
      channelInfo={channelInfo}
      channelUser={channelUser}
      comments={topLevelComments}
      currentUser={currentUser}
      recommendedVideos={recommendedVideos}
    />
  );
}
