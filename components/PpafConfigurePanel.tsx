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
          Signed backups need an Ed25519 key pair on the server. Without{' '}
          <code style={{ fontSize: 12 }}>PPAF_ED25519_PRIVATE_KEY</code> in Cloud Functions, downloads return “not
          configured”.
        </p>
        <ol style={{ margin: 0, paddingLeft: '1.25em' }}>
          <li>
            In the repo root run: <code style={{ fontSize: 12 }}>node scripts/generate-ppaf-keys.mjs</code>
          </li>
          <li>
            Put the <strong>private</strong> line into <code style={{ fontSize: 12 }}>functions/.env</code> as{' '}
            <code style={{ fontSize: 12 }}>PPAF_ED25519_PRIVATE_KEY</code> (same PEM the script prints; use{' '}
            <code style={{ fontSize: 12 }}>\n</code> escapes if pasting one line).
          </li>
          <li>
            Put the <strong>public</strong> line into your Next env (e.g. <code style={{ fontSize: 12 }}>.env.local</code>
            ) as <code style={{ fontSize: 12 }}>NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY</code> so browsers can verify backups
            offline.
          </li>
          <li>
            Deploy: <code style={{ fontSize: 12 }}>firebase deploy</code> (functions + hosting). See{' '}
            <code style={{ fontSize: 12 }}>functions/.env.example</code> and <code style={{ fontSize: 12 }}>.env.example</code>
            .
          </li>
        </ol>
        <p style={{ margin: '10px 0 0', color: 'var(--text-dim)', fontSize: 12 }}>
          Never commit the private key to git. The public key is safe to ship in the client bundle.
        </p>
      </div>
    </details>
  );
}
