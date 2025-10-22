import { getCurrentUserWithChannel } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, ThumbsUp, TrendingUp, Video } from "lucide-react";
import Link from "next/link";

export default async function StudioAnalyticsPage() {
  const user = await getCurrentUserWithChannel();
  const channel = user?.channels?.[0];

  if (!channel) {
    redirect("/auth/setup");
  }

  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, view_count, created_at")
    .eq("channel_id", channel.id)
    .order("view_count", { ascending: false })
    .limit(10);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: viewEvents } = await supabase
    .from("analytics_events")
    .select("created_at")
    .eq("channel_id", channel.id)
    .eq("event_type", "view")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const { data: watchTimeEvents } = await supabase
    .from("analytics_events")
    .select("metadata")
    .eq("channel_id", channel.id)
    .eq("event_type", "watch_time")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const totalWatchTime = watchTimeEvents?.reduce(
    (sum, event) => sum + (event.metadata?.duration || 0),
    0
  ) || 0;

  const avgWatchDuration = watchTimeEvents?.length
    ? totalWatchTime / watchTimeEvents.length
    : 0;

  const { data: impressions } = await supabase
    .from("video_impressions")
    .select("clicked")
    .in(
      "video_id",
      videos?.map((v) => v.id) || []
    )
    .gte("created_at", thirtyDaysAgo.toISOString());

  const totalImpressions = impressions?.length || 0;
  const totalClicks = impressions?.filter((i) => i.clicked).length || 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const viewsByDay: Record<string, number> = {};
  viewEvents?.forEach((event) => {
    const date = new Date(event.created_at).toLocaleDateString();
    viewsByDay[date] = (viewsByDay[date] || 0) + 1;
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString();
  }).reverse();

  const dailyViews = last7Days.map((date) => ({
    date,
    views: viewsByDay[date] || 0,
  }));

  const maxViews = Math.max(...dailyViews.map((d) => d.views), 1);

  const { count: totalViews } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("channel_id", channel.id)
    .eq("event_type", "view")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const { count: totalLikes } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .in(
      "video_id",
      videos?.map((v) => v.id) || []
    )
    .gte("created_at", thirtyDaysAgo.toISOString());

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Channel Analytics</h1>
        <p className="text-muted-foreground">Last 30 days</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Watch Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(avgWatchDuration / 60)}:
              {Math.floor(avgWatchDuration % 60)
                .toString()
                .padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              Minutes per view
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Click-Through Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalImpressions.toLocaleString()} impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalLikes?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Daily Views (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyViews.map((day) => (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{day.date}</span>
                  <span className="font-medium">{day.views} views</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(day.views / maxViews) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {!videos || videos.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No videos yet
            </p>
          ) : (
            <div className="space-y-3">
              {videos.map((video, index) => (
                <Link
                  key={video.id}
                  href={`/studio/videos/${video.id}/analytics`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {video.view_count.toLocaleString()} views
                    </p>
                  </div>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
