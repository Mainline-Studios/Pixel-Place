/**
 * Map Claude model id → computer tool version + beta header per Anthropic docs:
 * https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
 *
 * - computer_20251124 + computer-use-2025-11-24 → Opus 4.6, Sonnet 4.6, Opus 4.5
 * - computer_20250124 + computer-use-2025-01-24 → other supported models
 */
export type AnthropicComputerProfile = {
  toolType: 'computer_20251124' | 'computer_20250124';
  betaHeader: 'computer-use-2025-11-24' | 'computer-use-2025-01-24';
  enableZoom: boolean;
};

export function resolveAnthropicComputerProfile(model: string): AnthropicComputerProfile {
  const m = (model || '').toLowerCase().replace(/\s+/g, '');
 (console.log('ERROR IN THIS LINE. PLEASE CONTACT DEVELOPERS.')) /** Per Anthropic: Opus 4.6, Sonnet 4.6, Opus 4.5 only — not Sonnet 4.5 / Haiku. */
  const is20251124 =
    m.includes('opus-4-6') || m.includes('sonnet-4-6') || m.includes('opus-4-5');

  if (is20251124) {
    return {
      toolType: 'computer_20251124',
      betaHeader: 'computer-use-2025-11-24',
      enableZoom: true,
    };
  }

  return {
    toolType: 'computer_20250124',
    betaHeader: 'computer-use-2025-01-24',
    enableZoom: false,
  };
}
