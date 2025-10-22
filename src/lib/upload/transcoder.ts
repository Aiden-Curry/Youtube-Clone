export interface TranscodeProgress {
  type: 'status' | 'progress' | 'rendition' | 'log' | 'complete' | 'error';
  message?: string;
  progress?: number;
  current?: number;
  total?: number;
  files?: Array<{ name: string; data: Uint8Array }>;
  poster?: Uint8Array;
}

export class VideoTranscoder {
  private worker: Worker | null = null;
  private onProgress?: (progress: TranscodeProgress) => void;
  private onComplete?: (files: Array<{ name: string; data: Uint8Array }>, poster: Uint8Array) => void;
  private onError?: (error: string) => void;

  constructor(
    onProgress?: (progress: TranscodeProgress) => void,
    onComplete?: (files: Array<{ name: string; data: Uint8Array }>, poster: Uint8Array) => void,
    onError?: (error: string) => void
  ) {
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.onError = onError;
  }

  async transcode(file: File, duration: number) {
    this.worker = new Worker('/ffmpeg-worker.js');

    this.worker.onmessage = (e) => {
      const data: TranscodeProgress = e.data;

      if (data.type === 'complete') {
        this.onComplete?.(data.files!, data.poster!);
        this.terminate();
      } else if (data.type === 'error') {
        this.onError?.(data.message || 'Transcoding failed');
        this.terminate();
      } else {
        this.onProgress?.(data);
      }
    };

    this.worker.onerror = (error) => {
      this.onError?.(`Worker error: ${error.message}`);
      this.terminate();
    };

    const fileData = await file.arrayBuffer();

    this.worker.postMessage({
      type: 'transcode',
      data: {
        file: new Uint8Array(fileData),
        duration,
      },
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export async function uploadHLSFiles(
  files: Array<{ name: string; data: Uint8Array }>,
  userId: string,
  videoId: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const basePath = `${userId}/${videoId}/hls`;

  for (const file of files) {
    const filePath = `${basePath}/${file.name}`;

    const blob = new Blob([new Uint8Array(file.data)], { type: 'application/octet-stream' });

    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/videos/${filePath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: blob,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}: ${response.statusText}`);
    }
  }

  return `${basePath}/master.m3u8`;
}

export async function uploadPoster(
  posterData: Uint8Array,
  userId: string,
  videoId: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const posterPath = `${userId}/${videoId}/poster.jpg`;
  const posterBlob = new Blob([new Uint8Array(posterData)], { type: 'image/jpeg' });

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/videos/${posterPath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'image/jpeg',
      },
      body: posterBlob,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload poster: ${response.statusText}`);
  }

  return posterPath;
}

export function getPublicUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/videos/${path}`;
}
