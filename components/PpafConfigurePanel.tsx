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
          Backup setup is managed by the app and deployment environment.
        </p>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 12 }}>
          Use “Create signed .ppaf file” to generate your backup.
        </p>
      </div>
    </details>
  );
}
