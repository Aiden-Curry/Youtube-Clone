import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { NotificationSettings } from "@/components/settings/notification-settings";

export default async function NotificationSettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/signin");
  }

  const supabase = await createClient();

  let { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (!preferences) {
    const { data: newPreferences } = await supabase
      .from("notification_preferences")
      .insert({
        user_id: currentUser.id,
        email_new_video: true,
        email_channel_live: true,
        push_new_video: true,
        push_channel_live: true,
      })
      .select()
      .single();

    preferences = newPreferences;
  }

  const { data: pushSubscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", currentUser.id);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences
        </p>
      </div>

      <NotificationSettings
        preferences={preferences || {
          email_new_video: true,
          email_channel_live: true,
          push_new_video: true,
          push_channel_live: true,
        }}
        hasPushSubscription={(pushSubscriptions?.length || 0) > 0}
      />
    </div>
  );
}
