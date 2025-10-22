"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  reviewReport,
  hideVideo,
  hideComment,
  warnUser,
} from "@/lib/admin/actions";
import { Check, X, EyeOff, AlertTriangle } from "lucide-react";

interface ReportActionsProps {
  reportId: string;
  videoId?: string;
  commentId?: string;
}

export function ReportActions({
  reportId,
  videoId,
  commentId,
}: ReportActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActionInput, setShowActionInput] = useState(false);
  const [actionType, setActionType] = useState<
    "hide_video" | "hide_comment" | "warn" | null
  >(null);
  const [actionReason, setActionReason] = useState("");

  const handleReject = async () => {
    setIsProcessing(true);
    await reviewReport(reportId, "reject");
    setIsProcessing(false);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    await reviewReport(reportId, "approve");
    setIsProcessing(false);
  };

  const handleAction = async () => {
    if (!actionReason.trim()) {
      alert("Please provide a reason");
      return;
    }

    setIsProcessing(true);

    if (actionType === "hide_video" && videoId) {
      await hideVideo(videoId, actionReason);
      await reviewReport(reportId, "approve", "Video hidden");
    } else if (actionType === "hide_comment" && commentId) {
      await hideComment(commentId, actionReason);
      await reviewReport(reportId, "approve", "Comment hidden");
    }

    setIsProcessing(false);
    setShowActionInput(false);
    setActionType(null);
    setActionReason("");
  };

  return (
    <div className="space-y-3">
      {!showActionInput ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={isProcessing}
          >
            <X className="mr-1 h-4 w-4" />
            Reject
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={isProcessing}
          >
            <Check className="mr-1 h-4 w-4" />
            Approve (No Action)
          </Button>

          {videoId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowActionInput(true);
                setActionType("hide_video");
              }}
              disabled={isProcessing}
            >
              <EyeOff className="mr-1 h-4 w-4" />
              Hide Video
            </Button>
          )}

          {commentId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowActionInput(true);
                setActionType("hide_comment");
              }}
              disabled={isProcessing}
            >
              <EyeOff className="mr-1 h-4 w-4" />
              Hide Comment
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Reason for action..."
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            disabled={isProcessing}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAction}
              disabled={isProcessing}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowActionInput(false);
                setActionType(null);
                setActionReason("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
