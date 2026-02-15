'use client';

import { useEffect, useMemo, useState } from 'react';

interface HypnosiaProps {
  onClose?: () => void;
}

type LogEntry = {
  question: string;
  answer: string;
  time: string;
};

type Rule = {
  id: string;
  name: string;
  description: string; // for reveal
  hint: string;
  category: string;
  responder: (q: string) => string;
};

/**
 * Pre-made themed rules grouped into categories requested:
 * Movies, Cartoons, Singers, Animals, Misc.
 *
 * Each rule is a deterministic responder function that produces
 * an answer based on the player's question.
 */
const MOVIE_KEYWORDS = [
  'star', 'war', 'matrix', 'alien', 'ring', 'jaws', 'rocky', 'godfather', 'titanic', 'inception'
];

const CARTOON_KEYWORDS = [
  'spongebob', 'tom', 'jerry', 'mickey', 'donald', 'pikachu', 'scooby', 'simpson', 'scooby-doo'
];

const SINGER_KEYWORDS = [
  'madonna', 'beyonce', 'elvis', 'celine', 'swift', 'drake', 'rihanna', 'adele'
];

const ANIMAL_KEYWORDS = [
  'cat', 'dog', 'lion', 'tiger', 'elephant', 'whale', 'bird', 'shark', 'fox', 'bear'
];

const RULES: Rule[] = [
  // Movies
  {
    id: 'movie-keyword-present',
    name: 'Movie Keyword Detector',
    category: 'Movies',
    description: `Answers "Yes" if your question contains any common movie-related keyword (e.g. ${MOVIE_KEYWORDS.slice(0,4).join(', ')}), otherwise "No".`,
    hint: 'Try words that might appear in film titles.',
    responder: (q) => (MOVIE_KEYWORDS.some(k => q.toLowerCase().includes(k)) ? 'Yes.' : 'No.'),
  },
  {
    id: 'movie-word-count-odd',
    name: 'Movie Word Count Odd',
    category: 'Movies',
    description: 'Answers "Yes" if the number of words in your question is odd, otherwise "No". (A structural rule useful when exploring titles and phrases.)',
    hint: 'Count the words in your question.',
    responder: (q) => {
      const cnt = q.trim() ? q.trim().split(/\s+/).length : 0;
      return cnt % 2 === 1 ? 'Yes.' : 'No.';
    },
  },
  {
    id: 'movie-ends-with-film',
    name: 'Ends With "Film" Echo',
    category: 'Movies',
    description: 'If your question ends with the word "film" (case-insensitive), the subject replies "Film." Otherwise replies "Not film."',
    hint: 'Try ending your question with a single word you suspect.',
    responder: (q) => q.trim().toLowerCase().endsWith('film') ? 'Film.' : 'Not film.',
  },

  // Cartoons
  {
    id: 'cartoon-name-detect',
    name: 'Cartoon Name Detector',
    category: 'Cartoons',
    description: `Answers "Yes" if your question contains a common cartoon character name (e.g. ${CARTOON_KEYWORDS.slice(0,4).join(', ')}), otherwise "No".`,
    hint: 'Mention character names you suspect.',
    responder: (q) => (CARTOON_KEYWORDS.some(k => q.toLowerCase().includes(k)) ? 'Yes.' : 'No.'),
  },
  {
    id: 'cartoon-exclaim',
    name: 'Cartoon Excitement',
    category: 'Cartoons',
    description: 'Replies "!" if your question contains an exclamation mark, otherwise replies "..."',
    hint: 'Punctuation alters the response.',
    responder: (q) => (q.includes('!') ? '!' : '...'),
  },
  {
    id: 'cartoon-last-word',
    name: 'Cartoon Last Word Repeater',
    category: 'Cartoons',
    description: 'Repeats the last word of your question (punctuation removed).',
    hint: 'The final word matters.',
    responder: (q) => {
      const words = q.trim().split(/\s+/);
      if (!words.length) return '...';
      const last = words[words.length - 1].replace(/[?.,!;:]+$/g, '');
      return last ? `${last}.` : '...';
    },
  },

  // Singers
  {
    id: 'singer-name-detect',
    name: 'Singer Name Detector',
    category: 'Singers',
    description: `Answers "Yes" if your question contains any popular singer name (e.g. ${SINGER_KEYWORDS.slice(0,4).join(', ')}), otherwise "No".`,
    hint: 'Try typing artist names you think of.',
    responder: (q) => (SINGER_KEYWORDS.some(k => q.toLowerCase().includes(k)) ? 'Yes.' : 'No.'),
  },
  {
    id: 'singer-vowel-first',
    name: 'Singer Vowel-First',
    category: 'Singers',
    description: 'Answers "Yes" if the first letter of your question is a vowel, otherwise "No".',
    hint: 'Look at the first character.',
    responder: (q) => {
      const ch = q.trim().charAt(0).toLowerCase();
      return 'aeiou'.includes(ch) ? 'Yes.' : 'No.';
    },
  },
  {
    id: 'singer-word-length',
    name: 'Singer Long Word Check',
    category: 'Singers',
    description: 'If any word in the question has length >= 6 the subject answers "Yes", else "No".',
    hint: 'Try longer or shorter words.',
    responder: (q) => {
      const words = q.trim().split(/\s+/).filter(Boolean);
      return words.some(w => w.length >= 6) ? 'Yes.' : 'No.';
    },
  },

  // Animals
  {
    id: 'animal-name-detect',
    name: 'Animal Name Detector',
    category: 'Animals',
    description: `Answers "Yes" if the question contains a common animal name (e.g. ${ANIMAL_KEYWORDS.slice(0,4).join(', ')}), otherwise "No".`,
    hint: 'Try animal words (cat, dog, lion...).',
    responder: (q) => (ANIMAL_KEYWORDS.some(k => q.toLowerCase().includes(k)) ? 'Yes.' : 'No.'),
  },
  {
    id: 'animal-plural',
    name: 'Plural or Not',
    category: 'Animals',
    description: 'Answers "Yes" if the last word in your question is plural (ends with "s"), otherwise "No".',
    hint: 'Try singular vs plural nouns at the end.',
    responder: (q) => {
      const words = q.trim().split(/\s+/);
      if (!words.length) return 'No.';
      const last = words[words.length - 1].replace(/[?.,!;:]+$/g, '').toLowerCase();
      return last.endsWith('s') ? 'Yes.' : 'No.';
    },
  },
  {
    id: 'animal-length-even',
    name: 'Animal Letter Parity',
    category: 'Animals',
    description: 'Answers "Yes" if the total number of letters (letters only) in the question is even, otherwise "No".',
    hint: 'Count letters only.',
    responder: (q) => {
      const lettersOnly = q.replace(/[^a-zA-Z]/g, '');
      return (lettersOnly.length % 2 === 0) ? 'Yes.' : 'No.';
    },
  },

  // Misc (general / fun / structural rules)
  {
    id: 'always-yes',
    name: 'Always Affirm',
    category: 'Misc',
    description: 'Always replies "Yes".',
    hint: 'They agree with everything.',
    responder: () => 'Yes.',
  },
  {
    id: 'contains-digit',
    name: 'Contains Digit',
    category: 'Misc',
    description: 'Answers "Yes" if your question contains a digit 0-9, otherwise "No".',
    hint: 'Type numbers to test this rule.',
    responder: (q) => (/\d/.test(q) ? 'Yes.' : 'No.'),
  },
  {
    id: 'palindrome',
    name: 'Palindrome Detector',
    category: 'Misc',
    description: 'Answers "Yes" if the letters+digits of your question form a palindrome, otherwise "No".',
    hint: 'Try symmetric phrases.',
    responder: (q) => {
      const s = q.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!s) return 'No.';
      return s === s.split('').reverse().join('') ? 'Yes.' : 'No.';
    },
  },
];

export default function Hypnosia({ onClose }: HypnosiaProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Hypnosia.tsx:205',message:'Hypnosia render start',data:{hasOnClose:!!onClose},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const categories = useMemo(() => {
    const cats = Array.from(new Set(RULES.map((r) => r.category)));
    return ['All Categories', ...cats];
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [secret, setSecret] = useState<Rule | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [guess, setGuess] = useState<string>('');
  const [questionsLeft, setQuestionsLeft] = useState<number>(20);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Hypnosia.tsx:221',message:'useEffect called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const startNewGame = (category?: string) => {
    const cat = category ?? selectedCategory ?? 'All Categories';
    const pool = cat === 'All Categories' ? RULES : RULES.filter((r) => r.category === cat);
    if (pool.length === 0) {
      setMessage('No rules available for that category.');
      return;
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setSecret(chosen);
    setLog([]);
    setQuestion('');
    setGuess('');
    setQuestionsLeft(20);
    setHintUsed(false);
    setGameOver(false);
    setMessage(`Game started. Category: ${cat}`);
  };

  const ask = () => {
    if (gameOver) return;
    const q = question.trim();
    if (!q) {
      setMessage('Please type a question first.');
      return;
    }
    if (!secret) return;
    const answer = secret.responder(q);
    const entry: LogEntry = { question: q, answer, time: timeNow() };
    setLog((s) => [entry, ...s]);
    setQuestion('');
    setQuestionsLeft((n) => Math.max(0, n - 1));
    setMessage(null);

    if (questionsLeft - 1 <= 0) {
      setGameOver(true);
      setMessage('You have used all your questions. Make your final guess or reveal the rule.');
    }
  };

  const makeGuess = () => {
    if (!secret) return;
    const g = guess.trim().toLowerCase();
    if (!g) {
      setMessage('Please type a guess.');
      return;
    }
    const normalizedSecret = secret.name.toLowerCase();
    const matched =
      normalizedSecret.includes(g) ||
      g.includes(normalizedSecret) ||
      normalizedSecret.split(' ').some((w) => w && g.includes(w));
    if (matched) {
      setGameOver(true);
      setMessage(`Correct! The rule was: "${secret.name}".`);
      setLog((s) => [{ question: 'GUESS', answer: `Guessed: ${guess} — CORRECT`, time: timeNow() }, ...s]);
    } else {
      setQuestionsLeft((n) => Math.max(0, n - 1));
      setLog((s) => [{ question: 'GUESS', answer: `Guessed: ${guess} — WRONG`, time: timeNow() }, ...s]);
      setMessage(`Not correct.`);
      if (questionsLeft - 1 <= 0) {
        setGameOver(true);
        setMessage('No questions left — reveal the rule or try again.');
      }
    }
  };

  const reveal = () => {
    if (!secret) return;
    setGameOver(true);
    setMessage(`Revealed: "${secret.name}" — ${secret.description}`);
    setLog((s) => [{ question: 'REVEAL', answer: `${secret.name}: ${secret.description}`, time: timeNow() }, ...s]);
  };

  const useHint = () => {
    if (!secret) return;
    if (hintUsed) {
      setMessage('Hint already used.');
      return;
    }
    setHintUsed(true);
    setQuestionsLeft((n) => Math.max(0, n - 3)); // using hint costs 3 questions
    setMessage(`Hint: ${secret.hint} (costs 3 questions)`);
  };

  const filteredPoolCount = useMemo(() => {
    return selectedCategory === 'All Categories' ? RULES.length : RULES.filter((r) => r.category === selectedCategory).length;
  }, [selectedCategory]);

  return (
    <div style={{
      background: 'var(--panel)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      maxWidth: '860px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🧠 Hypnosia — The Psychologist Game</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)' }}
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={() => startNewGame(selectedCategory)} style={{ padding: '6px 10px', fontSize: '12px' }}>
            Start Game
          </button>
          {onClose && <button className="btn" onClick={onClose} style={{ padding: '6px 10px', fontSize: '12px' }}>Close</button>}
        </div>
      </div>

      <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-dim)' }}>
        Instructions: Ask short questions to deduce the hidden rule. The game will pick a random rule from the chosen category.
        You have <strong>{questionsLeft}</strong> questions left. Hint costs 3 questions. Rules available in this category: <strong>{filteredPoolCount}</strong>.
      </div>

      {message && (
        <div style={{
          padding: '12px',
          background: 'rgba(52, 152, 219, 0.08)',
          borderRadius: '8px',
          marginBottom: '12px',
          color: 'var(--text)',
          fontWeight: 600
        }}>{message}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question (e.g. 'Is it a lion?')"
            disabled={gameOver}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--panel-soft)',
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
          />
          <button className="btn" onClick={ask} disabled={gameOver} style={{ padding: '10px 12px' }}>Ask</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Make a guess of the rule"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--panel-soft)',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') makeGuess(); }}
            />
            <button className="btn" onClick={makeGuess} style={{ padding: '10px 12px' }}>Guess</button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" onClick={useHint} disabled={hintUsed || gameOver} style={{ padding: '8px 12px' }}>
              {hintUsed ? 'Hint Used' : 'Hint (-3)'}
            </button>
            <button className="btn" onClick={reveal} style={{ padding: '8px 12px' }}>Reveal</button>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '12px'
      }}>
        <div style={{
          background: 'var(--panel-soft)',
          borderRadius: '10px',
          padding: '12px',
          border: '1px solid var(--border)',
          maxHeight: '360px',
          overflow: 'auto'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Conversation</div>
          {log.length === 0 && <div style={{ color: 'var(--text-dim)' }}>No questions yet — ask something!</div>}
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '8px' }}>
            {log.map((entry, idx) => (
              <div key={idx} style={{
                borderRadius: '8px',
                padding: '8px',
                background: 'white',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{entry.question}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{entry.answer}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', minWidth: 70, textAlign: 'right' }}>{entry.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--panel-soft)',
          borderRadius: '10px',
          padding: '12px',
          border: '1px solid var(--border)',
          maxHeight: '360px',
          overflow: 'auto'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Status</div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '14px' }}><strong>Questions left:</strong> {questionsLeft}</div>
            <div style={{ fontSize: '14px' }}><strong>Hint used:</strong> {hintUsed ? 'Yes' : 'No'}</div>
            <div style={{ fontSize: '14px' }}><strong>Game over:</strong> {gameOver ? 'Yes' : 'No'}</div>
            <div style={{ fontSize: '14px' }}><strong>Selected category:</strong> {selectedCategory}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Rules in category: {filteredPoolCount}
            </div>
          </div>

          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Tips</div>
          <ul style={{ marginTop: 0, color: 'var(--text-dim)' }}>
            <li>Ask short, focused questions (yes/no works best).</li>
            <li>Test different words from the theme (movie titles, animal names, singer names).</li>
            <li>Use hints when stuck — they cost questions.</li>
          </ul>

          <div style={{ marginTop: '12px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Sample rules by category</div>
            {Array.from(new Set(RULES.map(r => r.category))).map(cat => (
              <div key={cat} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 700 }}>{cat}</div>
                <ul style={{ marginTop: 4, color: 'var(--text-dim)' }}>
                  {RULES.filter(r => r.category === cat).map(r => (
                    <li key={r.id} style={{ marginBottom: 4 }}>
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: '13px' }}>{r.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <button className="btn" onClick={() => startNewGame(selectedCategory)} style={{ width: '160px' }}>Restart (same category)</button>
        <button className="btn" onClick={() => { setLog([]); setMessage('Conversation cleared.'); }} style={{ width: '160px' }}>Clear Conversation</button>
      </div>
    </div>
  );
}
