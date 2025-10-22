import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play } from "lucide-react";

interface UpNextVideo {
  id: string;
  title: string;
  poster_url: string | null;
  view_count: number;
  published_at: string;
  duration_seconds: number;
  channel: {
    name: string;
    handle: string;
  };
}

interface UpNextProps {
  videos: UpNextVideo[];
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function UpNext({ videos }: UpNextProps) {
  if (videos.length === 0) {
    return (
      <div className="rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">
        No recommended videos available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Up Next</h2>

      <div className="space-y-3">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="group flex gap-3 rounded-lg transition-colors hover:bg-secondary/50"
          >
            <div className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              {video.poster_url ? (
                <img
                  src={video.poster_url}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
                {formatDuration(video.duration_seconds)}
              </div>
            </div>

            <div className="flex-1 space-y-1 py-1">
              <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">
                {video.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {video.channel.name}
              </p>
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
    </div>
  );
}
