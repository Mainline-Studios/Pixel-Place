'use client';

import { useEffect } from 'react';
import { Warning } from '@/types';

interface WarningModalProps {
  isOpen: boolean;
  warning: Warning | null;
  warningsThisMonth: number;
  onClose: () => void;
}

export default function WarningModal({ isOpen, warning, warningsThisMonth, onClose }: WarningModalProps) {
  useEffect(() => {
    const overlay = document.getElementById('warningModalOverlay');
    if (overlay) {
      if (isOpen) {
        overlay.classList.add('show');
      } else {
        overlay.classList.remove('show');
      }
    }
  }, [isOpen]);

  if (!isOpen || !warning) return null;

  const severityColor = warning.severity === 'high' ? '#ff4444' : 
                        warning.severity === 'medium' ? '#ff9800' : 
                        '#ffeb3b';
  
  const severityText = warning.severity === 'high' ? 'High Severity' :
                       warning.severity === 'medium' ? 'Medium Severity' :
                       'Low Severity';

  return (
    <div 
      id="warningModalOverlay" 
      className={isOpen ? 'show' : ''} 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000
      }}
    >
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a1a',
          border: `3px solid ${severityColor}`,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          color: 'white',
          boxShadow: `0 0 20px ${severityColor}50`
        }}
      >
        <h2 style={{ 
          color: severityColor, 
          marginTop: 0, 
          marginBottom: '16px',
          fontSize: '24px',
          textAlign: 'center'
        }}>
          ⚠️ Content Warning Issued
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <strong style={{ color: '#ffeb3b' }}>Your message:</strong>
            <div style={{ 
              marginTop: '8px', 
              padding: '8px',
              backgroundColor: '#1a1a1a',
              borderRadius: '4px',
              borderLeft: `3px solid ${severityColor}`,
              fontStyle: 'italic'
            }}>
              "{warning.message}"
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Violation Type:</strong> {warning.violation_type}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Severity:</strong> <span style={{ color: severityColor }}>{severityText}</span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>AI Score:</strong> {(warning.score * 100).toFixed(1)}% inappropriate
          </div>
          
          <div style={{ 
            backgroundColor: warningsThisMonth >= 2 ? '#ff4444' : '#ff9800',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '16px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ⚠️ You have {warningsThisMonth} warning{warningsThisMonth !== 1 ? 's' : ''} this month
            {warningsThisMonth >= 2 ? (
              <div style={{ marginTop: '8px', fontSize: '14px' }}>
                You have been automatically banned for multiple violations.
              </div>
            ) : (
              <div style={{ marginTop: '8px', fontSize: '14px' }}>
                2 warnings in the same month = automatic permanent ban
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            className="btn"
            onClick={onClose}
            style={{
              backgroundColor: severityColor,
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
