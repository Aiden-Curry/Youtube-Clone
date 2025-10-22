import { getCurrentUser } from "@/lib/auth/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default async function UploadPage() {
  const user = await getCurrentUser();

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Video
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Welcome, {user?.display_name}! Upload your video content here.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">
                Video upload functionality coming soon
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This protected page requires authentication
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
