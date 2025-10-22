"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Mail } from "lucide-react";
import {
  updateNotificationPreferences,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/notifications/actions";

interface NotificationSettingsProps {
  preferences: {
    email_new_video: boolean;
    email_channel_live: boolean;
    push_new_video: boolean;
    push_channel_live: boolean;
  };
  hasPushSubscription: boolean;
}

export function NotificationSettings({
  preferences,
  hasPushSubscription,
}: NotificationSettingsProps) {
  const [emailNewVideo, setEmailNewVideo] = useState(
    preferences.email_new_video
  );
  const [emailChannelLive, setEmailChannelLive] = useState(
    preferences.email_channel_live
  );
  const [pushNewVideo, setPushNewVideo] = useState(preferences.push_new_video);
  const [pushChannelLive, setPushChannelLive] = useState(
    preferences.push_channel_live
  );
  const [isPushEnabled, setIsPushEnabled] = useState(hasPushSubscription);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  const handleUpdate = async (field: string, value: boolean) => {
    setIsUpdating(true);

    await updateNotificationPreferences({
      email_new_video: field === "email_new_video" ? value : emailNewVideo,
      email_channel_live:
        field === "email_channel_live" ? value : emailChannelLive,
      push_new_video: field === "push_new_video" ? value : pushNewVideo,
      push_channel_live:
        field === "push_channel_live" ? value : pushChannelLive,
    });

    setIsUpdating(false);
  };

  const handleEnablePush = async () => {
    if (!pushSupported) {
      alert("Push notifications are not supported in your browser");
      return;
    }

    if (pushPermission === "denied") {
      alert(
        "Push notifications are blocked. Please enable them in your browser settings."
      );
      return;
    }

    setIsUpdating(true);

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        const result = await subscribeToPush();

        if (result.success) {
          setIsPushEnabled(true);
        } else {
          alert(result.error || "Failed to enable push notifications");
        }
      }
    } catch (error) {
      console.error("Error enabling push:", error);
      alert("Failed to enable push notifications");
    }

    setIsUpdating(false);
  };

  const handleDisablePush = async () => {
    setIsUpdating(true);

    const result = await unsubscribeFromPush();

    if (result.success) {
      setIsPushEnabled(false);
    } else {
      alert(result.error || "Failed to disable push notifications");
    }

    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New videos from subscribed channels</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a channel you subscribe to uploads a new video
              </p>
            </div>
            <Switch
              checked={emailNewVideo}
              onCheckedChange={(checked) => {
                setEmailNewVideo(checked);
                handleUpdate("email_new_video", checked);
              }}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Channel goes live</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a subscribed channel starts a live stream
              </p>
            </div>
            <Switch
              checked={emailChannelLive}
              onCheckedChange={(checked) => {
                setEmailChannelLive(checked);
                handleUpdate("email_channel_live", checked);
              }}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!pushSupported ? (
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Push notifications are not supported in your browser
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable push notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications for updates
                  </p>
                </div>
                {isPushEnabled ? (
                  <Button
                    variant="outline"
                    onClick={handleDisablePush}
                    disabled={isUpdating}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button onClick={handleEnablePush} disabled={isUpdating}>
                    Enable
                  </Button>
                )}
              </div>

              {isPushEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        New videos from subscribed channels
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Get push notifications for new uploads
                      </p>
                    </div>
                    <Switch
                      checked={pushNewVideo}
                      onCheckedChange={(checked) => {
                        setPushNewVideo(checked);
                        handleUpdate("push_new_video", checked);
                      }}
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Channel goes live</p>
                      <p className="text-sm text-muted-foreground">
                        Get push notifications for live streams
                      </p>
                    </div>
                    <Switch
                      checked={pushChannelLive}
                      onCheckedChange={(checked) => {
                        setPushChannelLive(checked);
                        handleUpdate("push_channel_live", checked);
                      }}
                      disabled={isUpdating}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
