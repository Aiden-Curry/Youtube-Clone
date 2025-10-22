"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { validateContent } from "@/lib/profanity-filter";

export async function createComment(videoId: string, content: string, parentId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const validation = validateContent(content);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      video_id: videoId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/watch/${videoId}`);

  return { success: true, data };
}

export async function editComment(commentId: string, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const validation = validateContent(content);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const { data: comment } = await supabase
    .from("comments")
    .select("user_id, video_id")
    .eq("id", commentId)
    .single();

  if (!comment) {
    return { error: "Comment not found" };
  }

  if (comment.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("comments")
    .update({
      content: content.trim(),
      edited_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/watch/${comment.video_id}`);

  return { success: true };
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
    .select("user_id, video_id")
    .eq("id", commentId)
    .single();

  if (!comment) {
    return { error: "Comment not found" };
  }

  if (comment.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("comments")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/watch/${comment.video_id}`);

  return { success: true };
}

export async function reportComment(commentId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  if (!reason || reason.trim().length === 0) {
    return { error: "Reason is required" };
  }

  const { data: existingReport } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("comment_id", commentId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingReport) {
    return { error: "You have already reported this comment" };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    comment_id: commentId,
    reason: reason.trim(),
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function reportVideo(videoId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  if (!reason || reason.trim().length === 0) {
    return { error: "Reason is required" };
  }

  const { data: existingReport } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("video_id", videoId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingReport) {
    return { error: "You have already reported this video" };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    video_id: videoId,
    reason: reason.trim(),
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
