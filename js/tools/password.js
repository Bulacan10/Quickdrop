(function (root) {
  const SETS = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.?/' };
  const AMBIG = /[Il1O0]/g;

  // Unbiased random integer in [0, max). Web Crypto gives random 32-bit numbers; using "% max" directly
  // would favour small values, so we reject numbers from the uneven leftover range ("rejection sampling").
  function randInt(max) {
    const limit = Math.floor(0x100000000 / max) * max, buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }
  function generate(opts) {
    const sets = Object.keys(SETS).filter(k => opts[k]).map(k => opts.noAmbiguous ? SETS[k].replace(AMBIG, '') : SETS[k]);
    const length = Math.floor(Number(opts.length));
    if (!sets.length) return { ok: false, message: 'Select at least one character type.' };
    if (!(length >= sets.length && length <= 128)) return { ok: false, message: `Length must be between ${Math.max(sets.length, 4)} and 128.` };
    const pool = sets.join('');
    const chars = sets.map(s => s[randInt(s.length)]);                       // guarantee one of each chosen type
    while (chars.length < length) chars.push(pool[randInt(pool.length)]);
    for (let i = chars.length - 1; i > 0; i--) { const j = randInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; } // Fisher–Yates shuffle
    const bits = Math.round(length * Math.log2(pool.length));
    return { ok: true, password: chars.join(''), bits, label: bits < 50 ? 'Weak' : bits < 75 ? 'Fair' : bits < 100 ? 'Strong' : 'Very strong' };
  }
  const api = { generate, randInt };
  root.QD = root.QD || {}; root.QD.password = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
