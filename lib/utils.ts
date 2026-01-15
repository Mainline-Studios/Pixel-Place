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





















