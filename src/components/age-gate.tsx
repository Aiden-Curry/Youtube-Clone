"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AgeGateProps {
  onVerify: () => void;
}

export function AgeGate({ onVerify }: AgeGateProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);

    localStorage.setItem("age_verified", "true");

    onVerify();
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <CardTitle>Age-Restricted Content</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p>
              This video contains content that may be inappropriate for some
              viewers.
            </p>
            <p>
              To watch this video, you must confirm that you are 18 years of age
              or older.
            </p>
            <div className="rounded-lg bg-muted p-3 text-xs">
              <p className="font-medium">This content may include:</p>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>Mature themes or language</li>
                <li>Realistic violence or graphic imagery</li>
                <li>Sexually suggestive content</li>
                <li>Drug use or dangerous activities</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleVerify} disabled={isVerifying}>
              I am 18 or older
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              disabled={isVerifying}
            >
              Go Back
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            By clicking "I am 18 or older", you confirm that you meet the age
            requirement to view this content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
