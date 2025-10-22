import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LiveStreamPlayer } from "@/components/live/live-stream-player";
import { LiveChat } from "@/components/live/live-chat";
import { getCurrentUser } from "@/lib/auth/helpers";

export default async function LiveStreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: liveStream } = await supabase
    .from("live_streams")
    .select(
      `
      *,
      channels (
        id,
        name,
        handle,
        avatar_url,
        users (
          username,
          display_name,
          avatar_url
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (!liveStream) {
    notFound();
  }

  const channel = Array.isArray(liveStream.channels)
    ? liveStream.channels[0]
    : liveStream.channels;
  const channelUser = channel?.users
    ? Array.isArray(channel.users)
      ? channel.users[0]
      : channel.users
    : null;

  const playbackUrl = `https://livepeer.studio/hls/${liveStream.playback_id}/index.m3u8`;

  const { data: chatMessages } = await supabase
    .from("live_chat_messages")
    .select(
      `
      id,
      message,
      created_at,
      user:users!live_chat_messages_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq("live_stream_id", id)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <LiveStreamPlayer
              hlsUrl={playbackUrl}
              status={liveStream.status}
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {liveStream.status === "live" && (
                  <span className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    LIVE
                  </span>
                )}
                {liveStream.status === "ended" && (
                  <span className="rounded bg-gray-600 px-2 py-1 text-xs font-bold text-white">
                    ENDED
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{liveStream.title}</h1>
              {liveStream.description && (
                <p className="text-muted-foreground">{liveStream.description}</p>
              )}
            </div>

            {channel && (
              <div className="flex items-center gap-3 rounded-lg border p-4">
                {channel.avatar_url ? (
                  <img
                    src={channel.avatar_url}
                    alt={channel.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {channel.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{channel.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    @{channel.handle}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <LiveChat
            liveStreamId={id}
            initialMessages={chatMessages || []}
            currentUser={currentUser}
            isLive={liveStream.status === "live"}
          />
        </div>
      </div>
    </div>
  );
}
