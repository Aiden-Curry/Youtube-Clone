"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { DragDropZone } from "@/components/upload/drag-drop-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { VideoUploadForm } from "@/components/upload/video-upload-form";
import { ResumableUpload } from "@/lib/upload/resumable-upload";

interface UploadContainerProps {
  userId: string;
}

export function UploadContainer({ userId }: UploadContainerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadInstance, setUploadInstance] =
    useState<ResumableUpload | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bytesUploaded, setBytesUploaded] = useState(0);
  const [bytesTotal, setBytesTotal] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [storagePath, setStoragePath] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsUploading(true);
    setIsComplete(false);
    setBytesTotal(file.size);

    const upload = new ResumableUpload({
      file,
      userId,
      onProgress: (uploaded, total) => {
        setBytesUploaded(uploaded);
        setUploadProgress((uploaded / total) * 100);
      },
      onError: (err) => {
        setError(err.message);
        setIsUploading(false);
      },
      onSuccess: (path) => {
        setStoragePath(path);
        setIsComplete(true);
        setIsUploading(false);
      },
    });

    setUploadInstance(upload);
    await upload.start();
  };

  const handlePause = () => {
    if (uploadInstance) {
      uploadInstance.pause();
      setIsPaused(true);
      setIsUploading(false);
    }
  };

  const handleResume = () => {
    if (uploadInstance) {
      uploadInstance.resume();
      setIsPaused(false);
      setIsUploading(true);
    }
  };

  const handleCancel = () => {
    if (uploadInstance) {
      uploadInstance.abort();
    }
    setSelectedFile(null);
    setUploadInstance(null);
    setUploadProgress(0);
    setBytesUploaded(0);
    setBytesTotal(0);
    setIsUploading(false);
    setIsPaused(false);
    setIsComplete(false);
    setStoragePath("");
    setError(null);
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Video
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload your video content with drag and drop
          </p>
        </CardHeader>
      </Card>

      <div className="mt-6 space-y-6">
        {!selectedFile ? (
          <DragDropZone
            onFileSelect={handleFileSelect}
            disabled={isUploading}
          />
        ) : (
          <>
            <UploadProgress
              fileName={selectedFile.name}
              progress={uploadProgress}
              bytesUploaded={bytesUploaded}
              bytesTotal={bytesTotal}
              isUploading={isUploading}
              isPaused={isPaused}
              isComplete={isComplete}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
            />

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                <p className="font-medium">Upload Error</p>
                <p>{error}</p>
              </div>
            )}

            {isComplete && storagePath && (
              <VideoUploadForm
                storagePath={storagePath}
                originalFilename={selectedFile.name}
                fileSize={selectedFile.size}
                mimeType={selectedFile.type}
                onCancel={handleCancel}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
