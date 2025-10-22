"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  return data?.is_admin === true;
}

export async function reviewReport(
  reportId: string,
  action: "approve" | "reject",
  actionTaken?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("reports")
    .update({
      status: action === "approve" ? "resolved" : "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      action_taken: actionTaken || null,
    })
    .eq("id", reportId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: `report_${action}`,
    target_type: "report",
    target_id: reportId,
    details: { action_taken: actionTaken },
  });

  revalidatePath("/admin");

  return { success: true };
}

export async function hideVideo(videoId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("videos")
    .update({
      visibility: "private",
      status: "private",
    })
    .eq("id", videoId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: "hide_video",
    target_type: "video",
    target_id: videoId,
    details: { reason },
  });

  revalidatePath("/admin");
  revalidatePath(`/watch/${videoId}`);

  return { success: true };
}

export async function hideComment(commentId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return { error: "Unauthorized" };
  }

  const { data: comment } = await supabase
    .from("comments")
    .select("video_id")
    .eq("id", commentId)
    .single();

  const { error } = await supabase
    .from("comments")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: "hide_comment",
    target_type: "comment",
    target_id: commentId,
    details: { reason },
  });

  revalidatePath("/admin");
  if (comment) {
    revalidatePath(`/watch/${comment.video_id}`);
  }

  return { success: true };
}

export async function warnUser(userId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return { error: "Unauthorized" };
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "warning",
    title: "Community Guidelines Warning",
    message: reason,
    link: "/settings",
  });

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: "warn_user",
    target_type: "user",
    target_id: userId,
    details: { reason },
  });

  revalidatePath("/admin");

  return { success: true };
}
