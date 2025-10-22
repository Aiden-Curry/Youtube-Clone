import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import { CommentModeration } from "@/components/studio/comment-moderation";

export default async function VideoCommentsPage({
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

  const { data: commentsData } = await supabase
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      parent_id,
      user:users!inner(
        display_name,
        username,
        avatar_url
      )
    `
    )
    .eq("video_id", id)
    .order("created_at", { ascending: false });

  const comments = (commentsData || []).map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    parent_id: comment.parent_id,
    user: Array.isArray(comment.user) ? comment.user[0] : comment.user,
  }));

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Comments Moderation</h1>
        <p className="text-muted-foreground">{video.title}</p>
      </div>

      <CommentModeration comments={comments} videoId={video.id} />
    </div>
  );
}
