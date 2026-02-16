'use client';

import { useState, useEffect } from 'react';
import { Warning } from '@/types';
import { getSeverityColor } from '@/lib/moderationUtils';

interface WarningsTabProps {
  currentUser: string;
}

export default function WarningsTab({ currentUser }: WarningsTabProps) {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUsername, setFilterUsername] = useState('');
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);

  useEffect(() => {
    loadAllWarnings();
  }, []);

  const loadAllWarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/warnings?admin=true&limit=100');
      if (response.ok) {
        const data = await response.json();
        setWarnings(data.warnings || []);
      }
    } catch (error) {
      console.error('Error loading warnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserWarnings = async (username: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warnings?username=${encodeURIComponent(username)}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setWarnings(data.warnings || []);
      }
    } catch (error) {
      console.error('Error loading user warnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeWarning = async (warningId: string) => {
    if (!confirm('Are you sure you want to remove this warning?')) return;
    
    try {
      // NOTE: Passing username for auth is consistent with existing codebase patterns
      // but should be replaced with proper session auth in production
      const response = await fetch(`/api/warnings?id=${warningId}&admin=${currentUser}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setWarnings(prev => prev.filter(w => w.id !== warningId));
        alert('Warning removed successfully');
      } else {
        alert('Failed to remove warning');
      }
    } catch (error) {
      console.error('Error removing warning:', error);
      alert('Error removing warning');
    }
  };

  const handleFilter = () => {
    if (filterUsername.trim()) {
      loadUserWarnings(filterUsername.trim());
    } else {
      loadAllWarnings();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const groupedWarnings = warnings.reduce((acc, warning) => {
    if (!acc[warning.username]) {
      acc[warning.username] = [];
    }
    acc[warning.username].push(warning);
    return acc;
  }, {} as Record<string, Warning[]>);

  return (
    <div>
      <div className="ai-box" style={{ marginBottom: '16px' }}>
        <div className="ai-label">Filter Warnings</div>
        <div className="ai-output">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                Username (leave empty for all users):
              </label>
              <input
                type="text"
                value={filterUsername}
                onChange={(e) => setFilterUsername(e.target.value)}
                placeholder="Enter username"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel-soft)',
                  color: 'var(--text)'
                }}
              />
            </div>
            <button
              className="btn"
              onClick={handleFilter}
              style={{ padding: '10px 20px' }}
            >
              Filter
            </button>
            <button
              className="btn"
              onClick={loadAllWarnings}
              style={{ padding: '10px 20px', background: '#666' }}
            >
              Show All
            </button>
          </div>
        </div>
      </div>

      <div className="ai-box">
        <div className="ai-label">
          Warnings ({warnings.length} total, {Object.keys(groupedWarnings).length} users)
        </div>
        <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loading ? (
            <div className="smalltext">Loading warnings...</div>
          ) : warnings.length === 0 ? (
            <div className="smalltext">No warnings found.</div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(groupedWarnings).map(([username, userWarnings]) => (
                <div
                  key={username}
                  style={{
                    padding: '12px',
                    background: 'var(--panel-soft)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ 
                    fontWeight: 600, 
                    marginBottom: '8px',
                    fontSize: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{username}</span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: userWarnings.length >= 2 ? '#ff4444' : '#ff9800' 
                    }}>
                      {userWarnings.length} warning{userWarnings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {userWarnings.map((warning) => (
                    <div
                      key={warning.id}
                      style={{
                        padding: '10px',
                        background: '#1a1a1a',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        borderLeft: `3px solid ${getSeverityColor(warning.severity)}`
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            {formatDate(warning.timestamp)} • {warning.context}
                          </div>
                          <div style={{ 
                            fontStyle: 'italic', 
                            marginBottom: '8px',
                            padding: '8px',
                            background: '#0a0a0a',
                            borderRadius: '4px'
                          }}>
                            "{warning.message}"
                          </div>
                          <div style={{ fontSize: '12px', display: 'flex', gap: '12px' }}>
                            <span style={{ color: getSeverityColor(warning.severity) }}>
                              Severity: {warning.severity.toUpperCase()}
                            </span>
                            <span>Score: {(warning.score * 100).toFixed(1)}%</span>
                            <span>Type: {warning.violation_type}</span>
                            <span>Month: {warning.month}</span>
                          </div>
                        </div>
                        <button
                          className="btn"
                          onClick={() => removeWarning(warning.id)}
                          style={{
                            background: '#ff4444',
                            padding: '6px 12px',
                            fontSize: '12px',
                            marginLeft: '12px'
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
