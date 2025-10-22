const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;
const LIVEPEER_API_URL = "https://livepeer.studio/api";

export interface LivepeerStream {
  id: string;
  name: string;
  streamKey: string;
  playbackId: string;
  isActive: boolean;
  record: boolean;
}

export interface LivepeerAsset {
  id: string;
  playbackId: string;
  playbackUrl: string;
  downloadUrl: string;
  status: string;
}

export async function createLivepeerStream(
  name: string
): Promise<LivepeerStream | null> {
  try {
    const response = await fetch(`${LIVEPEER_API_URL}/stream`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LIVEPEER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        record: true,
        profiles: [
          {
            name: "720p",
            bitrate: 2000000,
            fps: 30,
            width: 1280,
            height: 720,
          },
          {
            name: "480p",
            bitrate: 1000000,
            fps: 30,
            width: 854,
            height: 480,
          },
          {
            name: "360p",
            bitrate: 500000,
            fps: 30,
            width: 640,
            height: 360,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Livepeer API error:", await response.text());
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      streamKey: data.streamKey,
      playbackId: data.playbackId,
      isActive: data.isActive || false,
      record: data.record || false,
    };
  } catch (error) {
    console.error("Error creating Livepeer stream:", error);
    return null;
  }
}

export async function getLivepeerStream(
  streamId: string
): Promise<LivepeerStream | null> {
  try {
    const response = await fetch(`${LIVEPEER_API_URL}/stream/${streamId}`, {
      headers: {
        Authorization: `Bearer ${LIVEPEER_API_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      streamKey: data.streamKey,
      playbackId: data.playbackId,
      isActive: data.isActive || false,
      record: data.record || false,
    };
  } catch (error) {
    console.error("Error fetching Livepeer stream:", error);
    return null;
  }
}

export async function deleteLivepeerStream(streamId: string): Promise<boolean> {
  try {
    const response = await fetch(`${LIVEPEER_API_URL}/stream/${streamId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${LIVEPEER_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting Livepeer stream:", error);
    return false;
  }
}

export async function getStreamSessions(
  streamId: string
): Promise<any[] | null> {
  try {
    const response = await fetch(
      `${LIVEPEER_API_URL}/stream/${streamId}/sessions`,
      {
        headers: {
          Authorization: `Bearer ${LIVEPEER_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stream sessions:", error);
    return null;
  }
}

export function getPlaybackUrl(playbackId: string): string {
  return `https://livepeer.studio/hls/${playbackId}/index.m3u8`;
}

export function getRTMPIngestUrl(): string {
  return "rtmp://rtmp.livepeer.com/live";
}
