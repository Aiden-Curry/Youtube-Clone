"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateVideoMetadata(
  videoId: string,
  data: {
    title: string;
    description: string;
    tags: string[];
    visibility: "public" | "private" | "unlisted";
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: video } = await supabase
    .from("videos")
    .select("channel_id, channels!inner(user_id)")
    .eq("id", videoId)
    .single();

  if (!video) {
    return { error: "Video not found" };
  }

  const channelData = Array.isArray(video.channels)
    ? video.channels[0]
    : video.channels;

  if (channelData.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("videos")
    .update({
      title: data.title,
      description: data.description,
      tags: data.tags,
      visibility: data.visibility,
    })
    .eq("id", videoId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/studio");
  revalidatePath(`/watch/${videoId}`);

  return { success: true };
}

export async function deleteVideo(videoId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: video } = await supabase
    .from("videos")
    .select("channel_id, channels!inner(user_id)")
    .eq("id", videoId)
    .single();

  if (!video) {
    return { error: "Video not found" };
  }

  const channelData = Array.isArray(video.channels)
    ? video.channels[0]
    : video.channels;

  if (channelData.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("videos").delete().eq("id", videoId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/studio");

  return { success: true };
}

export async function getVideoAnalytics(videoId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: video } = await supabase
    .from("videos")
    .select("channel_id, channels!inner(user_id), duration_seconds")
    .eq("id", videoId)
    .single();

  if (!video) {
    return { error: "Video not found" };
  }

  const channelData = Array.isArray(video.channels)
    ? video.channels[0]
    : video.channels;

  if (channelData.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { data: viewsOverTime } = await supabase
    .from("play_history")
    .select("created_at, updated_at")
    .eq("video_id", videoId)
    .order("created_at", { ascending: true });

  const { data: retentionData } = await supabase
    .from("play_history")
    .select("last_position, watch_duration")
    .eq("video_id", videoId);

  return {
    success: true,
    viewsOverTime: viewsOverTime || [],
    retentionData: retentionData || [],
    duration: video.duration_seconds,
  };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: comment } = await supabase
    .from("comments")
    .select(
      `
      id,
      video_id,
      videos!inner(
        channel_id,
        channels!inner(
          user_id
        )
      )
    `
    )
    .eq("id", commentId)
    .single();

  if (!comment) {
    return { error: "Comment not found" };
  }

  const videoData = Array.isArray(comment.videos)
    ? comment.videos[0]
    : comment.videos;
  const channelData = Array.isArray(videoData.channels)
    ? videoData.channels[0]
    : videoData.channels;

  if (channelData.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/studio");

  return { success: true };
}
