"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreVertical, Flag, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createComment,
  editComment,
  deleteComment,
  reportComment,
} from "@/lib/comments/actions";
import { validateContent } from "@/lib/profanity-filter";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  user_id: string;
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
  currentUserId?: string;
  currentUser?: {
    display_name: string;
    username: string;
    avatar_url?: string | null;
  } | null;
}

function CommentItem({
  comment,
  videoId,
  currentUserId,
  currentUser,
  isReply = false,
}: {
  comment: Comment;
  videoId: string;
  currentUserId?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

  if (comment.deleted_at) {
    return (
      <div className={isReply ? "ml-12" : ""}>
        <div className="rounded-lg bg-muted p-3 text-sm italic text-muted-foreground">
          [Comment deleted]
        </div>
      </div>
    );
  }

  const handleReply = async () => {
    if (!replyContent.trim() || !currentUser) return;

    const validation = validateContent(replyContent);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsSubmitting(true);
    const result = await createComment(videoId, replyContent, comment.id);

    if (result.error) {
      alert(result.error);
    } else {
      setReplyContent("");
      setShowReplyForm(false);
    }

    setIsSubmitting(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    const validation = validateContent(editContent);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsSubmitting(true);
    const result = await editComment(comment.id, editContent);

    if (result.error) {
      alert(result.error);
    } else {
      setIsEditing(false);
    }

    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsSubmitting(true);
    const result = await deleteComment(comment.id);

    if (result.error) {
      alert(result.error);
    }

    setIsSubmitting(false);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting");
      return;
    }

    setIsSubmitting(true);
    const result = await reportComment(comment.id, reportReason);

    if (result.error) {
      alert(result.error);
    } else {
      alert("Comment reported successfully");
      setShowReportDialog(false);
      setReportReason("");
    }

    setIsSubmitting(false);
  };

  const isOwner = currentUserId === comment.user_id;

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
          <div className="flex items-center justify-between">
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
              {comment.edited_at && (
                <span className="text-xs italic text-muted-foreground">
                  (edited)
                </span>
              )}
            </div>

            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={isSubmitting}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}

          {showReportDialog && (
            <div className="mt-2 space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Report comment</p>
              <Input
                placeholder="Reason for reporting..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReport} disabled={isSubmitting}>
                  Submit Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isReply && currentUser && !isEditing && (
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
              currentUserId={currentUserId}
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
  currentUserId,
  currentUser,
}: CommentsSectionProps) {
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commentContent.trim() || !currentUser) return;

    const validation = validateContent(commentContent);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsSubmitting(true);
    const result = await createComment(videoId, commentContent);

    if (result.error) {
      alert(result.error);
    } else {
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
            currentUserId={currentUserId}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}
