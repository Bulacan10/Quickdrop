(function (root) {
  // SAFETY MODEL: escape ALL user text first, then add only tags we generate ourselves.
  // User-supplied HTML therefore appears as visible text and can never run.
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function inline(raw) {
    const stash = [];
    let s = esc(raw).replace(/`([^`]+)`/g, (m, c) => { stash.push('<code>' + c + '</code>'); return '\u0000' + (stash.length - 1) + '\u0000'; });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) =>
      /^(https?:\/\/|mailto:)/i.test(url) ? '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + '</a>' : m);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>').replace(/~~([^~]+)~~/g, '<del>$1</del>');
    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => stash[i]);
  }

  function render(md) {
    const lines = md.replace(/\r\n?/g, '\n').split('\n'), out = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (/^```/.test(l)) {                       // fenced code block
        const code = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
        i++; out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); continue;
      }
      let m;
      if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
      if (/^>\s?/.test(l)) {
        const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
        out.push('<blockquote>' + inline(q.join(' ')) + '</blockquote>'); continue;
      }
      if (/^\s*[-*+]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)) {
        const tag = /^\s*\d+\./.test(l) ? 'ol' : 'ul', re = tag === 'ol' ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/, items = [];
        while (i < lines.length && re.test(lines[i])) items.push('<li>' + inline(lines[i++].replace(re, '')) + '</li>');
        out.push(`<${tag}>${items.join('')}</${tag}>`); continue;
      }
      if (!l.trim()) { i++; continue; }
      const p = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*[-*+]\s|\s*\d+\.\s|-{3,}\s*$)/.test(lines[i])) p.push(lines[i++]);
      if (!p.length) p.push(lines[i++]);
      out.push('<p>' + p.map(inline).join('<br>') + '</p>');
    }
    return out.join('\n');
  }
  const api = { render, esc };
  root.QD = root.QD || {}; root.QD.markdown = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
