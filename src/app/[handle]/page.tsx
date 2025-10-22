import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSubscribe } from "@/lib/watch/actions";

async function ChannelPageClient({
  channel,
  isSubscribed,
  currentUser,
}: {
  channel: any;
  isSubscribed: boolean;
  currentUser: any;
}) {
  return (
    <div>
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
        {channel.banner_url && (
          <img
            src={channel.banner_url}
            alt={channel.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="container">
        <div className="flex flex-col gap-6 py-6 md:flex-row md:items-start">
          <div className="flex-shrink-0">
            {channel.user.avatar_url ? (
              <img
                src={channel.user.avatar_url}
                alt={channel.name}
                className="h-32 w-32 rounded-full border-4 border-background object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground">
                {channel.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{channel.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{channel.handle}</span>
              <span>•</span>
              <span>
                {channel.subscriber_count.toLocaleString()}{" "}
                {channel.subscriber_count === 1 ? "subscriber" : "subscribers"}
              </span>
              <span>•</span>
              <span>
                {channel.video_count.toLocaleString()}{" "}
                {channel.video_count === 1 ? "video" : "videos"}
              </span>
            </div>
            {channel.description && (
              <p className="mt-4 text-sm">{channel.description}</p>
            )}
          </div>

          {currentUser && (
            <div className="flex-shrink-0">
              <form
                action={async () => {
                  "use server";
                  await toggleSubscribe(channel.id);
                }}
              >
                <Button
                  type="submit"
                  variant={isSubscribed ? "outline" : "default"}
                  size="lg"
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </form>
            </div>
          )}
        </div>

        <div className="border-b">
          <div className="flex gap-6">
            <Link
              href={`/@${channel.handle}`}
              className="border-b-2 border-primary px-4 py-3 font-semibold"
            >
              Videos
            </Link>
            <Link
              href={`/@${channel.handle}/live`}
              className="px-4 py-3 text-muted-foreground hover:text-foreground"
            >
              Live
            </Link>
            <Link
              href={`/@${channel.handle}/about`}
              className="px-4 py-3 text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { handle } = await params;
  const { tab = "videos" } = await searchParams;

  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: channel } = await supabase
    .from("channels")
    .select(
      `
      id,
      name,
      handle,
      description,
      banner_url,
      subscriber_count,
      user:users!inner(
        avatar_url
      )
    `
    )
    .eq("handle", `@${cleanHandle}`)
    .single();

  if (!channel) {
    notFound();
  }

  const { count: videoCount } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("channel_id", channel.id)
    .eq("status", "public");

  const { data: videos } = await supabase
    .from("videos")
    .select(
      `
      id,
      title,
      poster_url,
      view_count,
      published_at,
      duration_seconds
    `
    )
    .eq("channel_id", channel.id)
    .eq("status", "public")
    .order("published_at", { ascending: false })
    .limit(24);

  let isSubscribed = false;
  if (currentUser) {
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("channel_id", channel.id)
      .eq("subscriber_id", currentUser.id)
      .maybeSingle();

    isSubscribed = !!subscriptionData;
  }

  const userData = Array.isArray(channel.user) ? channel.user[0] : channel.user;

  const channelData = {
    ...channel,
    video_count: videoCount || 0,
    user: userData,
  };

  return (
    <div>
      <ChannelPageClient
        channel={channelData}
        isSubscribed={isSubscribed}
        currentUser={currentUser}
      />

      <div className="container py-8">
        {tab === "videos" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos?.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group space-y-3"
              >
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  {video.poster_url ? (
                    <img
                      src={video.poster_url}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                    {Math.floor(video.duration_seconds / 60)}:
                    {(video.duration_seconds % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{video.view_count.toLocaleString()} views</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(video.published_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "live" && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium">No live streams</p>
            <p className="text-sm text-muted-foreground">
              This channel is not currently live
            </p>
          </div>
        )}

        {tab === "about" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground">
                {channelData.description || "No description provided"}
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold">Stats</h2>
              <div className="space-y-1 text-sm">
                <p>
                  {channelData.subscriber_count.toLocaleString()} subscribers
                </p>
                <p>{channelData.video_count.toLocaleString()} videos</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
