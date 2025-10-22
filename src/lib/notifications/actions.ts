"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateNotificationPreferences(preferences: {
  email_new_video: boolean;
  email_channel_live: boolean;
  push_new_video: boolean;
  push_channel_live: boolean;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/notifications");

  return { success: true };
}

export async function subscribeToPush() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    if (!("serviceWorker" in navigator)) {
      return { error: "Service workers not supported" };
    }

    const registration = await navigator.serviceWorker.ready;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.warn("VAPID public key not configured");
      return { error: "Push notifications not configured" };
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const subscriptionJSON = subscription.toJSON();

    const { error } = await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint: subscriptionJSON.endpoint!,
      p256dh_key: subscriptionJSON.keys!.p256dh,
      auth_key: subscriptionJSON.keys!.auth,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/settings/notifications");

    return { success: true };
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return { error: "Failed to subscribe to push notifications" };
  }
}

export async function unsubscribeFromPush() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/settings/notifications");

    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    return { error: "Failed to unsubscribe from push notifications" };
  }
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
