import { NextRequest, NextResponse } from "next/server";
import { trackWatchTime } from "@/lib/analytics/actions";

export async function POST(request: NextRequest) {
  try {
    const { videoId, watchDuration, sessionId } = await request.json();

    if (!videoId || watchDuration === undefined || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await trackWatchTime(videoId, watchDuration, sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking watch time:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
