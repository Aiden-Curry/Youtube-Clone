import { getCurrentUserWithChannel } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Link as LinkIcon, Copy } from "lucide-react";
import { LiveStreamControls } from "@/components/studio/live-stream-controls";

export default async function LiveStreamManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUserWithChannel();
  const channel = user?.channels?.[0];

  if (!channel) {
    redirect("/auth/setup");
  }

  const supabase = await createClient();

  const { data: liveStream } = await supabase
    .from("live_streams")
    .select("*")
    .eq("id", id)
    .eq("channel_id", channel.id)
    .single();

  if (!liveStream) {
    redirect("/studio/live");
  }

  const rtmpUrl = liveStream.rtmp_url || "rtmp://rtmp.livepeer.com/live";
  const streamKey = liveStream.stream_key;
  const playbackUrl = `https://livepeer.studio/hls/${liveStream.playback_id}/index.m3u8`;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{liveStream.title}</h1>
        <p className="text-muted-foreground">
          Status:{" "}
          <span
            className={
              liveStream.status === "live"
                ? "font-semibold text-red-600"
                : liveStream.status === "ended"
                  ? "text-muted-foreground"
                  : "text-yellow-600"
            }
          >
            {liveStream.status === "live"
              ? "Live Now"
              : liveStream.status === "ended"
                ? "Ended"
                : "Ready to Start"}
          </span>
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stream Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <LiveStreamControls
              liveStreamId={liveStream.id}
              status={liveStream.status}
            />
          </CardContent>
        </Card>

        {liveStream.status !== "ended" && (
          <Card>
            <CardHeader>
              <CardTitle>RTMP Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">RTMP URL</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={rtmpUrl}
                    readOnly
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(rtmpUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Stream Key</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="password"
                    value={streamKey}
                    readOnly
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(streamKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep this private! Use it in your streaming software (OBS,
                  Streamlabs, etc.)
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-2 font-semibold">Quick Setup Guide</h4>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Open OBS Studio or your streaming software</li>
                  <li>Go to Settings → Stream</li>
                  <li>Select "Custom" as the service</li>
                  <li>Paste the RTMP URL in the Server field</li>
                  <li>Paste the Stream Key in the Stream Key field</li>
                  <li>Click "Start Streaming" to go live!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {liveStream.status === "live" && (
          <Card>
            <CardHeader>
              <CardTitle>Share Your Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/live/${liveStream.id}`}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/live/${liveStream.id}`
                    )
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
