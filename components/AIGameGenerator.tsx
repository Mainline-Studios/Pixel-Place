'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { User, DraftGame } from '@/types';
import { getDraft, saveDraft, saveUserMadeGame } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';
import { useUser } from '@/contexts/UserContext';

const GamePlayer = dynamic(() => import('@/components/GamePlayer'), { ssr: false });

type InputMode = 'direct' | 'conversation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AI_MODELS = [
  { id: 'template', name: 'Template (Smart)', cost: 0, desc: 'Free — quick template based on your description' },
  { id: 'groq-8b', name: 'Llama 3.1 8B', cost: 0, desc: 'Free — fast AI generation' },
  { id: 'groq-70b', name: 'Llama 3.3 70B', cost: 10, desc: '10 Pixel Coins — higher quality AI' },
] as const;

interface AIGameGeneratorProps {
  user: User;
  onCodeGenerated?: (code: string) => void;
  onSwitchToCodeEditor?: () => void;
}

export default function AIGameGenerator({ user, onCodeGenerated, onSwitchToCodeEditor }: AIGameGeneratorProps) {
  const { updateUser } = useUser();
  const [draft, setDraft] = useState<DraftGame>({
    title: '',
    desc: '',
    owner: user.username,
    gameCode: ''
  });

  useEffect(() => {
    getDraft().then(setDraft).catch(() => {});
  }, []);
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [aiPrompt, setAiPrompt] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('groq-8b');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generationProvider, setGenerationProvider] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const sendChatMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || isChatting) return;
    const userMsg: ChatMessage = { role: 'user', content: msg };
    setConversation((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);
    try {
      const messagesForApi = [...conversation, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi }),
      });
      const data = await response.json();
      if (data.content) {
        setConversation((prev) => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error(data.error || 'No response');
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setConversation((prev) => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  const buildPromptFromConversation = (): string => {
    const parts = conversation.map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`);
    return `Based on our conversation about the game design:\n\n${parts.join('\n\n')}\n\nGenerate the complete game code based on everything we discussed.`;
  };

  const getEffectivePrompt = (): string => {
    return inputMode === 'conversation' && conversation.length > 0
      ? buildPromptFromConversation()
      : aiPrompt.trim();
  };

  const generateGameWithAI = async () => {
    const effectivePrompt = getEffectivePrompt();

    if (!effectivePrompt) {
      alert(inputMode === 'conversation'
        ? 'Have a conversation first, or add some messages, then click Generate.'
        : 'Please enter a game description.');
      return;
    }

    // Relax requirement when using conversation
    const wordCount = effectivePrompt.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = effectivePrompt.length;
    const usingConversation = inputMode === 'conversation' && conversation.length > 0;
    if (!usingConversation && (wordCount < 50 || charCount < 250)) {
      alert(`Please provide a more detailed description!\n\nYou provided ${wordCount} words (${charCount} characters).\n\nWe need at least 50 words (250+ characters) to generate a high-quality, comprehensive game.\n\nPlease describe:\n• Game type and genre\n• Core mechanics and gameplay\n• Controls and interactions\n• Visual style and aesthetics\n• Objectives and win conditions\n• Special features and effects\n\nA detailed description ensures the AI creates exactly what you want!`);
      return;
    }

    const model = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[1];
    if (model.cost > 0 && (user.coins ?? 0) < model.cost) {
      alert(`Not enough Pixel Coins! This model costs ${model.cost} coins. You have ${user.coins ?? 0}.`);
      return;
    }

    setIsGenerating(true);
    setGeneratedCode(null);

    try {
      const response = await fetch(apiUrl('/api/generate-game'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: effectivePrompt, conversation: inputMode === 'conversation' ? conversation : undefined, model: selectedModel, username: user.username }),
      });

      const data = await response.json();

      if (data.code) {
        const code = data.code;
        setGeneratedCode(code);
        setGenerationProvider(data.provider || 'AI');

        // Update draft with generated code
        const gameTitle = draft.title || 'AI Generated Game';
        const gameDesc = draft.desc || effectivePrompt.slice(0, 200);
        const updatedDraft = {
          ...draft,
          title: gameTitle,
          desc: gameDesc,
          owner: user.username,
          gameCode: code,
        };
        saveDraft(updatedDraft);
        setDraft(updatedDraft);

        // Save to Games tab (user-made games) so it appears in the Games tab
        try {
          await saveUserMadeGame({
            id: `game_${Date.now()}`,
            title: gameTitle,
            desc: gameDesc,
            owner: user.username,
            ts: Date.now(),
            gameCode: code,
            gameType: 'code',
          });
        } catch (saveErr) {
          console.warn('Could not save to Games tab:', saveErr);
          // Still show success - draft is saved, user can publish manually
        }

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

        if (data.newCoins !== undefined && updateUser) {
          updateUser({ coins: data.newCoins });
        }

        setShowPreview(true);

        alert(`✅ Game generated successfully using ${data.provider || 'AI'}!\n\nPreview will open automatically. You can:\n1. Play your game in the preview\n2. Close preview to edit code in the Code Editor\n3. Set up game name, description, and thumbnail\n4. Publish your game!`);
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
        <div className="ai-label" style={{ marginBottom: '8px' }}>Input Mode</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            className="btn"
            onClick={() => setInputMode('direct')}
            style={{
              flex: 1,
              padding: '10px',
              background: inputMode === 'direct' ? 'var(--accent-bg)' : 'var(--panel-alt)',
              border: inputMode === 'direct' ? '2px solid var(--accent)' : '2px solid var(--border)',
            }}
          >
            Direct Prompt
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setInputMode('conversation')}
            style={{
              flex: 1,
              padding: '10px',
              background: inputMode === 'conversation' ? 'var(--accent-bg)' : 'var(--panel-alt)',
              border: inputMode === 'conversation' ? '2px solid var(--accent)' : '2px solid var(--border)',
            }}
          >
            Conversation
          </button>
        </div>
        <div className="ai-label" style={{ marginBottom: '12px' }}>AI Model</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {AI_MODELS.map((m) => (
            <label
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: selectedModel === m.id ? 'var(--accent-bg)' : 'var(--panel-alt)',
                border: selectedModel === m.id ? '2px solid var(--accent)' : '2px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="aiModel"
                value={m.id}
                checked={selectedModel === m.id}
                onChange={() => setSelectedModel(m.id)}
                disabled={m.cost > 0 && (user.coins ?? 0) < m.cost}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {m.name} {m.cost === 0 ? '🆓' : `🪙 ${m.cost}`}
                </div>
                <div className="smalltext" style={{ color: 'var(--text-dim)', marginTop: '2px' }}>{m.desc}</div>
              </div>
            </label>
          ))}
        </div>
        {inputMode === 'direct' ? (
          <>
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
          </>
        ) : (
          <>
            <div className="ai-label">Chat with AI to design your game</div>
            <div className="smalltext" style={{ marginBottom: '8px', color: 'var(--text-dim)' }}>
              Discuss your game idea with the AI. The conversation will be used as context when you click Generate.
            </div>
            <div style={{
              minHeight: '200px',
              maxHeight: '320px',
              overflowY: 'auto',
              background: '#1a1d29',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {conversation.length === 0 && (
                <div className="smalltext" style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  Start the conversation — describe your game idea and the AI will help you refine it.
                </div>
              )}
              {conversation.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: m.role === 'user' ? 'var(--accent-bg)' : 'var(--panel-alt)',
                    border: m.role === 'user' ? '1px solid var(--accent)' : '1px solid var(--border)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  <div className="smalltext" style={{ fontWeight: 600, marginBottom: '4px', opacity: 0.9 }}>
                    {m.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{m.content}</div>
                </div>
              ))}
              {isChatting && (
                <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: 'var(--panel-alt)', borderRadius: '12px' }}>
                  <span className="smalltext" style={{ opacity: 0.7 }}>Thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                placeholder="Type your message..."
                disabled={isChatting}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#1a1d29',
                  color: '#f2f2f5',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <button
                type="button"
                className="btn"
                onClick={sendChatMessage}
                disabled={isChatting || !chatInput.trim()}
              >
                Send
              </button>
            </div>
          </>
        )}
        <button
          className="btn"
          onClick={generateGameWithAI}
          disabled={isGenerating || (inputMode === 'direct' ? !aiPrompt.trim() : conversation.length === 0)}
          style={{
            marginTop: '16px',
            width: '100%',
            fontSize: '16px',
            padding: '16px',
            fontWeight: 'bold',
            background: isGenerating ? 'var(--panel-alt)' : 'var(--accent-bg)',
            opacity: isGenerating || (inputMode === 'direct' ? !aiPrompt.trim() : conversation.length === 0) ? 0.6 : 1,
            cursor: isGenerating || (inputMode === 'direct' ? !aiPrompt.trim() : conversation.length === 0) ? 'not-allowed' : 'pointer'
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={() => setShowPreview(true)}>
                ▶️ Preview Game
              </button>
              <button className="btn" onClick={handleCopyCode}>
                📋 Copy Code
              </button>
            </div>
          </div>
          <div className="smalltext" style={{ marginBottom: '8px', color: 'var(--accent)' }}>
            Code has been loaded into the Code Editor. Preview your game or edit the code.
          </div>
        </div>
      )}

      {showPreview && generatedCode && (
        <GamePlayer
          game={{
            title: 'AI Preview',
            gameCode: generatedCode,
            owner: user.username,
            desc: '',
            ts: Date.now(),
            id: 'ai-preview'
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

