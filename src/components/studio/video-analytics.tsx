"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ThumbsUp, MessageSquare, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface VideoAnalyticsProps {
  videoId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: number;
  viewsOverTime: Array<{ created_at: string }>;
  retentionData: Array<{ last_position: number; watch_duration: number }>;
}

export function VideoAnalytics({
  videoId,
  viewCount,
  likeCount,
  commentCount,
  duration,
  viewsOverTime,
  retentionData,
}: VideoAnalyticsProps) {
  const viewsByDay = useMemo(() => {
    const grouped: Record<string, number> = {};

    viewsOverTime.forEach((view) => {
      const date = new Date(view.created_at).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7);
  }, [viewsOverTime]);

  const retentionCurve = useMemo(() => {
    if (duration === 0 || retentionData.length === 0) return [];

    const bucketSize = Math.ceil(duration / 10);
    const buckets = Array(10).fill(0);
    const counts = Array(10).fill(0);

    retentionData.forEach((record) => {
      const bucketIndex = Math.min(
        Math.floor(record.last_position / bucketSize),
        9
      );
      buckets[bucketIndex]++;
      counts[bucketIndex]++;
    });

    return buckets.map((count, index) => ({
      position: `${index * 10}%`,
      percentage: counts[index] > 0 ? (count / retentionData.length) * 100 : 0,
    }));
  }, [retentionData, duration]);

  const engagementRate =
    viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;

  const maxViewsInDay = Math.max(...viewsByDay.map(([, count]) => count), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{likeCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total likes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {commentCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total comments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Likes + comments per view
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Views Over Time (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {viewsByDay.length > 0 ? (
            <div className="space-y-4">
              {viewsByDay.map(([date, count]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{date}</span>
                    <span className="font-medium">{count} views</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(count / maxViewsInDay) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No view data available yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audience Retention</CardTitle>
        </CardHeader>
        <CardContent>
          {retentionCurve.length > 0 && retentionData.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Percentage of viewers at each point in the video
              </p>
              {retentionCurve.map((point, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {point.position}
                    </span>
                    <span className="font-medium">
                      {point.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${point.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No retention data available yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
