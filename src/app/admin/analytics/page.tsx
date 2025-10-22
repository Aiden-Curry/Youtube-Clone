import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Video, TrendingUp } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const supabase = await createClient();

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!userData?.is_admin) {
    redirect("/");
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: dauUsers } = await supabase
    .from("analytics_events")
    .select("user_id")
    .gte("created_at", oneDayAgo.toISOString())
    .not("user_id", "is", null);

  const { data: wauUsers } = await supabase
    .from("analytics_events")
    .select("user_id")
    .gte("created_at", oneWeekAgo.toISOString())
    .not("user_id", "is", null);

  const { data: mauUsers } = await supabase
    .from("analytics_events")
    .select("user_id")
    .gte("created_at", oneMonthAgo.toISOString())
    .not("user_id", "is", null);

  const dau = new Set(dauUsers?.map((u) => u.user_id)).size;
  const wau = new Set(wauUsers?.map((u) => u.user_id)).size;
  const mau = new Set(mauUsers?.map((u) => u.user_id)).size;

  const { data: watchTimeEvents } = await supabase
    .from("analytics_events")
    .select("metadata")
    .eq("event_type", "watch_time")
    .gte("created_at", oneMonthAgo.toISOString());

  const totalWatchTime = watchTimeEvents?.reduce(
    (sum, event) => sum + (event.metadata?.duration || 0),
    0
  ) || 0;

  const totalWatchHours = Math.floor(totalWatchTime / 3600);

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  }).reverse();

  const { data: videosByDay } = await supabase
    .from("videos")
    .select("created_at")
    .gte("created_at", oneMonthAgo.toISOString());

  const uploadsByDay: Record<string, number> = {};
  videosByDay?.forEach((video) => {
    const date = new Date(video.created_at);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toLocaleDateString();
    uploadsByDay[dateStr] = (uploadsByDay[dateStr] || 0) + 1;
  });

  const last7Days = last30Days.slice(-7);
  const dailyUploads = last7Days.map((date) => ({
    date: date.toLocaleDateString(),
    uploads: uploadsByDay[date.toLocaleDateString()] || 0,
  }));

  const maxUploads = Math.max(...dailyUploads.map((d) => d.uploads), 1);

  const avgUploadsPerDay =
    (videosByDay?.length || 0) / 30;

  const { data: topSearches } = await supabase
    .from("search_queries")
    .select("query")
    .gte("created_at", oneWeekAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(100);

  const searchCounts: Record<string, number> = {};
  topSearches?.forEach((s) => {
    const query = s.query.toLowerCase();
    searchCounts[query] = (searchCounts[query] || 0) + 1;
  });

  const topQueries = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Site-wide metrics and insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Watch Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalWatchHours.toLocaleString()}h
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Uploads per Day (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyUploads.map((day) => (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{day.date}</span>
                    <span className="font-medium">{day.uploads} uploads</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(day.uploads / maxUploads) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 rounded-lg bg-muted p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Average: {avgUploadsPerDay.toFixed(1)} uploads/day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {topQueries.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No searches yet
              </p>
            ) : (
              <div className="space-y-3">
                {topQueries.map((query, index) => (
                  <div
                    key={query.query}
                    className="flex items-center gap-3 rounded-lg p-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{query.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {query.count} {query.count === 1 ? "search" : "searches"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
