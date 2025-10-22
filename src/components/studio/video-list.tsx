"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, Edit, Trash2, Eye, ThumbsUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteVideo } from "@/lib/studio/actions";

interface Video {
  id: string;
  title: string;
  poster_url: string | null;
  view_count: number;
  status: string;
  visibility: string;
  published_at: string | null;
  duration_seconds: number;
  created_at: string;
}

interface StudioVideoListProps {
  videos: Video[];
  channelId: string;
}

export function StudioVideoList({ videos, channelId }: StudioVideoListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    setDeletingId(videoId);
    await deleteVideo(videoId);
    setDeletingId(null);
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Play className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium">No videos yet</p>
        <p className="text-sm text-muted-foreground">
          Upload your first video to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/50"
        >
          <Link
            href={`/watch/${video.id}`}
            className="relative aspect-video w-48 flex-shrink-0 overflow-hidden rounded-md bg-muted"
          >
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
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
              {Math.floor(video.duration_seconds / 60)}:
              {(video.duration_seconds % 60).toString().padStart(2, "0")}
            </div>
          </Link>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Link
                href={`/watch/${video.id}`}
                className="font-semibold hover:text-primary"
              >
                {video.title}
              </Link>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    video.status === "public"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : video.status === "processing"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  {video.status}
                </span>
                <span className="capitalize">{video.visibility}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.view_count.toLocaleString()}</span>
                </div>
                <span>
                  {video.published_at
                    ? formatDistanceToNow(new Date(video.published_at), {
                        addSuffix: true,
                      })
                    : "Not published"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/studio/videos/${video.id}/analytics`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/studio/videos/${video.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                  disabled={deletingId === video.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
