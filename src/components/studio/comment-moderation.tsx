"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteComment } from "@/lib/studio/actions";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  user: {
    display_name: string;
    username: string;
    avatar_url?: string | null;
  };
}

interface CommentModerationProps {
  comments: Comment[];
  videoId: string;
}

export function CommentModeration({
  comments,
  videoId,
}: CommentModerationProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setDeletingId(commentId);
    await deleteComment(commentId);
    setDeletingId(null);
  };

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parent_id === commentId);

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium">No comments yet</p>
        <p className="text-sm text-muted-foreground">
          Comments will appear here when viewers leave them
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </p>
      </div>

      {topLevelComments.map((comment) => {
        const userData = Array.isArray(comment.user)
          ? comment.user[0]
          : comment.user;
        const replies = getReplies(comment.id);

        return (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    {userData.avatar_url ? (
                      <img
                        src={userData.avatar_url}
                        alt={userData.display_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {userData.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {userData.display_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @{userData.username}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {replies.length > 0 && (
                  <div className="ml-12 space-y-3 border-l-2 pl-4">
                    {replies.map((reply) => {
                      const replyUserData = Array.isArray(reply.user)
                        ? reply.user[0]
                        : reply.user;

                      return (
                        <div
                          key={reply.id}
                          className="flex items-start justify-between gap-4"
                        >
                          <div className="flex gap-3">
                            {replyUserData.avatar_url ? (
                              <img
                                src={replyUserData.avatar_url}
                                alt={replyUserData.display_name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                {replyUserData.display_name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                  {replyUserData.display_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  @{replyUserData.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(reply.created_at),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>
                              <p className="mt-1 text-sm">{reply.content}</p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(reply.id)}
                            disabled={deletingId === reply.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
