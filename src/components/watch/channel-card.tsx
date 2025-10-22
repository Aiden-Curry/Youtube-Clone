"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toggleSubscribe } from "@/lib/watch/actions";

interface ChannelCardProps {
  channel: {
    id: string;
    name: string;
    handle: string;
    subscriber_count: number;
    is_subscribed: boolean;
  };
  user: {
    avatar_url?: string | null;
    display_name: string;
  };
}

export function ChannelCard({ channel, user }: ChannelCardProps) {
  const [isSubscribed, setIsSubscribed] = useState(channel.is_subscribed);
  const [subscriberCount, setSubscriberCount] = useState(
    channel.subscriber_count
  );

  const handleSubscribe = async () => {
    const newSubscribedState = !isSubscribed;
    setIsSubscribed(newSubscribedState);
    setSubscriberCount((prev) => (newSubscribedState ? prev + 1 : prev - 1));

    await toggleSubscribe(channel.id);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Link href={channel.handle} className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={channel.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {channel.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div>
          <Link
            href={channel.handle}
            className="font-semibold hover:underline"
          >
            {channel.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {subscriberCount.toLocaleString()}{" "}
            {subscriberCount === 1 ? "subscriber" : "subscribers"}
          </p>
        </div>
      </div>

      <Button
        variant={isSubscribed ? "outline" : "default"}
        onClick={handleSubscribe}
      >
        {isSubscribed ? "Subscribed" : "Subscribe"}
      </Button>
    </div>
  );
}
