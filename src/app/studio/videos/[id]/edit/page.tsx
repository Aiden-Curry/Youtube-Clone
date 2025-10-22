import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import { VideoEditForm } from "@/components/studio/video-edit-form";

export default async function VideoEditPage({
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
      description,
      tags,
      visibility,
      status,
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

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Video</h1>
        <p className="text-muted-foreground">Update your video details</p>
      </div>

      <VideoEditForm
        videoId={video.id}
        initialData={{
          title: video.title,
          description: video.description || "",
          tags: video.tags || [],
          visibility: video.visibility,
        }}
      />
    </div>
  );
}
