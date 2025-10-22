import * as tus from "tus-js-client";

export interface UploadOptions {
  file: File;
  userId: string;
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: (uploadUrl: string) => void;
}

export class ResumableUpload {
  private upload: tus.Upload | null = null;
  private file: File;
  private userId: string;
  private onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  private onError?: (error: Error) => void;
  private onSuccess?: (uploadUrl: string) => void;

  constructor(options: UploadOptions) {
    this.file = options.file;
    this.userId = options.userId;
    this.onProgress = options.onProgress;
    this.onError = options.onError;
    this.onSuccess = options.onSuccess;
  }

  async start() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const fileName = `${this.userId}/${Date.now()}-${this.file.name}`;

    this.upload = new tus.Upload(this.file, {
      endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${supabaseKey}`,
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: "videos",
        objectName: fileName,
        contentType: this.file.type,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError: (error) => {
        console.error("Upload failed:", error);
        this.onError?.(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        this.onProgress?.(bytesUploaded, bytesTotal);
      },
      onSuccess: () => {
        console.log("Upload completed successfully");
        this.onSuccess?.(fileName);
      },
    });

    const previousUploads = await this.upload.findPreviousUploads();
    if (previousUploads.length) {
      this.upload.resumeFromPreviousUpload(previousUploads[0]);
    }

    this.upload.start();
  }

  pause() {
    if (this.upload) {
      this.upload.abort();
    }
  }

  resume() {
    if (this.upload) {
      this.upload.start();
    }
  }

  abort() {
    if (this.upload) {
      this.upload.abort(true);
    }
  }

  getUpload() {
    return this.upload;
  }
}
