import { getCurrentUserWithChannel } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveStreamForm } from "@/components/studio/live-stream-form";

export default async function CreateLiveStreamPage() {
  const user = await getCurrentUserWithChannel();
  const channel = user?.channels?.[0];

  if (!channel) {
    redirect("/auth/setup");
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Live Stream</h1>
        <p className="text-muted-foreground">
          Set up your live stream and get your RTMP credentials
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stream Details</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveStreamForm />
        </CardContent>
      </Card>
    </div>
  );
}
