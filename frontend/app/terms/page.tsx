'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          ← Home
        </Link>
        <header className="space-y-2 border-b border-border pb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Terms of Service</h1>
          <p className="text-xs">
            Effective date: April 22, 2026 · Version referenced in-app as LEGAL_TERMS_VERSION
          </p>
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-foreground">
            Template only — obtain professional legal advice before publishing as binding terms for your jurisdiction
            and business model.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Agreement</h2>
          <p>
            By accessing or using Pixel Place, you agree to these Terms and our Privacy Policy. If you do not agree,
            do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Eligibility & accounts</h2>
          <p>
            You must meet any minimum age requirements applicable in your region. You are responsible for safeguarding
            your credentials and for activity under your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Harass others, distribute illegal content, or attempt to disrupt or compromise the service.</li>
            <li>Automate abuse (including botting or evading rate limits or safety controls).</li>
            <li>Reverse engineer or misuse APIs in violation of documentation or intent.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">User content & license</h2>
          <p>
            Content you submit (such as pixels, chat, or creations) grants us a limited license to host, process, and
            display it as needed to operate the service, subject to your privacy rights and retention settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Purchases</h2>
          <p>
            Optional purchases are processed by third-party payment providers. Fees, renewals, and refunds follow
            applicable law and the processor’s policies where stated at checkout.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Termination</h2>
          <p>
            You may stop using Pixel Place at any time. We may suspend or terminate access for violations or risk to the
            service. Export and deletion options may be offered in-app where technically available.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Disclaimers</h2>
          <p>
            The service is provided “as is” to the maximum extent permitted by law. We do not warrant uninterrupted or
            error-free operation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Limitation of liability</h2>
          <p>
            To the extent permitted by applicable law, our aggregate liability arising from these Terms is limited as
            appropriate for your deployment; some jurisdictions do not allow certain limitations, which may apply to you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Governing law</h2>
          <p>Specify governing law and venue for your entity in production documentation.</p>
        </section>

        <footer className="border-t border-border pt-6 text-xs">
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
        </footer>
      </div>
    </div>
  );
}
