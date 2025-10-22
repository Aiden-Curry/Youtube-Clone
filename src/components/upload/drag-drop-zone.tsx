"use client";

import { useCallback, useState } from "react";
import { Upload, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function DragDropZone({ onFileSelect, disabled }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const videoFile = files.find((file) => file.type.startsWith("video/"));

      if (videoFile) {
        onFileSelect(videoFile);
      }
    },
    [onFileSelect, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("video/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      <div className="flex flex-col items-center gap-4 text-center">
        {isDragging ? (
          <>
            <FileVideo className="h-16 w-16 text-primary" />
            <div>
              <p className="text-lg font-semibold">Drop your video here</p>
              <p className="text-sm text-muted-foreground">
                Release to start uploading
              </p>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-16 w-16 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">
                Drag and drop video file to upload
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-muted px-4 py-2 text-sm">
              <p className="font-medium">Supported formats:</p>
              <p className="text-muted-foreground">
                MP4, WebM, QuickTime, AVI, MKV
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Maximum file size: 5GB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
