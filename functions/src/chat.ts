/**
 * AI Chat API - Game design conversation
 * Uses Groq 8B (free) for conversation
 * Filters AI response through Pyx /ai-decide for kid-safe display (trains Pyx from game usage)
 */
import { filterForDisplayAIDecide } from './pyx';
async function chatWithGroq(messages: { role: string; content: string }[], apiKey: string): Promise<string> {
  const key = (apiKey || '').trim();
  if (!key) throw new Error('Groq API key is missing');
  const model = 'llama-3.1-8b-instant';
  const systemMsg = {
    role: 'system',
    content: 'You are a helpful game design assistant. Help the user design their 3D game. Discuss mechanics, visuals, controls, objectives. Be concise. Ask clarifying questions. When they describe a game idea, suggest improvements and details.',
  };
  const apiMessages = [systemMsg, ...messages.map((m) => ({ role: m.role, content: m.content }))];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'I had trouble responding. Try again.';
}

export async function handleChat(
  req: { body: { messages?: { role: string; content: string }[] } },
  res: { status: (n: number) => { json: (d: object) => void } }
) {
  try {
    const messages = req.body?.messages || [];
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    if (!groqKey) {
      return res.status(503).json({ error: 'Chat not available (no API key configured)' });
    }

    const raw = await chatWithGroq(messages, groqKey);
    const content = await filterForDisplayAIDecide(raw);
    res.status(200).json({ content });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
}
