"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postComment } from "@/lib/watch/actions";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    display_name: string;
    username: string;
    avatar_url?: string | null;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  videoId: string;
  comments: Comment[];
  currentUser?: {
    display_name: string;
    username: string;
    avatar_url?: string | null;
  } | null;
}

function CommentItem({
  comment,
  videoId,
  currentUser,
  isReply = false,
}: {
  comment: Comment;
  videoId: string;
  currentUser?: {
    display_name: string;
    username: string;
    avatar_url?: string | null;
  } | null;
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    const result = await postComment(videoId, replyContent, comment.id);

    if (!result.error) {
      setReplyContent("");
      setShowReplyForm(false);
    }

    setIsSubmitting(false);
  };

  return (
    <div className={isReply ? "ml-12" : ""}>
      <div className="flex gap-3">
        {comment.user.avatar_url ? (
          <img
            src={comment.user.avatar_url}
            alt={comment.user.display_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {comment.user.display_name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {comment.user.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              @{comment.user.username}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>

          {!isReply && currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-auto p-0 text-xs"
            >
              Reply
            </Button>
          )}

          {showReplyForm && currentUser && (
            <div className="mt-2 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Add a reply..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? "Replying..." : "Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              videoId={videoId}
              currentUser={currentUser}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({
  videoId,
  comments,
  currentUser,
}: CommentsSectionProps) {
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commentContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    const result = await postComment(videoId, commentContent);

    if (!result.error) {
      setCommentContent("");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      {currentUser ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.display_name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {currentUser.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!commentContent.trim() || isSubmitting}
            >
              {isSubmitting ? "Commenting..." : "Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
          Sign in to leave a comment
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            videoId={videoId}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}
