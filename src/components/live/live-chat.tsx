"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { sendChatMessage } from "@/lib/live/actions";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  user: {
    username: string;
    display_name: string;
    avatar_url?: string | null;
  } | null;
}

interface LiveChatProps {
  liveStreamId: string;
  initialMessages: any[];
  currentUser?: {
    username: string;
    display_name: string;
    avatar_url?: string | null;
  } | null;
  isLive: boolean;
}

export function LiveChat({
  liveStreamId,
  initialMessages,
  currentUser,
  isLive,
}: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map((m) => ({
      id: m.id,
      message: m.message,
      created_at: m.created_at,
      user: Array.isArray(m.user) ? m.user[0] : m.user,
    }))
  );
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLive) return;

    const channel = supabase
      .channel(`live_chat:${liveStreamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `live_stream_id=eq.${liveStreamId}`,
        },
        async (payload) => {
          const { data: messageWithUser } = await supabase
            .from("live_chat_messages")
            .select(
              `
              id,
              message,
              created_at,
              user:users!live_chat_messages_user_id_fkey (
                username,
                display_name,
                avatar_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (messageWithUser) {
            setMessages((prev) => [
              ...prev,
              {
                id: messageWithUser.id,
                message: messageWithUser.message,
                created_at: messageWithUser.created_at,
                user: Array.isArray(messageWithUser.user)
                  ? messageWithUser.user[0]
                  : messageWithUser.user,
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveStreamId, isLive, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUser) return;

    setIsSending(true);

    const result = await sendChatMessage(liveStreamId, newMessage);

    if (result.error) {
      alert(result.error);
    } else {
      setNewMessage("");
    }

    setIsSending(false);
  };

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <CardTitle>Live Chat</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="flex-1 overflow-y-auto px-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {isLive
                  ? "Be the first to send a message!"
                  : "Chat is disabled for ended streams"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-2">
                  {msg.user?.avatar_url ? (
                    <img
                      src={msg.user.avatar_url}
                      alt={msg.user.display_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {msg.user?.display_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">
                        {msg.user?.display_name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {currentUser && isLive && (
          <form
            onSubmit={handleSendMessage}
            className="border-t p-4"
          >
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message..."
                maxLength={500}
                disabled={isSending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {!currentUser && isLive && (
          <div className="border-t p-4 text-center text-sm text-muted-foreground">
            Sign in to chat
          </div>
        )}
      </CardContent>
    </Card>
  );
}
