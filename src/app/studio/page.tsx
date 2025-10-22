import { getCurrentUserWithChannel } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, BarChart, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { StudioVideoList } from "@/components/studio/video-list";

export default async function StudioPage() {
  const user = await getCurrentUserWithChannel();
  const channel = user?.channels?.[0];

  if (!channel) {
    return (
      <div className="container py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">No Channel Found</h1>
          <p className="mt-2 text-muted-foreground">
            You need to set up a channel first
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select(
      `
      id,
      title,
      poster_url,
      view_count,
      status,
      visibility,
      published_at,
      duration_seconds,
      created_at
    `
    )
    .eq("channel_id", channel.id)
    .order("created_at", { ascending: false });

  const { count: totalVideos } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("channel_id", channel.id);

  const { data: totalViewsData } = await supabase
    .from("videos")
    .select("view_count")
    .eq("channel_id", channel.id);

  const totalViews =
    totalViewsData?.reduce((sum, v) => sum + v.view_count, 0) || 0;

  const { count: totalLikes } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .in(
      "video_id",
      videos?.map((v) => v.id) || []
    );

  const engagementRate =
    totalViews > 0 ? ((totalLikes || 0) / totalViews) * 100 : 0;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Channel Studio</h1>
        <p className="text-muted-foreground">
          Manage your channel: {channel.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVideos?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalVideos === 0 ? "Start uploading" : "Published videos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {channel.subscriber_count.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {channel.subscriber_count === 1 ? "subscriber" : "subscribers"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Likes per view ratio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Videos</h2>
        <Link
          href="/upload"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Upload Video
        </Link>
      </div>

      <div className="mt-6">
        <StudioVideoList videos={videos || []} channelId={channel.id} />
      </div>
    </div>
  );
}
