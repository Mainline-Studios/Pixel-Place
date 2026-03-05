/**
 * Appeal bot: calls Anthropic with ban context. Explains the ban and answers only ban-related questions.
 * Uses ANTHROPIC_API_KEY from env (.env.local / gitignore). Conversations are visible to admins.
 */

const APPEAL_BOT_SYSTEM = `You are the ban appeal assistant for a friendly online community (Pixel Place). You explain why a user was banned and answer only ban- and appeal-related questions. Be clear, fair, and concise.

Important rules:
- This conversation is visible to administrators. Say so when relevant (e.g. "Note: This conversation is visible to administrators who may review it.").
- Only answer questions about the ban, appeal process, or community rules related to the ban. If the user asks off-topic questions (games, other users, etc.), politely say you can only discuss the ban and appeal.
- Explain the ban reason in plain language. Do not make up details not in the ban reason.
- If the user is respectful and has a good case, you can acknowledge it; you do not unban anyone (only admins do). Encourage them to wait for admin review.
- Keep replies to 1-4 short paragraphs. Be human and helpful.`;

export async function getAppealBotReply(
  banReason: string,
  bannedUsername: string,
  bannedBy: string,
  messageHistory: Array<{ from: string; message: string }>
): Promise<string> {
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) {
    return "I'm not available right now (AI not configured). An administrator will review your appeal.";
  }

  const system = `${APPEAL_BOT_SYSTEM}

Current ban context:
- Banned user: ${bannedUsername}
- Banned by: ${bannedBy}
- Ban reason (exact): ${banReason}

Use this context to explain the ban and answer the user. Only discuss this ban and the appeal process.`;

  const messages = messageHistory.map((m) => ({
    role: m.from === 'appeal_bot' ? 'assistant' as const : 'user' as const,
    content: m.from === 'appeal_bot' ? m.message : `[${m.from}]: ${m.message}`,
  }));

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 400,
        system,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Appeal bot Anthropic error:', res.status, errText);
      return "I couldn't process that right now. An administrator will still review your appeal.";
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.[0]?.type === 'text' ? (data.content[0].text ?? '').trim() : '';
    return text || "I don't have a response for that. Please keep your message focused on your ban or appeal.";
  } catch (e) {
    console.error('Appeal bot error:', e);
    return "I'm temporarily unavailable. An administrator will review your appeal.";
  }
}
