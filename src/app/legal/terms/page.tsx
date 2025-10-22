import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using StreamHub, you accept and agree to be
                bound by the terms and provision of this agreement.
              </p>
              <p>
                If you do not agree to these Terms of Service, please do not
                use our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                When you create an account with us, you must provide
                information that is accurate, complete, and current at all
                times.
              </p>
              <p>
                You are responsible for safeguarding the password that you use
                to access the Service and for any activities or actions under
                your password.
              </p>
              <p>
                You agree not to disclose your password to any third party. You
                must notify us immediately upon becoming aware of any breach of
                security or unauthorized use of your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our Service allows you to post, link, store, share and
                otherwise make available certain information, text, graphics,
                videos, or other material. You are responsible for the content
                that you post to the Service.
              </p>
              <p>
                By posting content to the Service, you grant us the right and
                license to use, modify, publicly perform, publicly display,
                reproduce, and distribute such content on and through the
                Service.
              </p>
              <p>
                You retain any and all of your rights to any content you submit,
                post or display on or through the Service and you are
                responsible for protecting those rights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You may not use the Service:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  For any unlawful purpose or to solicit others to perform or
                  participate in any unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
                <li>
                  To upload or transmit viruses or any other type of malicious
                  code
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Copyright Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We respect the intellectual property rights of others. It is our
                policy to respond to any claim that content posted on the
                Service infringes copyright or other intellectual property
                infringement of any person.
              </p>
              <p>
                If you are a copyright owner, or authorized on behalf of one,
                and you believe that the copyrighted work has been copied in a
                way that constitutes copyright infringement, please submit your
                claim via email with detailed information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may terminate or suspend your account immediately, without
                prior notice or liability, for any reason whatsoever, including
                without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately
                cease. If you wish to terminate your account, you may simply
                discontinue using the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                In no event shall StreamHub, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. We will provide notice of any
                significant changes by posting the new Terms of Service on this
                page.
              </p>
              <p>
                Your continued use of the Service after any such changes
                constitutes your acceptance of the new Terms of Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about these Terms, please contact us
                at support@streamhub.example.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
