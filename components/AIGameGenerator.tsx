'use client';

import { useState, useEffect } from 'react';
import { User, DraftGame } from '@/types';
import { getDraft, saveDraft } from '@/lib/storage';

interface AIGameGeneratorProps {
  user: User;
  onCodeGenerated?: (code: string) => void;
  onSwitchToCodeEditor?: () => void;
}

export default function AIGameGenerator({ user, onCodeGenerated, onSwitchToCodeEditor }: AIGameGeneratorProps) {
  const [draft, setDraft] = useState<DraftGame>({
    title: '',
    desc: '',
    owner: user.username,
    gameCode: ''
  });

  useEffect(() => {
    getDraft().then(setDraft).catch(() => {});
  }, []);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generationProvider, setGenerationProvider] = useState<string>('');

  const generateGameWithAI = async () => {
    const trimmedPrompt = aiPrompt.trim();

    // Require at least a paragraph (minimum 100 words or ~500 characters)
    if (!trimmedPrompt) {
      alert('Please enter a game description.');
      return;
    }

    const wordCount = trimmedPrompt.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = trimmedPrompt.length;

    if (wordCount < 50 || charCount < 250) {
      alert(`Please provide a more detailed description!\n\nYou provided ${wordCount} words (${charCount} characters).\n\nWe need at least 50 words (250+ characters) to generate a high-quality, comprehensive game.\n\nPlease describe:\n• Game type and genre\n• Core mechanics and gameplay\n• Controls and interactions\n• Visual style and aesthetics\n• Objectives and win conditions\n• Special features and effects\n\nA detailed description ensures the AI creates exactly what you want!`);
      return;
    }

    setIsGenerating(true);
    setGeneratedCode(null);

    try {
      const response = await fetch('/api/generate-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await response.json();

      if (data.code) {
        const code = data.code;
        setGeneratedCode(code);
        setGenerationProvider(data.provider || 'AI');

        // Update draft with generated code
        const updatedDraft = {
          ...draft,
          title: draft.title || 'AI Generated Game',
          desc: draft.desc || aiPrompt,
          owner: user.username,
          gameCode: code,
        };
        saveDraft(updatedDraft);
        setDraft(updatedDraft);

        // Notify parent component
        if (onCodeGenerated) {
          onCodeGenerated(code);
        }

        setIsGenerating(false);

        // Auto-switch to code editor if callback provided
        if (onSwitchToCodeEditor) {
          setTimeout(() => {
            onSwitchToCodeEditor();
          }, 100);
        }

        alert(`✅ Game generated successfully using ${data.provider || 'AI'}!\n\nYour game code is ready in the Code Editor. You can now:\n1. Review and customize the code\n2. Set up game name, description, and thumbnail\n3. Publish your game!`);
      } else {
        throw new Error(data.error || 'Failed to generate game');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      setIsGenerating(false);
      alert(`Error generating game: ${error.message}. Please try again or code manually.`);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) {
      alert('No code to copy.');
      return;
    }
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="ai-box">
        <div className="section-title" style={{ marginBottom: '16px' }}>🤖 AI Game Generator</div>
        <div className="ai-label">Describe Your Game in Detail (Minimum 50 words required)</div>
        <div className="smalltext" style={{ marginBottom: '8px', color: 'var(--text-dim)' }}>
          <strong>⚠️ IMPORTANT:</strong> You must provide at least 50 words (250+ characters) for the AI to generate a comprehensive, high-quality game.
          <br /><br />
          <strong>Include details about:</strong>
          <br />• Game type, genre, and setting
          <br />• Core gameplay mechanics and interactions
          <br />• Player controls (WASD, mouse, etc.)
          <br />• Visual style, colors, and aesthetics
          <br />• Objectives, goals, and win conditions
          <br />• Special features, effects, and polish
          <br />• Any specific requirements or constraints
          <br /><br />
          <strong>The more detail you provide, the better the generated game will match your vision!</strong>
        </div>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Example: Create a 3D racing game where players drive cars around a track. Include: WASD controls, multiple cars, a timer, checkpoints, and obstacles. Make it colorful and fun with particle effects when cars crash..."
          style={{
            width: '100%',
            minHeight: '150px',
            background: '#1a1d29',
            color: '#f2f2f5',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'inherit',
            fontSize: '14px',
            resize: 'vertical',
            lineHeight: '1.6'
          }}
        />
        <button
          className="btn"
          onClick={generateGameWithAI}
          disabled={isGenerating || !aiPrompt.trim()}
          style={{
            marginTop: '16px',
            width: '100%',
            fontSize: '16px',
            padding: '16px',
            fontWeight: 'bold',
            background: isGenerating ? 'var(--panel-alt)' : 'var(--accent-bg)',
            opacity: isGenerating || !aiPrompt.trim() ? 0.6 : 1,
            cursor: isGenerating || !aiPrompt.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? '⚙️ AI is Generating Your Massive Game... (This may take 60-120 seconds for 5000+ lines)' : '✨ Generate Complete 5000+ Line Game with AI'}
        </button>
        {isGenerating && (
          <div className="smalltext" style={{ marginTop: '12px', textAlign: 'center', color: 'var(--accent)' }}>
            ⏳ The AI is creating a massive, comprehensive 5000+ line game for you. This may take 60-120 seconds...
          </div>
        )}
        {!isGenerating && (
          <div className="smalltext" style={{ marginTop: '12px', padding: '12px', background: 'var(--panel-alt)', borderRadius: '8px' }}>
            <strong>💡 How it works:</strong>
            <br />
            • The AI will generate a MASSIVE, production-ready Three.js game (5000+ lines)
            <br />
            • Comprehensive game mechanics, polished visuals, and smooth gameplay
            <br />
            • Professional-quality code with advanced features and effects
            <br />
            • After generation, you&apos;ll automatically switch to Code Editor to review and customize
            <br />
            • You can then test, edit, and publish your game
          </div>
        )}
      </div>

      {generatedCode && !isGenerating && (
        <div className="ai-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div className="section-title" style={{ margin: 0 }}>
              ✅ Generated Code ({generationProvider})
            </div>
            <button className="btn" onClick={handleCopyCode}>
              📋 Copy Code
            </button>
          </div>
          <div className="smalltext" style={{ marginBottom: '8px', color: 'var(--accent)' }}>
            Code has been loaded into the Code Editor. You can review and customize it there.
          </div>
        </div>
      )}
    </div>
  );
}

