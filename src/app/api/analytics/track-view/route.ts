import { NextRequest, NextResponse } from "next/server";
import { trackVideoView } from "@/lib/analytics/actions";

export async function POST(request: NextRequest) {
  try {
    const { videoId, sessionId } = await request.json();

    if (!videoId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await trackVideoView(videoId, sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
