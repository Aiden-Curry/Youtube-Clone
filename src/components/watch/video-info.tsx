"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLike } from "@/lib/watch/actions";

interface VideoInfoProps {
  video: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    view_count: number;
    published_at: string;
    like_count: number;
    is_liked: boolean;
  };
}

export function VideoInfo({ video }: VideoInfoProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(video.is_liked);
  const [likeCount, setLikeCount] = useState(video.like_count);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    await toggleLike(video.id);
  };

  const description = video.description || "No description";
  const shouldTruncate = description.length > 200;
  const displayDescription =
    shouldTruncate && !showFullDescription
      ? description.slice(0, 200) + "..."
      : description;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{video.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>{video.view_count.toLocaleString()} views</span>
        </div>
        <span>
          {formatDistanceToNow(new Date(video.published_at), {
            addSuffix: true,
          })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={isLiked ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          className="gap-2"
        >
          <ThumbsUp className="h-4 w-4" />
          {likeCount > 0 && <span>{likeCount.toLocaleString()}</span>}
        </Button>
      </div>

      {video.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-secondary/50 p-4">
        <p className="whitespace-pre-wrap text-sm">{displayDescription}</p>
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="mt-2 gap-1"
          >
            {showFullDescription ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
