'use client';

import { PYX_AI_TRAIN_URL } from '@/lib/siteLinks';

type Props = {
  className?: string;
};

/**
 * Prominent link to the Pyx AI trainer at pyx-ai.web.app.
 */
export default function PyxTrainCta({ className }: Props) {
  return (
    <a
      href={PYX_AI_TRAIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={['pyx-train-cta', className].filter(Boolean).join(' ')}
    >
      <span className="pyx-train-cta-glow" aria-hidden />
      <span className="pyx-train-cta-inner">
        <span className="pyx-train-cta-badge" aria-hidden>
          ✦
        </span>
        <span className="pyx-train-cta-text">
          <span className="pyx-train-cta-title">TRAIN PYX AI!</span>
          <span className="pyx-train-cta-sub">Help train our content filter — opens Pyx in a new tab</span>
        </span>
        <span className="pyx-train-cta-arrow" aria-hidden>
          →
        </span>
      </span>
    </a>
  );
}
