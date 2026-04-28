'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          ← Home
        </Link>
        <header className="space-y-2 border-b border-border pb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-xs">
            Effective date: April 22, 2026 · Version referenced in-app as LEGAL_PRIVACY_VERSION
          </p>
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-foreground">
            This is a general-purpose template for developers and product teams. Have qualified legal counsel review
            and adapt it before relying on it as your sole privacy statement.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Who we are</h2>
          <p>
            Pixel Place (“we”, “us”) operates the Pixel Place application and related services. Contact details appear
            in your deployment documentation or product footer once you configure them for production.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What data we collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Account data:</strong> username, credentials or OAuth identifiers,
              optional email where applicable, profile fields you choose to provide.
            </li>
            <li>
              <strong className="text-foreground">Gameplay & progression:</strong> placement stats, achievements,
              seasonal scores, faction participation, territory placements, and similar in-game telemetry needed to
              run features.
            </li>
            <li>
              <strong className="text-foreground">Abuse prevention:</strong> device or browser fingerprints, rate
              limits, moderation flags, and related metadata used to keep the service fair and safe.
            </li>
            <li>
              <strong className="text-foreground">Billing (optional):</strong> if payments are enabled, our payment
              processor receives payment details directly — we typically store processor identifiers only.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Purposes & lawful bases (GDPR)</h2>
          <p>
            We process personal data as necessary to provide the service you request (<strong>contract</strong>), where
            we have a <strong>legitimate interest</strong> (security, fraud prevention, product improvement compatible
            with your rights), or based on your <strong>consent</strong> where required (for example optional analytics
            or marketing cookies — configurable via the cookie banner).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Retention</h2>
          <p>
            We retain data only as long as needed for the purposes above. Legal obligations (tax, accounting,
            disputes) may require longer retention for limited subsets of records.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">International transfers</h2>
          <p>
            Where personal data is transferred outside your region, we rely on appropriate safeguards such as standard
            contractual clauses where applicable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            Depending on your jurisdiction you may have rights to access, rectify, erase, restrict processing,
            portability, and object to certain processing. For accounts backed by our PostgreSQL API, you can request a
            machine-readable export and request deletion from Settings (subject to technical constraints such as fraud
            prevention or legal holds).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <p>
            We use industry-standard measures including TLS in transit, salted password hashing where passwords are
            used, JWT-based authentication with restricted algorithms on verification, optional application-level
            encryption keys for sensitive payloads where configured, and OAuth hardening such as CSRF state validation
            for Google sign-in.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Children</h2>
          <p>
            Pixel Place is not directed at children under the age required by your region. Do not provide personal data
            if you do not meet that age threshold.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p>
            We may update this policy from time to time. Material changes will be communicated through the product or by
            updating the effective date above.
          </p>
        </section>

        <footer className="border-t border-border pt-6 text-xs">
          <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
            Terms of Service
          </Link>
        </footer>
      </div>
    </div>
  );
}
