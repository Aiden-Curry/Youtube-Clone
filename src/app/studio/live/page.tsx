import { getCurrentUserWithChannel } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Radio, Calendar } from "lucide-react";

export default async function StudioLivePage() {
  const user = await getCurrentUserWithChannel();
  const channel = user?.channels?.[0];

  if (!channel) {
    redirect("/auth/setup");
  }

  const supabase = await createClient();

  const { data: liveStreams } = await supabase
    .from("live_streams")
    .select("*")
    .eq("channel_id", channel.id)
    .order("created_at", { ascending: false });

  const activeLiveStream = liveStreams?.find((ls) => ls.status === "live");
  const scheduledStreams = liveStreams?.filter((ls) => ls.status === "idle");
  const pastStreams = liveStreams?.filter((ls) => ls.status === "ended");

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Streaming</h1>
          <p className="text-muted-foreground">
            Manage your live streams and go live
          </p>
        </div>
        <Link href="/studio/live/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Stream
          </Button>
        </Link>
      </div>

      {activeLiveStream && (
        <Card className="mb-6 border-red-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <CardTitle className="text-red-600">Live Now</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                {activeLiveStream.title}
              </h3>
              {activeLiveStream.description && (
                <p className="text-sm text-muted-foreground">
                  {activeLiveStream.description}
                </p>
              )}
              <div className="flex gap-2">
                <Link href={`/live/${activeLiveStream.id}`}>
                  <Button variant="outline" size="sm">
                    View Stream
                  </Button>
                </Link>
                <Link href={`/studio/live/${activeLiveStream.id}`}>
                  <Button size="sm">Manage</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Scheduled Streams ({scheduledStreams?.length || 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!scheduledStreams || scheduledStreams.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No scheduled streams
            </p>
          ) : (
            <div className="space-y-3">
              {scheduledStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{stream.title}</h3>
                    {stream.description && (
                      <p className="text-sm text-muted-foreground">
                        {stream.description}
                      </p>
                    )}
                  </div>
                  <Link href={`/studio/live/${stream.id}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            <CardTitle>Past Streams ({pastStreams?.length || 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!pastStreams || pastStreams.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No past streams
            </p>
          ) : (
            <div className="space-y-3">
              {pastStreams.slice(0, 5).map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Ended{" "}
                      {stream.ended_at
                        ? new Date(stream.ended_at).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <Link href={`/studio/live/${stream.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
