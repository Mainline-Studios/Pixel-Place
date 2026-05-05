'use client';

import { useEffect, useRef, useState } from 'react';
import { User } from '@/types';
import { createReport } from '@/lib/storage';
import SafetyPrivacyPanel from '@/components/SafetyPrivacyPanel';
import { useSound } from '@/contexts/SoundContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useUser } from '@/contexts/UserContext';
import { apiUrl } from '@/lib/apiBaseUrl';

interface ReportTabProps {
  user: User;
  editMode: boolean;
}

export default function ReportTab({ user }: ReportTabProps) {
  const { updateUser } = useUser();
  const { soundsEnabled, setSoundsEnabled } = useSound();
  const { reduceMotion, setReduceMotion } = useAccessibility();
  const [reportedUsername, setReportedUsername] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [calmTheme, setCalmTheme] = useState(false);
  const [breathSeconds, setBreathSeconds] = useState(0);
  const [breathStep, setBreathStep] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [comfortMessage, setComfortMessage] = useState('');
  const [blockedWordsInput, setBlockedWordsInput] = useState('');
  const [blockedWords, setBlockedWords] = useState<string[]>(
    Array.isArray(user.chatBlockedWords) ? user.chatBlockedWords : [],
  );
  const [removingUnverifiedFriends, setRemovingUnverifiedFriends] = useState(false);
  const breakReminderRef = useRef<number | null>(null);

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
      alert('Please enter the username you want to report.');
      return;
    }
    if (!reason) {
      alert('Please select a reason for the report.');
      return;
    }
    if (!description.trim()) {
      alert('Please provide a description of the incident.');
      return;
    }

    if (reportedUsername.toLowerCase() === user.username.toLowerCase()) {
      alert('You cannot report yourself.');
      return;
    }

    try {
      await createReport(reportedUsername.trim(), user.username, reason, description.trim());
      setSubmitted(true);
      setReportedUsername('');
      setReason('');
      setDescription('');
      
      setTimeout(() => setSubmitted(false), 3000);
      alert('Report submitted successfully! An administrator will review it.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  useEffect(() => {
    if (breathSeconds <= 0) return;
    const tick = window.setInterval(() => {
      setBreathSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setBreathStep('inhale');
          setComfortMessage('Breathing reset complete. Nice work.');
          return 0;
        }
        const phase = next % 12;
        if (phase >= 8) setBreathStep('inhale');
        else if (phase >= 4) setBreathStep('hold');
        else setBreathStep('exhale');
        return next;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [breathSeconds]);

  useEffect(() => {
    return () => {
      if (breakReminderRef.current) {
        window.clearTimeout(breakReminderRef.current);
      }
    };
  }, []);

  const startBreathingReset = () => {
    setBreathSeconds(30);
    setBreathStep('inhale');
    setComfortMessage('Breathing reset started: inhale (4s), hold (4s), exhale (4s).');
  };

  const scheduleBreakReminder = () => {
    if (breakReminderRef.current) {
      window.clearTimeout(breakReminderRef.current);
      breakReminderRef.current = null;
    }
    setComfortMessage('Break reminder set for 20 minutes.');
    breakReminderRef.current = window.setTimeout(() => {
      alert('Comfort reminder: stand up, drink water, and rest your eyes for 30-60 seconds.');
      setComfortMessage('Break reminder completed.');
      breakReminderRef.current = null;
    }, 20 * 60 * 1000);
  };

  const enableDoNotDisturb = () => {
    setSoundsEnabled(false);
    setReduceMotion(true);
    setLargeText(true);
    setCalmTheme(true);
    setComfortMessage('Do Not Disturb preset enabled (quiet + reduced motion + calm theme + large text).');
  };

  const copySafetyNoteTemplate = async () => {
    const template =
      `Safety note template\n` +
      `- Username:\n` +
      `- Time (local):\n` +
      `- What happened:\n` +
      `- Evidence/details:\n` +
      `- Impact on you:\n` +
      `- Action requested:\n`;
    try {
      await navigator.clipboard.writeText(template);
      setComfortMessage('Safety note template copied to clipboard.');
    } catch {
      setComfortMessage('Could not copy template automatically. You can still write a report manually below.');
    }
  };

  const saveBlockedWords = async () => {
    const nextWords = Array.from(
      new Set(
        blockedWordsInput
          .split(',')
          .map((w) => w.trim().toLowerCase())
          .filter(Boolean),
      ),
    ).slice(0, 50);
    await updateUser({ chatBlockedWords: nextWords });
    setBlockedWords(nextWords);
    setBlockedWordsInput(nextWords.join(', '));
    setComfortMessage(
      nextWords.length
        ? `Saved ${nextWords.length} blocked chat word(s).`
        : 'Blocked words cleared. Messages will no longer be filtered by your custom list.',
    );
  };

  const removeBlockedWord = async (word: string) => {
    const nextWords = blockedWords.filter((w) => w !== word);
    await updateUser({ chatBlockedWords: nextWords });
    setBlockedWords(nextWords);
    setBlockedWordsInput(nextWords.join(', '));
    setComfortMessage(`Removed "${word}" from your blocked chat words.`);
  };

  const removeUnverifiedFriends = async () => {
    setRemovingUnverifiedFriends(true);
    try {
      const res = await fetch(apiUrl(`/api/friends?username=${encodeURIComponent(user.username)}`), {
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load friends');
      const friends = Array.isArray(data?.friends) ? data.friends : [];
      const unverified = friends.filter((f: any) => f?.emailVerified !== true);
      if (!unverified.length) {
        setComfortMessage('No unverified friends found.');
        return;
      }
      if (!confirm(`Remove ${unverified.length} unverified friend(s)?`)) return;

      let removed = 0;
      for (const friend of unverified) {
        const removeRes = await fetch(apiUrl('/api/friends'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'remove',
            fromUsername: user.username,
            toUsername: friend.username,
          }),
        });
        if (removeRes.ok) removed += 1;
      }
      setComfortMessage(`Removed ${removed} unverified friend(s).`);
    } catch (error: any) {
      setComfortMessage(String(error?.message || 'Failed to remove unverified friends'));
    } finally {
      setRemovingUnverifiedFriends(false);
    }
  };

  useEffect(() => {
    const current = Array.isArray(user.chatBlockedWords) ? user.chatBlockedWords : [];
    setBlockedWords(current);
    setBlockedWordsInput(current.join(', '));
  }, [user.chatBlockedWords]);

  return (
    <div style={{ fontSize: largeText ? 16 : undefined }}>
      <h2 className="section-title">🚨 Report a User</h2>

      <SafetyPrivacyPanel user={user} />

      <div
        className="ai-box"
        style={{
          marginBottom: 16,
          borderColor: calmTheme ? 'rgba(56, 189, 248, 0.45)' : undefined,
          background: calmTheme ? 'rgba(56, 189, 248, 0.07)' : undefined,
        }}
      >
        <div className="ai-label">Comfort tools</div>
        <div className="ai-output" style={{ fontSize: 14, lineHeight: 1.65 }}>
          <div style={{ marginBottom: 10 }}>
            Quick comfort controls for stressful moments. These are local to your current browser session.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" className="btn" onClick={() => setSoundsEnabled(!soundsEnabled)}>
              {soundsEnabled ? 'Enable Quiet Mode' : 'Disable Quiet Mode'}
            </button>
            <button type="button" className="btn" onClick={() => setReduceMotion(!reduceMotion)}>
              {reduceMotion ? 'Disable Reduce Motion' : 'Enable Reduce Motion'}
            </button>
            <button type="button" className="btn" onClick={() => setLargeText((v) => !v)}>
              {largeText ? 'Normal Text Size' : 'Large Text in Safety Tab'}
            </button>
            <button type="button" className="btn" onClick={() => setCalmTheme((v) => !v)}>
              {calmTheme ? 'Disable Calm Theme' : 'Enable Calm Theme'}
            </button>
            <button type="button" className="btn" onClick={startBreathingReset}>
              Start 30s Breathing Reset
            </button>
            <button type="button" className="btn" onClick={scheduleBreakReminder}>
              Remind Me in 20 Minutes
            </button>
            <button type="button" className="btn" onClick={enableDoNotDisturb}>
              Enable Do Not Disturb Preset
            </button>
            <button type="button" className="btn" onClick={copySafetyNoteTemplate}>
              Copy Safety Note Template
            </button>
          </div>
          {breathSeconds > 0 ? (
            <div style={{ marginTop: 10, color: '#bfdbfe' }}>
              Breathing guide: <strong>{breathStep.toUpperCase()}</strong> - {breathSeconds}s left
            </div>
          ) : null}
          {comfortMessage ? (
            <div style={{ marginTop: 10, color: '#86efac' }}>{comfortMessage}</div>
          ) : null}
        </div>
      </div>

      <div className="ai-box" style={{ marginBottom: 16 }}>
        <div className="ai-label">Chat safety word blocklist</div>
        <div className="ai-output" style={{ fontSize: 14, lineHeight: 1.65 }}>
          <div style={{ marginBottom: 10 }}>
            Add words you want blocked in direct chat. Outgoing messages containing these words are prevented, and incoming matches are masked for you.
          </div>
          <input
            type="text"
            value={blockedWordsInput}
            onChange={(e) => setBlockedWordsInput(e.target.value)}
            placeholder="comma,separated,words"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--panel-soft)',
              color: 'var(--text)',
              marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <button type="button" className="btn" onClick={saveBlockedWords}>
              Save blocked words
            </button>
            <button
              type="button"
              className="btn"
              onClick={removeUnverifiedFriends}
              disabled={removingUnverifiedFriends}
            >
              {removingUnverifiedFriends ? 'Removing unverified friends...' : 'Remove unverified friends'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                setBlockedWordsInput('');
                await updateUser({ chatBlockedWords: [] });
                setBlockedWords([]);
                setComfortMessage('Blocked chat words cleared.');
              }}
            >
              Clear all
            </button>
          </div>
          {blockedWords.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {blockedWords.map((word) => (
                <button
                  key={word}
                  type="button"
                  className="btn"
                  onClick={() => void removeBlockedWord(word)}
                  style={{ fontSize: 12, padding: '4px 8px' }}
                  title="Remove blocked word"
                >
                  {word} x
                </button>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>No blocked words set.</div>
          )}
        </div>
      </div>

      <div className="ai-box" style={{ marginBottom: 16 }}>
        <div className="ai-label">Safety first</div>
        <div className="ai-output" style={{ fontSize: 14, lineHeight: 1.65 }}>
          Reports are reviewed by moderators and kept confidential. If you or someone else is in immediate danger,
          contact local emergency services — Pixel Place is not a crisis hotline.
        </div>
      </div>

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
    </div>
  );
}
