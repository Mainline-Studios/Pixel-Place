'use client';

import React, { useState, useEffect } from 'react';

const SESSION_KEY = 'pixelPlaceLoginNoticeSeen';

export default function LoginNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      setShow(true);
    } catch {
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
      className="login-notice-overlay"
      onClick={dismiss}
      role="dialog"
      aria-labelledby="login-notice-title"
      aria-modal="true"
    >
      <div className="login-notice-card" onClick={(e) => e.stopPropagation()}>
        <div className="login-notice-icon" aria-hidden>
          💬
        </div>
        <h2 id="login-notice-title" className="login-notice-title">
          Quick heads-up
        </h2>
        <p className="login-notice-text">
          Some users who have logged in over the last month may run into trouble signing in right now. We’re on it and fixing things as fast as we can. Thanks for your patience — we’re sorry for any hassle.
        </p>
        <button
          type="button"
          className="login-notice-btn"
          onClick={dismiss}
          autoFocus
        >
          Got it, thanks
        </button>
      </div>
      <style jsx>{`
        .login-notice-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: loginNoticeFadeIn 0.2s ease-out;
        }
        .login-notice-card {
          background: linear-gradient(145deg, #2a2e3d 0%, #1e212e 100%);
          border-radius: 16px;
          padding: 24px 28px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06);
          text-align: center;
          animation: loginNoticeSlide 0.25s ease-out;
        }
        .login-notice-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
          line-height: 1;
        }
        .login-notice-title {
          margin: 0 0 12px;
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--text, #f2f2f5);
          letter-spacing: -0.02em;
        }
        .login-notice-text {
          margin: 0 0 20px;
          font-size: 0.95rem;
          line-height: 1.55;
          color: rgba(242, 242, 245, 0.9);
        }
        .login-notice-btn {
          display: inline-block;
          padding: 10px 24px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          background: linear-gradient(180deg, #7dd3fc 0%, #38bdf8 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.2s;
        }
        .login-notice-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(56, 189, 248, 0.35);
        }
        .login-notice-btn:active {
          transform: translateY(0);
        }
        @keyframes loginNoticeFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes loginNoticeSlide {
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

