"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { DragDropZone } from "@/components/upload/drag-drop-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { VideoUploadForm } from "@/components/upload/video-upload-form";
import { TranscodeProgress } from "@/components/upload/transcode-progress";
import { ResumableUpload } from "@/lib/upload/resumable-upload";
import {
  VideoTranscoder,
  uploadHLSFiles,
  uploadPoster,
  getPublicUrl,
} from "@/lib/upload/transcoder";
import { updateVideoAfterTranscode } from "@/lib/upload/actions";

interface UploadContainerProps {
  userId: string;
}

export function UploadContainer({ userId }: UploadContainerProps) {
  const router = useRouter();
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

  const [isTranscoding, setIsTranscoding] = useState(false);
  const [transcodeStatus, setTranscodeStatus] = useState("");
  const [currentRendition, setCurrentRendition] = useState(0);
  const [totalRenditions, setTotalRenditions] = useState(3);
  const [transcodeComplete, setTranscodeComplete] = useState(false);
  const [videoId, setVideoId] = useState<string>("");

  const videoFileRef = useRef<File | null>(null);
  const transcoderRef = useRef<VideoTranscoder | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    videoFileRef.current = file;
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
    if (transcoderRef.current) {
      transcoderRef.current.terminate();
    }
    setSelectedFile(null);
    videoFileRef.current = null;
    setUploadInstance(null);
    setUploadProgress(0);
    setBytesUploaded(0);
    setBytesTotal(0);
    setIsUploading(false);
    setIsPaused(false);
    setIsComplete(false);
    setStoragePath("");
    setError(null);
    setIsTranscoding(false);
    setTranscodeComplete(false);
    setVideoId("");
  };

  const handleStartTranscode = async (createdVideoId: string) => {
    if (!videoFileRef.current) {
      setError("No video file available");
      return;
    }

    setVideoId(createdVideoId);
    setIsTranscoding(true);
    setTranscodeStatus("Initializing transcoder...");

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = async () => {
      const duration = Math.floor(video.duration);

      const transcoder = new VideoTranscoder(
        (progress) => {
          if (progress.type === "status") {
            setTranscodeStatus(progress.message || "Processing...");
          } else if (progress.type === "rendition") {
            setTranscodeStatus(progress.message || "Transcoding...");
            setCurrentRendition(progress.current || 0);
            setTotalRenditions(progress.total || 3);
          }
        },
        async (files, poster) => {
          try {
            setTranscodeStatus("Uploading HLS files...");

            const hlsPath = await uploadHLSFiles(files, userId, createdVideoId);
            const hlsUrl = getPublicUrl(hlsPath);

            setTranscodeStatus("Uploading poster...");
            const posterPath = await uploadPoster(
              poster,
              userId,
              createdVideoId
            );
            const posterUrl = getPublicUrl(posterPath);

            setTranscodeStatus("Finalizing...");
            await updateVideoAfterTranscode(
              createdVideoId,
              hlsUrl,
              posterUrl,
              duration
            );

            setTranscodeComplete(true);
            setTranscodeStatus("Video published successfully!");

            setTimeout(() => {
              router.push("/studio");
            }, 2000);
          } catch (err: any) {
            setError(`Finalization error: ${err.message}`);
            setIsTranscoding(false);
          }
        },
        (err) => {
          setError(`Transcoding error: ${err}`);
          setIsTranscoding(false);
        }
      );

      transcoderRef.current = transcoder;
      await transcoder.transcode(videoFileRef.current!, duration);
    };

    video.src = URL.createObjectURL(videoFileRef.current);
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
            disabled={isUploading || isTranscoding}
          />
        ) : (
          <>
            {!isTranscoding && (
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
            )}

            {isTranscoding && (
              <TranscodeProgress
                status={transcodeStatus}
                currentRendition={currentRendition}
                totalRenditions={totalRenditions}
                isComplete={transcodeComplete}
              />
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {isComplete && storagePath && !isTranscoding && (
              <VideoUploadForm
                storagePath={storagePath}
                originalFilename={selectedFile.name}
                fileSize={selectedFile.size}
                mimeType={selectedFile.type}
                onCancel={handleCancel}
                onStartTranscode={(createdVideoId: string) =>
                  handleStartTranscode(createdVideoId)
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
