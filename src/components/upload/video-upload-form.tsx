"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createVideoRecord } from "@/lib/upload/actions";
import { useRouter } from "next/navigation";

interface VideoUploadFormProps {
  storagePath: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  onCancel: () => void;
}

export function VideoUploadForm({
  storagePath,
  originalFilename,
  fileSize,
  mimeType,
  onCancel,
}: VideoUploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tagsInput = formData.get("tags") as string;
    const visibility = formData.get("visibility") as
      | "public"
      | "private"
      | "unlisted";

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const result = await createVideoRecord({
      title,
      description,
      tags,
      visibility,
      storagePath,
      originalFilename,
      fileSize,
      mimeType,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/studio");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Enter video title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell viewers about your video"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <Input
              id="tags"
              name="tags"
              placeholder="tutorial, nextjs, react (comma-separated)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="visibility" className="text-sm font-medium">
              Visibility *
            </label>
            <select
              id="visibility"
              name="visibility"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="private"
              disabled={isSubmitting}
              required
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Choose who can see your video
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <div className="space-y-1">
              <p>
                <span className="font-medium">File:</span> {originalFilename}
              </p>
              <p>
                <span className="font-medium">Size:</span>{" "}
                {(fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
              <p>
                <span className="font-medium">Type:</span> {mimeType}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Publishing..." : "Publish Video"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
