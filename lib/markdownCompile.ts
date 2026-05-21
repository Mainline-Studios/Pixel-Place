function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
    const url = String(href).trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith('./') && !url.startsWith('/')) {
      return escapeHtml(label);
    }
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  });
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
}

function isTableRow(line: string): boolean {
  return /^\|.+\|$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim());
}

export function compileMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(' ').trim();
    if (text) out.push(`<p>${inlineMarkdown(text)}</p>`);
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      out.push('<hr />');
      i += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) {
      const header = parseTableRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        rows.push(parseTableRow(lines[i].trim()));
        i += 1;
      }
      out.push('<table><thead><tr>');
      header.forEach((c) => out.push(`<th>${inlineMarkdown(c)}</th>`));
      out.push('</tr></thead><tbody>');
      rows.forEach((row) => {
        out.push('<tr>');
        row.forEach((c) => out.push(`<td>${inlineMarkdown(c)}</td>`));
        out.push('</tr>');
      });
      out.push('</tbody></table>');
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${quote.map((q) => `<p>${inlineMarkdown(q)}</p>`).join('')}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      out.push('<ul>');
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*]\s+/, '');
        const checked = item.match(/^\[(x| )\]\s+(.*)$/i);
        if (checked) {
          const done = checked[1].toLowerCase() === 'x';
          out.push(
            `<li class="task-item"><input type="checkbox" disabled ${done ? 'checked' : ''} /> ${inlineMarkdown(checked[2])}</li>`,
          );
        } else {
          out.push(`<li>${inlineMarkdown(item)}</li>`);
        }
        i += 1;
      }
      out.push('</ul>');
      continue;
    }

    if (/^```/.test(trimmed)) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code.push(escapeHtml(lines[i]));
        i += 1;
      }
      if (i < lines.length) i += 1;
      out.push(`<pre><code>${code.join('\n')}</code></pre>`);
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (/^(#{1,6})\s/.test(t) || /^---+$/.test(t) || /^[-*]\s+/.test(t) || /^>\s?/.test(t) || /^```/.test(t)) {
        break;
      }
      if (isTableRow(t) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) break;
      para.push(t);
      i += 1;
    }
    flushParagraph(para);
  }

  return rewriteReleaseNoteLinksInHtml(out.join('\n'));
}

/** Turn ./Other Release.md links into in-app release-note openers (Settings panel). */
export function rewriteReleaseNoteLinksInHtml(html: string): string {
  return html.replace(/<a href="([^"]*)"([^>]*)>/gi, (full, href, rest) => {
    const decoded = decodeURIComponent(String(href));
    if (/^https?:\/\//i.test(decoded) || decoded.startsWith('mailto:')) return full;
    const filename = decoded.replace(/^\.\//, '').split('/').pop() || '';
    if (!/\.md$/i.test(filename)) return full;
    const slug = filename
      .replace(/\.md$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const extra = rest.includes('class=')
      ? rest.replace(/class="/, 'class="release-note-internal-link ')
      : `${rest} class="release-note-internal-link"`;
    return `<a href="#" data-release-note-slug="${slug}"${extra}>`;
  });
}
