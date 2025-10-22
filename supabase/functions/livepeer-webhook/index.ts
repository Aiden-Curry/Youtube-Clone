import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();

    console.log("Livepeer webhook received:", JSON.stringify(payload));

    const { event, stream, session } = payload;

    if (!stream?.id) {
      return new Response(
        JSON.stringify({ error: "Missing stream ID" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: liveStream } = await supabase
      .from("live_streams")
      .select("id, channel_id")
      .eq("external_stream_id", stream.id)
      .single();

    if (!liveStream) {
      console.log("Live stream not found for external_stream_id:", stream.id);
      return new Response(
        JSON.stringify({ error: "Stream not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (event === "stream.started") {
      await supabase
        .from("live_streams")
        .update({
          status: "live",
          started_at: new Date().toISOString(),
        })
        .eq("id", liveStream.id);

      console.log("Stream started:", liveStream.id);
    } else if (event === "stream.idle") {
      await supabase
        .from("live_streams")
        .update({
          status: "idle",
        })
        .eq("id", liveStream.id);

      console.log("Stream went idle:", liveStream.id);
    } else if (event === "recording.ready" || event === "asset.ready") {
      if (payload.asset?.playbackId && payload.asset?.downloadUrl) {
        await supabase
          .from("live_streams")
          .update({
            vod_asset_id: payload.asset.id,
            vod_playback_url: payload.asset.playbackUrl || `https://livepeer.studio/hls/${payload.asset.playbackId}/index.m3u8`,
          })
          .eq("id", liveStream.id);

        const { data: channel } = await supabase
          .from("channels")
          .select("id")
          .eq("id", liveStream.channel_id)
          .single();

        if (channel) {
          const { data: streamData } = await supabase
            .from("live_streams")
            .select("title, description")
            .eq("id", liveStream.id)
            .single();

          await supabase
            .from("videos")
            .insert({
              channel_id: channel.id,
              title: streamData?.title || "Untitled Stream Recording",
              description: streamData?.description || "Recording from live stream",
              video_url: payload.asset.downloadUrl,
              hls_url: payload.asset.playbackUrl || `https://livepeer.studio/hls/${payload.asset.playbackId}/index.m3u8`,
              status: "public",
              visibility: "public",
            });

          console.log("VOD created for stream:", liveStream.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
