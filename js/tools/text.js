(function (root) {
  const upper = s => s.toUpperCase();
  const lower = s => s.toLowerCase();
  const title = s => s.toLowerCase().replace(/(^|[\s\-(["'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  // Capitalise the first letter of each sentence (start of text, or after . ! ? and whitespace).
  const sentence = s => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  function stats(s) {
    const t = s.trim();
    return {
      words: t ? t.split(/\s+/).length : 0,
      chars: [...s].length,
      noSpaces: [...s.replace(/\s/g, '')].length,
      lines: s ? s.split('\n').length : 0
    };
  }
  const api = { upper, lower, title, sentence, stats };
  root.QD = root.QD || {}; root.QD.text = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
