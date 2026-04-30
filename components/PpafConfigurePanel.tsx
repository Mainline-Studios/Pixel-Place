'use client';

/**
 * Operator instructions for Ed25519 .ppaf signing (Firebase Functions + Next build env).
 */
export default function PpafConfigurePanel({
  open,
  onToggle,
  id = 'ppaf-configure-block',
}: {
  open: boolean;
  onToggle: (next: boolean) => void;
  id?: string;
}) {
  return (
    <details
      id={id}
      className="ppaf-configure-details"
      open={open}
      onToggle={(e) => onToggle((e.target as HTMLDetailsElement).open)}
      style={{
        marginTop: 14,
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid rgba(251, 191, 36, 0.35)',
        background: 'rgba(251, 191, 36, 0.06)',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontWeight: 700,
          color: '#fcd34d',
          listStyle: 'none',
        }}
      >
        Configure — account backup signing (.ppaf)
      </summary>
      <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.65, color: 'var(--text-main)' }}>
        <p style={{ margin: '0 0 10px' }}>
          Signed backups need the Ed25519 <strong>private</strong> key on Cloud Functions. The app already ships the{' '}
          <strong>public</strong> key for offline verification. If downloads say “not configured”, the private key is
          missing from <code style={{ fontSize: 12 }}>functions/.env</code> (see{' '}
          <code style={{ fontSize: 12 }}>functions/ENV_README.md</code>).
        </p>
        <ol style={{ margin: 0, paddingLeft: '1.25em' }}>
          <li>
            Add <code style={{ fontSize: 12 }}>PPAF_ED25519_PRIVATE_KEY</code> to{' '}
            <code style={{ fontSize: 12 }}>functions/.env</code> (PEM from{' '}
            <code style={{ fontSize: 12 }}>node scripts/generate-ppaf-keys.mjs</code>, or match the embedded public key in{' '}
            <code style={{ fontSize: 12 }}>lib/ppafEmbeddedPublicKey.ts</code>).
          </li>
          <li>
            Deploy: <code style={{ fontSize: 12 }}>firebase deploy</code> — deploy reads{' '}
            <code style={{ fontSize: 12 }}>functions/.env</code> into the cloud (do not commit that file).
          </li>
          <li>
            Optional: set <code style={{ fontSize: 12 }}>NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY</code> to override the
            embedded public key after a key rotation.
          </li>
        </ol>
        <p style={{ margin: '10px 0 0', color: 'var(--text-dim)', fontSize: 12 }}>
          Never commit <code style={{ fontSize: 12 }}>functions/.env</code> — it contains secrets.
        </p>
      </div>
    </details>
  );
}
