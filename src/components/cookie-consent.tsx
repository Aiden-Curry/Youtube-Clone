"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isEU, setIsEU] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");

    if (!consent) {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          const euCountries = [
            "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
            "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
            "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "IS", "LI",
            "NO", "CH"
          ];
          const userIsInEU = euCountries.includes(data.country_code);
          setIsEU(userIsInEU);
          setShowBanner(true);
        })
        .catch(() => {
          setShowBanner(true);
        });
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", "all");
    localStorage.setItem("gdpr_consent", "true");
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie_consent", "essential");
    localStorage.setItem("gdpr_consent", "false");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-2 shadow-lg">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 flex-shrink-0 text-primary" />
            <div className="space-y-2">
              <h3 className="font-semibold">Cookie Consent</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience, analyze site traffic,
                and personalize content. By clicking "Accept All", you consent to
                our use of cookies.{" "}
                {isEU && (
                  <span className="font-medium">
                    As an EU visitor, you have enhanced privacy rights under GDPR.
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  href="/legal/privacy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/legal/terms"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/legal/guidelines"
                  className="text-primary hover:underline"
                >
                  Community Guidelines
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            {isEU && (
              <Button
                variant="outline"
                onClick={acceptEssential}
                className="whitespace-nowrap"
              >
                Essential Only
              </Button>
            )}
            <Button onClick={acceptAll} className="whitespace-nowrap">
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
