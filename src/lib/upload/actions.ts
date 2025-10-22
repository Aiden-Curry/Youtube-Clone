"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateVideoData {
  title: string;
  description: string;
  tags: string[];
  visibility: "public" | "private" | "unlisted";
  storagePath: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  ageRestricted?: boolean;
}

export async function createVideoRecord(data: CreateVideoData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!userProfile) {
    return { error: "User profile not found" };
  }

  const { data: channel } = await supabase
    .from("channels")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!channel) {
    return { error: "Channel not found" };
  }

  const { data: video, error } = await supabase
    .from("videos")
    .insert({
      channel_id: channel.id,
      title: data.title,
      description: data.description,
      tags: data.tags,
      visibility: data.visibility,
      status: "processing",
      original_url: data.storagePath,
      duration_seconds: 0,
      age_restricted: data.ageRestricted || false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const { error: assetError } = await supabase.from("video_assets").insert({
    video_id: video.id,
    type: "source",
    url: data.storagePath,
  });

  if (assetError) {
    console.error("Failed to create video asset:", assetError);
  }

  revalidatePath("/studio");
  revalidatePath("/");

  return { success: true, videoId: video.id };
}

export async function getUploadToken() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Not authenticated" };
  }

  return { token: session.access_token };
}

export async function updateVideoAfterTranscode(
  videoId: string,
  hlsMasterUrl: string,
  posterUrl: string,
  durationSeconds: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("videos")
    .update({
      hls_master_url: hlsMasterUrl,
      poster_url: posterUrl,
      duration_seconds: durationSeconds,
      status: "public",
      published_at: new Date().toISOString(),
    })
    .eq("id", videoId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/studio");
  revalidatePath("/");

  return { success: true };
}
