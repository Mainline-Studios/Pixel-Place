'use client';

import { useState, useRef } from 'react';
import { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { navigateToTab } from '@/lib/routing';

interface AICoderTabProps {
  user: User;
  editMode: boolean;
}

export default function AICoderTab({ user, editMode }: AICoderTabProps) {
  const [prompt, setPrompt] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const isDonor = user.isDonor || false;
  const maxUsage = isDonor ? Infinity : 10; // Limited for non-donors, unlimited for donors
  const remainingUses = isDonor ? 'Unlimited' : Math.max(0, maxUsage - usageCount);

  const generateCode = async () => {
    if (!prompt.trim()) return;
    
    if (!isDonor && usageCount >= maxUsage) {
      // Silently prevent usage, no popup
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI code generation
    setTimeout(() => {
      const exampleCode = `// Generated code for: ${prompt}
function ${prompt.toLowerCase().replace(/\s+/g, '_')}() {
  // Example function structure
  console.log('${prompt}');
  
  // Add your implementation here
  return {
    success: true,
    message: 'Code generated successfully'
  };
}

// Usage example:
${prompt.toLowerCase().replace(/\s+/g, '_')}();`;
      
      setCodeOutput(exampleCode);
      setIsGenerating(false);
      if (!isDonor) {
        setUsageCount(prev => prev + 1);
      }
      if (outputRef.current) {
        outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 1500);
  };

  const copyCode = () => {
    if (codeOutput && navigator.clipboard) {
      navigator.clipboard.writeText(codeOutput);
      // Visual feedback only, no popup
      const btn = document.querySelector('.copy-btn') as HTMLButtonElement;
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#4a6a2a';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 1000);
      }
    }
  };

  const clearCode = () => {
    setCodeOutput('');
    setPrompt('');
  };

  return (
    <>
      <h2 className="section-title">AI Coder</h2>
      
      {isDonor ? (
        <div className="ai-box" style={{ 
          background: 'linear-gradient(135deg, #2a3a1a 0%, #1a2a0a 100%)',
          borderColor: '#4a6a2a'
        }}>
          <div className="ai-label">✨ Full Access (Donor)</div>
          <div className="ai-output">
            You have <strong>unlimited</strong> access to the AI Coder. Generate code for any feature or game mechanic.
          </div>
        </div>
      ) : (
        <div className="ai-box">
          <div className="ai-label">Limited Access</div>
          <div className="ai-output">
            You have <strong>{remainingUses}</strong> uses remaining today.
            <br />
            <span style={{ fontSize: '12px', color: '#8b90a8' }}>
              Donate to unlock unlimited access and full AI Coder features.
            </span>
          </div>
        </div>
      )}

      <div className="ai-box">
        <div className="ai-label">Describe What You Want to Build</div>
        <textarea
          className="prop-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Create a function that spawns enemies, Make a coin collection system, Build a platformer jump mechanic..."
          style={{ 
            minHeight: '100px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
          disabled={!isDonor && usageCount >= maxUsage}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button 
            className="btn" 
            onClick={generateCode}
            disabled={!prompt.trim() || isGenerating || (!isDonor && usageCount >= maxUsage)}
            style={{ 
              background: !isDonor && usageCount >= maxUsage ? 'var(--panel-alt)' : '#4a90e2',
              opacity: (!isDonor && usageCount >= maxUsage) ? 0.5 : 1
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Code'}
          </button>
          {!isDonor && usageCount >= maxUsage && (
            <button 
              className="btn" 
              onClick={() => navigateToTab('donation')}
              style={{ background: '#4a6a2a' }}
            >
              Unlock Unlimited
            </button>
          )}
        </div>
        {!isDonor && usageCount >= maxUsage && (
          <div className="smalltext" style={{ marginTop: '8px', color: '#8b90a8' }}>
            Daily limit reached. Upgrade to donor status for unlimited access.
          </div>
        )}
      </div>

      {codeOutput && (
        <div className="ai-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="ai-label">Generated Code</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn copy-btn" onClick={copyCode} style={{ fontSize: '12px', padding: '6px 12px' }}>
                Copy Code
              </button>
              <button className="btn" onClick={clearCode} style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--panel-alt)' }}>
                Clear
              </button>
            </div>
          </div>
          <textarea
            ref={outputRef}
            className="prop-textarea"
            value={codeOutput}
            readOnly
            style={{ 
              minHeight: '300px',
              fontFamily: 'monospace',
              fontSize: '13px',
              background: '#0a0a0a',
              color: '#00ff00',
              border: '1px solid #333'
            }}
          />
          <div className="smalltext" style={{ marginTop: '8px' }}>
            Copy the code above and use it in your Studio or game project. Customize as needed for your specific use case.
          </div>
        </div>
      )}

      <div className="ai-box">
        <div className="ai-label">AI Coder Tips</div>
        <div className="ai-output" style={{ fontSize: '13px', lineHeight: '1.8' }}>
          • <strong>Be specific:</strong> &quot;Create a health bar UI&quot; works better than &quot;make a UI&quot;
          <br />• <strong>Include context:</strong> Mention if it&apos;s for 3D games, multiplayer, or specific mechanics
          <br />• <strong>Iterate:</strong> Generate code, test it, then ask for improvements
          <br />• <strong>Combine features:</strong> You can ask for multiple systems in one prompt
          <br />• <strong>Customize:</strong> The generated code is a starting point - modify it to fit your game
        </div>
      </div>

      {!isDonor && (
        <div className="ai-box" style={{ 
          background: 'linear-gradient(135deg, #3a2a1a 0%, #2a1a0a 100%)',
          borderColor: '#6a4a2a'
        }}>
          <div className="ai-label">Unlock Full Access</div>
          <div className="ai-output">
            Donate any amount to get <strong>unlimited AI Coder access</strong> plus bonus coins and exclusive features.
            <br />
            <div style={{ marginTop: '12px' }}>
              <a 
                href="/donation" 
                onClick={(e) => {
                  e.preventDefault();
                  navigateToTab('donation');
                }}
                style={{ 
                  display: 'inline-block',
                  padding: '10px 16px',
                  background: '#4a6a2a',
                  border: '1px solid #6a8a3a',
                  borderRadius: '10px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View Donation Options
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

