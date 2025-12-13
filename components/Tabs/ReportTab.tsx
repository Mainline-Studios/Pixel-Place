'use client';

import { useState } from 'react';
import { User } from '@/types';
import { createReport } from '@/lib/storage';

import { toast } from '@/lib/toast';
interface ReportTabProps {
  user: User;
  editMode: boolean;
}

export default function ReportTab({ user }: ReportTabProps) {
  const [reportedUsername, setReportedUsername] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    'Harassment',
    'Inappropriate Content',
    'Cheating/Exploiting',
    'Spam',
    'Impersonation',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!reportedUsername.trim()) {
      toast.info('Please enter the username you want to report.'');
      return;
    }
    if (!reason) {
      toast.info('Please select a reason for the report.'');
      return;
    }
    if (!description.trim()) {
      toast.info('Please provide a description of the incident.'');
      return;
    }

    if (reportedUsername.toLowerCase() === user.username.toLowerCase()) {
      toast.info('You cannot report yourself.'');
      return;
    }

    try {
      await createReport(reportedUsername.trim(), user.username, reason, description.trim());
      setSubmitted(true);
      setReportedUsername('');
      setReason('');
      setDescription('');
      
      setTimeout(() => setSubmitted(false), 3000);
      toast.info('Report submitted successfully! An administrator will review it.'');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Error submitting report. Please try again.'');
    }
  };

  return (
    <>
      <h2 className="section-title">🚨 Report a User</h2>

      <div className="ai-box">
        <div className="ai-label">Submit a Report</div>
        <div className="ai-output">
          {submitted ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              background: 'rgba(46, 204, 113, 0.1)',
              borderRadius: '8px',
              color: '#2ecc71',
              fontWeight: 600
            }}>
              ✓ Report submitted successfully!
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Username to Report:
                </label>
                <input
                  type="text"
                  value={reportedUsername}
                  onChange={(e) => setReportedUsername(e.target.value)}
                  placeholder="Enter the username you want to report"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--panel-soft)',
                    color: 'var(--text)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Reason for Report:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {reportReasons.map((r) => (
                    <button
                      key={r}
                      className="btn"
                      onClick={() => setReason(r)}
                      style={{
                        background: reason === r ? 'var(--accent)' : 'var(--panel-alt)',
                        padding: '10px',
                        fontSize: '13px'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Description (Required):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about the incident. Be as specific as possible."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--panel-soft)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div className="smalltext" style={{ marginTop: '4px', color: 'var(--text-dim)' }}>
                  {description.length} characters
                </div>
              </div>

              <button
                className="btn"
                onClick={handleSubmit}
                disabled={!reportedUsername.trim() || !reason || !description.trim()}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: 'var(--accent)',
                  opacity: (!reportedUsername.trim() || !reason || !description.trim()) ? 0.5 : 1
                }}
              >
                Submit Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="ai-box" style={{ marginTop: '20px' }}>
        <div className="ai-label">Report Guidelines</div>
        <div className="ai-output" style={{ fontSize: '13px', lineHeight: '1.8' }}>
          <strong>Before submitting a report, please note:</strong>
          <br />
          • Reports are reviewed by administrators
          <br />
          • False reports may result in action against your account
          <br />
          • Provide as much detail as possible
          <br />
          • Reports are confidential and only visible to administrators
          <br />
          • You will not receive a direct response, but action will be taken if warranted
        </div>
      </div>
    </>
  );
}
