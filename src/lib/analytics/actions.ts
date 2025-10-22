"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackEvent(
  eventType: string,
  data: {
    videoId?: string;
    channelId?: string;
    metadata?: Record<string, any>;
    sessionId?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("analytics_events").insert({
    user_id: user?.id || null,
    session_id: data.sessionId || null,
    event_type: eventType,
    video_id: data.videoId || null,
    channel_id: data.channelId || null,
    metadata: data.metadata || {},
  });
}

export async function trackVideoView(videoId: string, sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: video } = await supabase
    .from("videos")
    .select("channel_id")
    .eq("id", videoId)
    .single();

  if (!video) return;

  await supabase.from("analytics_events").insert({
    user_id: user?.id || null,
    session_id: sessionId,
    event_type: "view",
    video_id: videoId,
    channel_id: video.channel_id,
    metadata: {},
  });

  await supabase.rpc("increment_view_count", { video_id: videoId });
}

export async function trackWatchTime(
  videoId: string,
  watchDuration: number,
  sessionId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: video } = await supabase
    .from("videos")
    .select("channel_id")
    .eq("id", videoId)
    .single();

  if (!video) return;

  await supabase.from("analytics_events").insert({
    user_id: user?.id || null,
    session_id: sessionId,
    event_type: "watch_time",
    video_id: videoId,
    channel_id: video.channel_id,
    metadata: { duration: watchDuration },
  });
}

export async function trackSearchQuery(query: string, resultsCount: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("search_queries").insert({
    user_id: user?.id || null,
    query: query.trim(),
    results_count: resultsCount,
  });
}

export async function trackVideoImpression(
  videoId: string,
  context: string,
  clicked: boolean = false
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("video_impressions").insert({
    video_id: videoId,
    user_id: user?.id || null,
    context,
    clicked,
  });
}
