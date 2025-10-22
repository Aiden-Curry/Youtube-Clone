import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommunityGuidelinesPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold">Community Guidelines</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mb-6 rounded-lg bg-blue-50 p-6 dark:bg-blue-950">
          <h2 className="mb-2 text-xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground">
            StreamHub is a platform for creators to share their content with the
            world. We believe in fostering a safe, respectful, and inclusive
            community where everyone can express themselves freely while
            respecting others.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Respect and Civility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Treat others with respect and kindness. We do not tolerate
                harassment, bullying, or hate speech of any kind.
              </p>
              <p>Do not:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Harass, threaten, or intimidate other users
                </li>
                <li>
                  Post content that promotes hatred or discrimination based on
                  race, ethnicity, religion, disability, gender, age, veteran
                  status, or sexual orientation
                </li>
                <li>
                  Engage in personal attacks or inflammatory comments
                </li>
                <li>
                  Dox or share personal information about others without consent
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Content Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">Prohibited Content</h3>
              <p>The following types of content are not allowed:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Illegal Content:</strong> Content that violates laws
                  or regulations
                </li>
                <li>
                  <strong>Violence:</strong> Graphic violence, gore, or content
                  that incites violence
                </li>
                <li>
                  <strong>Adult Content:</strong> Sexually explicit content or
                  pornography (age-restricted content must be properly labeled)
                </li>
                <li>
                  <strong>Harmful Activities:</strong> Content promoting
                  dangerous activities, self-harm, or suicide
                </li>
                <li>
                  <strong>Child Safety:</strong> Any content that exploits or
                  endangers minors
                </li>
                <li>
                  <strong>Spam and Scams:</strong> Misleading content, phishing,
                  or fraudulent schemes
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Copyright and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Only upload content that you own or have permission to use.
                Respect the intellectual property rights of others.
              </p>
              <p>Do not:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Upload copyrighted content without permission
                </li>
                <li>
                  Use music, videos, or images you don't have rights to
                </li>
                <li>
                  Impersonate other creators or steal their content
                </li>
              </ul>
              <p className="mt-4">
                We will remove content that violates copyright law and may
                terminate repeat offenders.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Spam and Manipulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We want authentic engagement on our platform. Do not engage in
                artificial manipulation of metrics or spam.
              </p>
              <p>Prohibited activities include:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Using bots or automated systems to inflate views, likes, or
                  subscribers
                </li>
                <li>
                  Posting repetitive comments or messages
                </li>
                <li>
                  Misleading thumbnails, titles, or descriptions
                </li>
                <li>
                  Engaging in sub4sub or other artificial growth schemes
                </li>
                <li>
                  Link spamming or excessive self-promotion
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Age-Restricted Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Some content may be appropriate for adult audiences only. If
                your content contains mature themes, violence, profanity, or
                other adult material, you must mark it as age-restricted.
              </p>
              <p>
                Age-restricted content will not be visible to users under 18 or
                those not logged in. This includes content featuring:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Excessive profanity or crude humor</li>
                <li>Realistic violence or graphic imagery</li>
                <li>Sexually suggestive content</li>
                <li>Drug use or dangerous activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Misinformation and Harmful Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We do not allow content that spreads harmful misinformation,
                especially regarding:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Public health (e.g., false medical advice, vaccine
                  misinformation)
                </li>
                <li>
                  Elections and civic processes (e.g., false voting information)
                </li>
                <li>
                  Conspiracy theories that promote violence or harassment
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Live Streaming Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                All community guidelines apply to live streams. Additionally:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Monitor your chat and moderate inappropriate behavior
                </li>
                <li>
                  Do not show illegal activities or dangerous behavior
                </li>
                <li>
                  Respect privacy - do not stream in private spaces without
                  consent
                </li>
                <li>
                  Be prepared to end your stream if issues arise
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Reporting Violations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you see content that violates these guidelines, please report
                it using the report button available on videos and comments.
              </p>
              <p>
                Our moderation team reviews reports and takes appropriate action,
                which may include:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Removing the content</li>
                <li>Issuing a warning</li>
                <li>Temporary suspension</li>
                <li>Permanent account termination</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Consequences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Violations of these Community Guidelines may result in:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>First Offense:</strong> Warning or content removal
                </li>
                <li>
                  <strong>Second Offense:</strong> Temporary suspension (7-30
                  days)
                </li>
                <li>
                  <strong>Third Offense:</strong> Permanent account termination
                </li>
              </ul>
              <p className="mt-4">
                Severe violations (such as illegal content or serious harassment)
                may result in immediate permanent suspension.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Appeals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you believe your content was removed in error or you were
                unfairly suspended, you may appeal the decision.
              </p>
              <p>
                Submit an appeal to appeals@streamhub.example.com with your
                account details and explanation. We will review your case within
                5 business days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have questions about these Community Guidelines, please
                contact us at support@streamhub.example.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
