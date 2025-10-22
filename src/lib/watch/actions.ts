"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function trackPlayEvent(
  videoId: string,
  lastPosition: number,
  watchDuration: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existing } = await supabase
    .from("play_history")
    .select("id, watch_duration, last_position")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("play_history")
      .update({
        last_position: lastPosition,
        watch_duration: existing.watch_duration + watchDuration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("play_history").insert({
      user_id: user.id,
      video_id: videoId,
      last_position: lastPosition,
      watch_duration: watchDuration,
    });

    if (error) {
      return { error: error.message };
    }
  }

  return { success: true };
}

export async function incrementViewCount(videoId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_view_count", {
    video_id_param: videoId,
  });

  if (error) {
    console.error("Failed to increment view count:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function toggleLike(videoId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({
      user_id: user.id,
      video_id: videoId,
    });
  }

  revalidatePath(`/watch/${videoId}`);

  return { success: true };
}

export async function toggleSubscribe(channelId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("subscriber_id", user.id)
    .eq("channel_id", channelId)
    .maybeSingle();

  if (existing) {
    await supabase.from("subscriptions").delete().eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert({
      subscriber_id: user.id,
      channel_id: channelId,
    });
  }

  revalidatePath(`/watch/*`);

  return { success: true };
}

export async function postComment(
  videoId: string,
  content: string,
  parentId?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("comments").insert({
    user_id: user.id,
    video_id: videoId,
    parent_id: parentId || null,
    content,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/watch/${videoId}`);

  return { success: true };
}
