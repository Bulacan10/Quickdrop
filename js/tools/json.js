(function (root) {
  // Turn a character index into "line N, column M" so errors are easy to find.
  function locate(text, index) {
    const before = text.slice(0, index).split('\n');
    return { line: before.length, column: before[before.length - 1].length + 1 };
  }
  // Parse JSON; return { ok, value } or { ok:false, message } with a position when the engine reports one.
  function parse(text) {
    if (!text.trim()) return { ok: false, message: 'Input is empty. Paste some JSON first.' };
    try { return { ok: true, value: JSON.parse(text) }; }
    catch (e) {
      let where = '';
      // Some engines (recent Chrome/Node, Firefox) already include line/column in the message; only add one if missing.
      if (!/line \d+/.test(e.message)) {
        const pos = /position (\d+)/.exec(e.message);
        if (pos) { const p = locate(text, +pos[1]); where = ` (line ${p.line}, column ${p.column})`; }
      }
      return { ok: false, message: 'Invalid JSON: ' + e.message + where };
    }
  }
  function format(text, indent) {
    const r = parse(text); if (!r.ok) return r;
    return { ok: true, output: JSON.stringify(r.value, null, indent === 'tab' ? '\t' : Number(indent) || 2) };
  }
  function minify(text) {
    const r = parse(text); if (!r.ok) return r;
    return { ok: true, output: JSON.stringify(r.value) };
  }
  const api = { parse, format, minify };
  root.QD = root.QD || {}; root.QD.json = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
