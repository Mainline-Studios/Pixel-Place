'use client';

import { useEffect, useState } from 'react';

export type PixelPlaceMode = 'kids' | 'now' | 'unlimited';

const MODE_INFO: Record<PixelPlaceMode, {
  title: string;
  subtitle: string;
  description: string;
  games: string[];
  ageHint: string;
}> = {
  kids: {
    title: 'Kids',
    subtitle: '3D playful world',
    description: 'Bright, bouncy, and full of friendly adventures designed for younger players.',
    games: ['Hide and Seek', 'Star Catcher', 'Treasure Hunt', 'Bubble Bounce', 'Animal Friends', 'Pixel Paint', 'Fairy Garden', 'Magic Blocks'],
    ageHint: 'Ages 0–10 only',
  },
  now: {
    title: 'Now',
    subtitle: 'Minimalist and fun',
    description: 'Clean, fast, and playful. A modern Pixel Place experience for the middle crowd.',
    games: ['City Life', 'Gym Pump', 'Speed Runner', 'Musical Mayhem', 'Skate Park', 'Mystery Quest', 'Pixel Dunk', 'Battle Arcade'],
    ageHint: 'Ages 11–20',
  },
  unlimited: {
    title: 'Unlimited',
    subtitle: 'Mature pixel energy',
    description: 'Bold, grown-up play. Deeper challenges and a wider rulebook for older players.',
    games: ['Neon Arena', 'Night Racer', 'Mystery Mansion', 'Legends of Pixel', 'Heist Protocol', 'Dark City', 'Blackmarket', 'Underground Kings', 'Midnight Poker', 'Toxic Wasteland'],
    ageHint: 'Ages 21+',
  },
};

function getEligibleModes(age: number): PixelPlaceMode[] {
  if (!Number.isFinite(age) || age < 0) return [];
  if (age <= 10) return ['kids'];
  if (age <= 14) return ['kids', 'now'];
  if (age <= 20) return ['now'];
  return ['now', 'unlimited'];
}

function getAgeRequirement(mode: PixelPlaceMode): string {
  switch (mode) {
    case 'kids':
      return 'Ages 0–10 only';
    case 'now':
      return 'Ages 11–20';
    case 'unlimited':
      return 'Ages 21+';
  }
}

export default function ModeSelection({
  username,
  onSelect,
}: {
  username: string;
  onSelect: (mode: PixelPlaceMode) => void;
}) {
  const [age, setAge] = useState('');
  const [stage, setStage] = useState<'input' | 'checking' | 'choose'>('input');
  const [eligibleModes, setEligibleModes] = useState<PixelPlaceMode[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (stage === 'checking' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [stage, countdown]);

  const handleCheck = () => {
    const parsed = Number(age);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 120) {
      setError('Enter a valid age between 0 and 120.');
      return;
    }
    setError('');
    setStage('checking');
    const delayMs = 2000 + Math.round(Math.random() * 3000);
    setCountdown(Math.ceil(delayMs / 1000));
    setStatus('Checking eligibility');
    setEligibleModes([]);
    const timeout = window.setTimeout(() => {
      const eligible = getEligibleModes(parsed);
      setEligibleModes(eligible);
      setStage('choose');
      setStatus(`Ready! You are eligible for ${eligible.length === 1 ? eligible[0] : eligible.length === 2 ? `${eligible[0]} and ${eligible[1]}` : eligible[0]}.`);
      localStorage.setItem(`pixelplace_modeAge:${username}`, String(parsed));
    }, delayMs);
    return () => window.clearTimeout(timeout);
  };

  const handleSelect = (mode: PixelPlaceMode) => {
    onSelect(mode);
    localStorage.setItem(`pixelplace_modeSelection:${username}`, mode);
  };

  return (
    <div className="mode-selection-overlay" role="dialog" aria-modal="true">
      <div className="mode-selection-card">
        <div className="mode-selection-header">
          <h2>Choose your Pixel Place mode</h2>
          <p>Enter your age to see which modes are available for you.</p>
        </div>

        {stage === 'input' && (
          <div className="mode-selection-input-stage">
            <label htmlFor="mode-age-input">Your age</label>
            <input
              id="mode-age-input"
              type="number"
              min="0"
              max="120"
              value={age}
              onChange={(event) => setAge(event.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter your age"
            />
            <button className="mode-selection-button" type="button" onClick={handleCheck}>
              Check eligibility
            </button>
            {error ? <div className="mode-selection-error">{error}</div> : null}
          </div>
        )}

        {stage === 'checking' && (
          <div className="mode-selection-wait">
            <div className="mode-selection-spinner" aria-hidden="true" />
            <p>{status}…</p>
            <p style={{ opacity: 0.75, marginTop: 8 }}>Please wait {countdown}s</p>
          </div>
        )}

        {stage === 'choose' && (
          <>
            <div className="mode-selection-ready">
              <p>{status}</p>
              <button
                className="mode-selection-change-age"
                type="button"
                onClick={() => {
                  setStage('input');
                  setStatus('');
                }}
              >
                Change age
              </button>
            </div>
            <div className="mode-selection-grid">
              {(Object.keys(MODE_INFO) as PixelPlaceMode[]).map((mode) => {
                const info = MODE_INFO[mode];
                const eligible = eligibleModes.includes(mode);
                return (
                  <div
                    key={mode}
                    className={`mode-selection-card-item mode-${mode} ${eligible ? 'eligible' : 'ineligible'}`}
                  >
                    <div className="mode-selection-badge">{info.title}</div>
                    <div className="mode-selection-subtitle">{info.subtitle}</div>
                    <p className="mode-selection-description">{info.description}</p>
                    <ul className="mode-selection-games">
                      {info.games.map((game) => (
                        <li key={game}>{game}</li>
                      ))}
                    </ul>
                    <div className="mode-selection-age-label">{getAgeRequirement(mode)}</div>
                    <button
                      className="mode-selection-card-button"
                      type="button"
                      disabled={!eligible}
                      onClick={() => handleSelect(mode)}
                    >
                      {eligible ? `Select ${info.title}` : 'Not available'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
