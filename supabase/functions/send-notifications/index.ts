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

    const { data: notifications } = await supabase
      .from("notifications")
      .select(`
        id,
        user_id,
        type,
        title,
        message,
        link,
        created_at
      `)
      .eq("read", false)
      .gte("created_at", new Date(Date.now() - 60000).toISOString());

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No new notifications" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userIds = [...new Set(notifications.map((n) => n.user_id))];

    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .in("user_id", userIds);

    const { data: pushSubscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    const preferencesMap = new Map(
      (preferences || []).map((p) => [p.user_id, p])
    );
    const pushMap = new Map<string, any[]>();
    (pushSubscriptions || []).forEach((sub) => {
      if (!pushMap.has(sub.user_id)) {
        pushMap.set(sub.user_id, []);
      }
      pushMap.get(sub.user_id)!.push(sub);
    });

    let sentCount = 0;

    for (const notification of notifications) {
      const userPrefs = preferencesMap.get(notification.user_id);
      const userSubs = pushMap.get(notification.user_id) || [];

      const shouldSendPush =
        (notification.type === "new_video" &&
          userPrefs?.push_new_video !== false) ||
        (notification.type === "channel_live" &&
          userPrefs?.push_channel_live !== false);

      if (shouldSendPush && userSubs.length > 0) {
        for (const sub of userSubs) {
          try {
            const payload = JSON.stringify({
              title: notification.title,
              body: notification.message,
              icon: "/icon-192.png",
              badge: "/badge-72.png",
              data: {
                url: notification.link,
              },
            });

            console.log("Sending push notification:", {
              endpoint: sub.endpoint,
              payload: notification.title,
            });

            sentCount++;
          } catch (error) {
            console.error("Error sending push notification:", error);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications.length,
        sent: sentCount,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing notifications:", error);
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
