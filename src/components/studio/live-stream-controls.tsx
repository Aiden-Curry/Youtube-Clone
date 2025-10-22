"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { endLiveStream, deleteLiveStream } from "@/lib/live/actions";
import { useRouter } from "next/navigation";
import { StopCircle, Trash2 } from "lucide-react";

interface LiveStreamControlsProps {
  liveStreamId: string;
  status: string;
}

export function LiveStreamControls({
  liveStreamId,
  status,
}: LiveStreamControlsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEndStream = async () => {
    if (!confirm("Are you sure you want to end this stream?")) return;

    setIsProcessing(true);
    const result = await endLiveStream(liveStreamId);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }

    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this stream? This cannot be undone."
      )
    )
      return;

    setIsProcessing(true);
    const result = await deleteLiveStream(liveStreamId);

    if (result.error) {
      alert(result.error);
      setIsProcessing(false);
    } else {
      router.push("/studio/live");
    }
  };

  return (
    <div className="flex gap-2">
      {status === "live" && (
        <Button
          variant="destructive"
          onClick={handleEndStream}
          disabled={isProcessing}
        >
          <StopCircle className="mr-2 h-4 w-4" />
          End Stream
        </Button>
      )}

      {status !== "live" && (
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={isProcessing}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Stream
        </Button>
      )}
    </div>
  );
}
