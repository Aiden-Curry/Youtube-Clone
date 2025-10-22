"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Film } from "lucide-react";

interface TranscodeProgressProps {
  status: string;
  currentRendition?: number;
  totalRenditions?: number;
  isComplete: boolean;
}

export function TranscodeProgress({
  status,
  currentRendition,
  totalRenditions,
  isComplete,
}: TranscodeProgressProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {isComplete ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            <div className="flex-1">
              <p className="font-medium">
                {isComplete ? "Transcoding Complete" : "Processing Video"}
              </p>
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
          </div>

          {currentRendition && totalRenditions && !isComplete && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Rendition {currentRendition} of {totalRenditions}
                </span>
                <span className="font-medium">
                  {Math.round((currentRendition / totalRenditions) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(currentRendition / totalRenditions) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <div className="flex items-start gap-3">
              <Film className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 space-y-1 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Generating HLS Stream
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Your video is being transcoded into multiple quality levels
                  (240p, 480p, 720p) for optimal streaming performance.
                </p>
              </div>
            </div>
          </div>

          {isComplete && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
              <p className="font-medium">Video ready for publishing!</p>
              <p className="mt-1 text-green-700 dark:text-green-300">
                Your video has been successfully processed and is ready to be
                published.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
