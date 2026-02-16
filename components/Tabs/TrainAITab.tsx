'use client';

import { useState, useEffect } from 'react';

interface TrainAITabProps {
  currentUser: string;
}

interface TrainingLogEntry {
  text: string;
  safe: boolean;
  score: number;
  timestamp: number;
}

export default function TrainAITab({ currentUser }: TrainAITabProps) {
  const [text, setText] = useState('');
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [trainingLog, setTrainingLog] = useState<TrainingLogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/moderation');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkScore = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentScore(data.score);
      }
    } catch (error) {
      console.error('Error checking score:', error);
    } finally {
      setLoading(false);
    }
  };

  const trainAI = async (safe: boolean) => {
    if (!text.trim()) {
      alert('Please enter text to train on');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/moderation/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          safe,
          category: 'phrases',
          username: currentUser
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentScore(data.newScore);
        
        // Add to training log
        setTrainingLog(prev => [{
          text,
          safe,
          score: data.newScore,
          timestamp: Date.now()
        }, ...prev.slice(0, 19)]); // Keep last 20 entries
        
        alert(data.message);
        loadStats(); // Refresh stats
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error training AI:', error);
      alert('Error training AI');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return '#ff4444';
    if (score >= 0.8) return '#ff9800';
    if (score >= 0.7) return '#ffeb3b';
    return '#4caf50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return 'High Risk - Definitely Inappropriate';
    if (score >= 0.8) return 'Medium Risk - Likely Inappropriate';
    if (score >= 0.7) return 'Low Risk - Possibly Inappropriate';
    return 'Safe - Allowed';
  };

  return (
    <div>
      {/* Stats Box */}
      {stats && (
        <div className="ai-box" style={{ marginBottom: '16px' }}>
          <div className="ai-label">AI System Statistics</div>
          <div className="ai-output">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ 
                padding: '12px', 
                background: 'var(--panel-soft)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                  {stats.stats?.totalItems || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Total Training Items</div>
              </div>
              <div style={{ 
                padding: '12px', 
                background: 'var(--panel-soft)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                  {stats.stats?.safeItems || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Safe Examples</div>
              </div>
              <div style={{ 
                padding: '12px', 
                background: 'var(--panel-soft)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4444' }}>
                  {stats.stats?.bannedItems || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Inappropriate Examples</div>
              </div>
              <div style={{ 
                padding: '12px', 
                background: 'var(--panel-soft)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00aaff' }}>
                  {stats.config?.banLine || 0.7}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Ban Threshold</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Interface */}
      <div className="ai-box" style={{ marginBottom: '16px' }}>
        <div className="ai-label">Train Pyx AI</div>
        <div className="ai-output">
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Text to Train On:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a phrase or message to train the AI..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--panel-soft)',
                color: 'var(--text)',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {currentScore !== null && (
            <div style={{
              padding: '16px',
              background: '#1a1a1a',
              borderRadius: '8px',
              marginBottom: '16px',
              border: `2px solid ${getScoreColor(currentScore)}`
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                Current AI Score: 
                <span style={{ color: getScoreColor(currentScore), marginLeft: '8px' }}>
                  {(currentScore * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ fontSize: '14px', color: getScoreColor(currentScore) }}>
                {getScoreLabel(currentScore)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={checkScore}
              disabled={loading || !text.trim()}
              style={{ 
                background: '#00aaff',
                flex: 1,
                minWidth: '150px'
              }}
            >
              {loading ? 'Checking...' : 'Check Current Score'}
            </button>
            <button
              className="btn"
              onClick={() => trainAI(true)}
              disabled={loading || !text.trim()}
              style={{ 
                background: '#4caf50',
                flex: 1,
                minWidth: '150px'
              }}
            >
              {loading ? 'Training...' : '✓ Mark as SAFE'}
            </button>
            <button
              className="btn"
              onClick={() => trainAI(false)}
              disabled={loading || !text.trim()}
              style={{ 
                background: '#ff4444',
                flex: 1,
                minWidth: '150px'
              }}
            >
              {loading ? 'Training...' : '✗ Mark as INAPPROPRIATE'}
            </button>
          </div>

          <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
            ℹ️ Training updates the neural network to recognize similar content in the future
          </div>
        </div>
      </div>

      {/* Training Log */}
      {trainingLog.length > 0 && (
        <div className="ai-box">
          <div className="ai-label">Recent Training ({trainingLog.length})</div>
          <div className="ai-output" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {trainingLog.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    background: '#1a1a1a',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${entry.safe ? '#4caf50' : '#ff4444'}`
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: entry.safe ? '#4caf50' : '#ff4444',
                      fontWeight: 'bold'
                    }}>
                      {entry.safe ? '✓ SAFE' : '✗ INAPPROPRIATE'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      Score: {(entry.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
                    "{entry.text}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
