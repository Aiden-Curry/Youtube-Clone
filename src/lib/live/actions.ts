"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createLivepeerStream,
  deleteLivepeerStream,
  getRTMPIngestUrl,
  getPlaybackUrl,
} from "@/lib/livepeer/client";

export async function createLiveStream(title: string, description?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: channel } = await supabase
    .from("channels")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!channel) {
    return { error: "Channel not found" };
  }

  const livepeerStream = await createLivepeerStream(title);

  if (!livepeerStream) {
    return { error: "Failed to create live stream" };
  }

  const { data: liveStream, error } = await supabase
    .from("live_streams")
    .insert({
      channel_id: channel.id,
      title,
      description: description || null,
      stream_key: livepeerStream.streamKey,
      playback_id: livepeerStream.playbackId,
      external_stream_id: livepeerStream.id,
      status: "idle",
      rtmp_url: getRTMPIngestUrl(),
    })
    .select()
    .single();

  if (error) {
    await deleteLivepeerStream(livepeerStream.id);
    return { error: error.message };
  }

  revalidatePath("/studio");

  return { success: true, data: liveStream };
}

export async function updateLiveStream(
  liveStreamId: string,
  updates: {
    title?: string;
    description?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: liveStream } = await supabase
    .from("live_streams")
    .select("channel_id, channels!inner(user_id)")
    .eq("id", liveStreamId)
    .single();

  if (!liveStream) {
    return { error: "Live stream not found" };
  }

  const channels = Array.isArray(liveStream.channels)
    ? liveStream.channels[0]
    : liveStream.channels;

  if (channels?.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("live_streams")
    .update(updates)
    .eq("id", liveStreamId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/studio");

  return { success: true };
}

export async function endLiveStream(liveStreamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: liveStream } = await supabase
    .from("live_streams")
    .select(
      "id, external_stream_id, channel_id, title, description, channels!inner(user_id)"
    )
    .eq("id", liveStreamId)
    .single();

  if (!liveStream) {
    return { error: "Live stream not found" };
  }

  const channels = Array.isArray(liveStream.channels)
    ? liveStream.channels[0]
    : liveStream.channels;

  if (channels?.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("live_streams")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
    })
    .eq("id", liveStreamId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/studio");
  revalidatePath(`/live/${liveStreamId}`);

  return { success: true };
}

export async function deleteLiveStream(liveStreamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: liveStream } = await supabase
    .from("live_streams")
    .select("external_stream_id, channels!inner(user_id)")
    .eq("id", liveStreamId)
    .single();

  if (!liveStream) {
    return { error: "Live stream not found" };
  }

  const channels = Array.isArray(liveStream.channels)
    ? liveStream.channels[0]
    : liveStream.channels;

  if (channels?.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  if (liveStream.external_stream_id) {
    await deleteLivepeerStream(liveStream.external_stream_id);
  }

  const { error } = await supabase
    .from("live_streams")
    .delete()
    .eq("id", liveStreamId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/studio");

  return { success: true };
}

export async function sendChatMessage(
  liveStreamId: string,
  message: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  if (!message || message.trim().length === 0) {
    return { error: "Message cannot be empty" };
  }

  if (message.length > 500) {
    return { error: "Message too long (max 500 characters)" };
  }

  const { error } = await supabase.from("live_chat_messages").insert({
    live_stream_id: liveStreamId,
    user_id: user.id,
    message: message.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
