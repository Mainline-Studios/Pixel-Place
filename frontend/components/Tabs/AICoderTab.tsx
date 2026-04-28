'use client';

import { useState, useRef } from 'react';
import { User } from '@/types';
import { pyxCodeComplete } from '@/lib/pyx';

type CodeProvider = 'pyx' | 'template';

interface AICoderTabProps {
  user: User;
  editMode: boolean;
}

export default function AICoderTab({ user, editMode }: AICoderTabProps) {
  const [prompt, setPrompt] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState<CodeProvider>('pyx');
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const canGenerate = !!prompt.trim();

  const generateCode = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    if (provider === 'pyx') {
      const { completion, connectionError } = await pyxCodeComplete(prompt.trim(), 512);
      setIsGenerating(false);
      if (connectionError) {
        setCodeOutput('// Could not connect to Pyx AI Code. Check your connection or try the Template option.');
      } else {
        setCodeOutput(completion || '// No completion returned.');
      }
    } else {
      // Template (simulated)
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
      }, 1500);
    }

    if (outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
      
      <div className="ai-box">
        <div className="ai-label">Code provider</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="coderProvider"
              checked={provider === 'pyx'}
              onChange={() => setProvider('pyx')}
            />
            <span><strong>Pyx AI Code</strong></span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="coderProvider"
              checked={provider === 'template'}
              onChange={() => setProvider('template')}
            />
            <span><strong>Template</strong></span>
          </label>
        </div>
      </div>

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
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button 
            className="btn" 
            onClick={generateCode}
            disabled={!canGenerate || isGenerating}
            style={{ 
              background: !canGenerate ? 'var(--panel-alt)' : '#4a90e2',
              opacity: !canGenerate ? 0.5 : 1
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
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
    </>
  );
}

