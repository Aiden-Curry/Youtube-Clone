import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">Personal Information</h3>
              <p>
                When you create an account, we collect information such as your
                email address, username, display name, and any profile
                information you choose to provide.
              </p>
              <h3 className="mt-4 font-semibold">Usage Information</h3>
              <p>
                We collect information about how you use our service, including
                videos watched, search queries, comments, likes, and
                interactions with other users.
              </p>
              <h3 className="mt-4 font-semibold">Device and Technical Information</h3>
              <p>
                We collect device information such as IP address, browser type,
                operating system, and device identifiers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience and deliver content</li>
                <li>Process your requests and transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns and trends</li>
                <li>Detect, prevent, and address fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We may share your information with:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Other Users:</strong> Your profile information,
                  videos, comments, and other content you post are visible to
                  other users
                </li>
                <li>
                  <strong>Service Providers:</strong> Third-party companies that
                  help us operate our platform
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a
                  merger, sale, or acquisition
                </li>
              </ul>
              <p className="mt-4">
                We do not sell your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use cookies and similar tracking technologies to track
                activity on our Service and hold certain information.
              </p>
              <p>
                Cookies are files with small amount of data which may include an
                anonymous unique identifier. You can instruct your browser to
                refuse all cookies or to indicate when a cookie is being sent.
              </p>
              <p>
                We use both session and persistent cookies for various purposes
                including authentication, preferences, and analytics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We will retain your personal information only for as long as is
                necessary for the purposes set out in this Privacy Policy. We
                will retain and use your information to comply with our legal
                obligations, resolve disputes, and enforce our policies.
              </p>
              <p>
                When you delete your account, we will delete or anonymize your
                personal information. Some information may be retained for legal
                or operational purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights (GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you are a resident of the European Economic Area (EEA), you
                have certain data protection rights:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Access:</strong> Request access to your personal data
                </li>
                <li>
                  <strong>Rectification:</strong> Request correction of
                  inaccurate data
                </li>
                <li>
                  <strong>Erasure:</strong> Request deletion of your data
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of
                  processing
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your data
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Withdraw consent at any
                  time
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at
                privacy@streamhub.example.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our Service is not directed to children under the age of 13. We
                do not knowingly collect personal information from children
                under 13.
              </p>
              <p>
                If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us so we
                can delete it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use reasonable security measures to protect your information
                from unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the
                Internet is 100% secure.
              </p>
              <p>
                We cannot guarantee absolute security but we strive to use
                commercially acceptable means to protect your personal
                information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. International Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your information may be transferred to and maintained on
                computers located outside of your country where data protection
                laws may differ.
              </p>
              <p>
                By using our Service, you consent to the transfer of your
                information to facilities located in other countries.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for
                any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at privacy@streamhub.example.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
