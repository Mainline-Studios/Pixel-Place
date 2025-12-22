'use client';

import { useState, useRef, useEffect } from 'react';

interface AIExperimentTestProps {
  user?: any;
  onClose?: () => void;
}

export default function AIExperimentTest({ user, onClose }: AIExperimentTestProps) {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
        if (availableVoices.length > 0 && selectedVoice === 0) {
          const englishVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
          setSelectedVoice(availableVoices.indexOf(englishVoice));
        }
      };

      loadVoices();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = () => {
    if (!text.trim() || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voices[selectedVoice]) {
      utterance.voice = voices[selectedVoice];
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setHistory(prev => [text, ...prev.slice(0, 9)]);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      alert('Error speaking text. Please try again.');
    };
    synthRef.current.speak(utterance);
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const speakFromHistory = (text: string) => {
    setText(text);
    setTimeout(() => speak(), 100);
  };

  return (
    <div style={{
      background: 'var(--panel)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🤖 AI Experiment Test</h3>
        {onClose && (
          <button className="btn" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Close
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
          Enter text to speak:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something here and click 'Speak' to hear it..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            background: 'var(--panel-soft)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
            Voice:
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(Number(e.target.value))}
            disabled={isSpeaking}
            style={{
              width: '100%',
              padding: '8px',
              background: 'var(--panel-soft)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-main)',
              fontSize: '13px'
            }}
          >
            {voices.map((voice, index) => (
              <option key={index} value={index}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
            Rate: {rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            disabled={isSpeaking}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
            Pitch: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            disabled={isSpeaking}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            disabled={isSpeaking}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          className="btn"
          onClick={speak}
          disabled={!text.trim() || isSpeaking}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            flex: 1,
            background: isSpeaking ? 'var(--panel-alt)' : 'var(--accent)'
          }}
        >
          {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
        </button>
        <button
          className="btn"
          onClick={stop}
          disabled={!isSpeaking}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            background: 'var(--panel-alt)'
          }}
        >
          ⏹️ Stop
        </button>
      </div>

      {history.length > 0 && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
            Recent History (click to speak again):
          </label>
          <div style={{
            background: 'var(--panel-soft)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {history.map((item, index) => (
              <div
                key={index}
                onClick={() => speakFromHistory(item)}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  background: 'var(--panel)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--panel-alt)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--panel)'}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-dim)' }}>
        💡 <strong>Tip:</strong> This uses your browser's built-in text-to-speech. Different browsers and operating systems have different voices available.
      </div>
    </div>
  );
}
