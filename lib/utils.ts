export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  let out = parts[0]?.[0] || "";
  if (parts.length > 1) out += parts[1]?.[0] || "";
  return out.toUpperCase().slice(0, 2) || "PP";
}

export function escapeHTML(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Check if a string contains emojis
export function containsEmoji(str: string): boolean {
  if (!str) return false;
  // Emoji regex pattern - matches emoji characters
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B50}-\u{2B55}\u{FE00}-\u{FE0F}]/u;
  return emojiRegex.test(str);
}





















