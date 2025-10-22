import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

interface VideoCardProps {
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  thumbnail?: string;
}

export function VideoCard({
  title,
  channel,
  views,
  timestamp,
}: VideoCardProps) {
  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          <div className="flex h-full items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            12:34
          </div>
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 font-semibold leading-snug">{title}</h3>
          <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
            <p>{channel}</p>
            <p>
              {views} • {timestamp}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
