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
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#0f1117',
          color: '#f2f2f5'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#ff4d4d'
          }}>
            Application Error
          </h1>
          <p style={{
            fontSize: '16px',
            marginBottom: '24px',
            color: '#8b90a8',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            {error.message || 'A critical error occurred'}
          </p>
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
              transition: 'all 0.2s'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
