'use client';

type Props = {
  /** Login footer uses cyan accent to match status / links */
  variant?: 'dashboard' | 'login';
  className?: string;
};

export default function BrandKitDownloadLink({ variant = 'dashboard', className }: Props) {
  const cls = ['brand-kit-download-link', variant === 'login' && 'brand-kit-download-link--login', className]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href="/brand-kit/pixel-place-brand-kit.zip"
      download="pixel-place-brand-kit.zip"
      className={cls}
      rel="noopener noreferrer"
    >
      Download brand kit (PDFs)
    </a>
  );
}
