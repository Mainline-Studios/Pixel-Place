'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, background: '#0f1117', color: '#f2f2f5' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#0f1117',
            color: '#f2f2f5',
          }}
        >
          <img
            src="/error-icon.png"
            alt="Application error"
            width={120}
            height={120}
            style={{ marginBottom: '24px', borderRadius: '16px' }}
          />
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px',
              color: '#ff4d4d',
            }}
          >
            Application Error
          </h1>
          <p
            style={{
              fontSize: '16px',
              marginBottom: '32px',
              color: '#8b90a8',
              textAlign: 'center',
              maxWidth: '500px',
            }}
          >
            {error.message || 'A critical error occurred'}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: 'linear-gradient(135deg, #2a2f45 0%, #3a415e 100%)',
                border: '1px solid #3a3f57',
                color: '#f2f2f5',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(0, 0, 0, .8), 0 0 20px rgba(255, 255, 255, .07)',
              }}
            >
              Try again
            </button>
            <a
              href="/games"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #00aa88 0%, #008866 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0, 170, 136, 0.4)',
              }}
            >
              Back to Games
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
