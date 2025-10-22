"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pause, Play, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  bytesUploaded: number;
  bytesTotal: number;
  isUploading: boolean;
  isPaused: boolean;
  isComplete: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export function UploadProgress({
  fileName,
  progress,
  bytesUploaded,
  bytesTotal,
  isUploading,
  isPaused,
  isComplete,
  onPause,
  onResume,
  onCancel,
}: UploadProgressProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(bytesUploaded)} of {formatBytes(bytesTotal)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isComplete ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              ) : (
                <>
                  {isPaused ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onResume}
                      title="Resume upload"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onPause}
                      disabled={!isUploading}
                      title="Pause upload"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onCancel}
                    title="Cancel upload"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isPaused ? "Paused" : isComplete ? "Complete" : "Uploading..."}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isComplete
                    ? "bg-green-600"
                    : isPaused
                      ? "bg-orange-500"
                      : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {isPaused && (
            <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-900 dark:bg-orange-950 dark:text-orange-100">
              Upload paused. Click resume to continue.
            </div>
          )}

          {isComplete && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
              Upload completed successfully! Add video details below.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
