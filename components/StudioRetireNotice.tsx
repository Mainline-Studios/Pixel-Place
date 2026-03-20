'use client';

import React, { useEffect, useState } from 'react';

const SESSION_KEY = 'pixelPlaceStudioRetireNoticeSeen';

export default function StudioRetireNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      setShow(true);
    } catch {
      // If storage is blocked, don't block the studio.
      setShow(false);
    }
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="studio-retire-overlay"
      onClick={dismiss}
      role="dialog"
      aria-labelledby="studio-retire-title"
      aria-modal="true"
    >
      <div className="studio-retire-card" onClick={(e) => e.stopPropagation()}>
        <div className="studio-retire-icon" aria-hidden>
          🎨
        </div>
        <h2 id="studio-retire-title" className="studio-retire-title">
          Studio update
        </h2>
        <p className="studio-retire-text">
          The Studio tab will be retired soon, and a new exciting Studio is coming sooh. Thanks for building with us!
        </p>
        <button type="button" className="studio-retire-btn" onClick={dismiss} autoFocus>
          Got it!
        </button>
      </div>

      <style jsx>{`
        .studio-retire-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
          animation: studioRetireFadeIn 0.2s ease-out;
        }
        .studio-retire-card {
          background: linear-gradient(145deg, #2a2e3d 0%, #1e212e 100%);
          border-radius: 16px;
          padding: 22px 26px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06);
          text-align: center;
          animation: studioRetireSlide 0.25s ease-out;
        }
        .studio-retire-icon {
          font-size: 2.2rem;
          margin-bottom: 10px;
          line-height: 1;
        }
        .studio-retire-title {
          margin: 0 0 10px;
          font-size: 1.25rem;
          font-weight: 650;
          color: var(--text, #f2f2f5);
          letter-spacing: -0.02em;
        }
        .studio-retire-text {
          margin: 0 0 18px;
          font-size: 0.95rem;
          line-height: 1.55;
          color: rgba(242, 242, 245, 0.9);
        }
        .studio-retire-btn {
          display: inline-block;
          padding: 10px 22px;
          font-size: 0.95rem;
          font-weight: 650;
          color: #1a1d29;
          background: linear-gradient(180deg, #a7f3d0 0%, #34d399 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.2s;
        }
        .studio-retire-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(52, 211, 153, 0.25);
        }
        .studio-retire-btn:active {
          transform: translateY(0);
        }
        @keyframes studioRetireFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes studioRetireSlide {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

