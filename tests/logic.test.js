const assert = require('assert'), test = require('node:test');
const J = require('../js/tools/json.js'), T = require('../js/tools/text.js'), M = require('../js/tools/markdown.js'), P = require('../js/tools/password.js');

test('json: format, minify, errors', () => {
  assert.strictEqual(J.format('{"a":1,"b":[1,2]}', '2').output, '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  assert.strictEqual(J.minify('{ "a" : 1 }').output, '{"a":1}');
  const bad = J.format('{\n "a": 1,\n}', '2'); assert.ok(!bad.ok); assert.match(bad.message, /line 3/);
  assert.match(J.format('   ').message, /empty/);
});
test('text: cases and stats', () => {
  assert.strictEqual(T.upper('hi'), 'HI'); assert.strictEqual(T.lower('HI'), 'hi');
  assert.strictEqual(T.title('the quick BROWN fox'), 'The Quick Brown Fox');
  assert.strictEqual(T.sentence('hello world. HOW are you? fine!'), 'Hello world. How are you? Fine!');
  assert.deepStrictEqual(T.stats('a b\nc'), { words: 3, chars: 5, noSpaces: 3, lines: 2 });
  assert.deepStrictEqual(T.stats(''), { words: 0, chars: 0, noSpaces: 0, lines: 0 });
});
test('markdown: renders and neutralises HTML', () => {
  assert.match(M.render('# Hi'), /<h1>Hi<\/h1>/);
  assert.match(M.render('**b** and *i* and `c`'), /<strong>b<\/strong> and <em>i<\/em> and <code>c<\/code>/);
  assert.match(M.render('- a\n- b'), /<ul><li>a<\/li><li>b<\/li><\/ul>/);
  const evil = M.render('<script>alert(1)</script> <img src=x onerror=alert(1)>');
  assert.ok(!/<script|<img/i.test(evil)); assert.match(evil, /&lt;script&gt;/);
  assert.ok(!/href="javascript:/i.test(M.render('[x](javascript:alert(1))')));
  assert.match(M.render('[ok](https://example.com)'), /href="https:\/\/example.com"/);
  assert.ok(!/<a /.test(M.render('[x](https://a.com"onclick="alert(1))')) || !/"onclick=/.test(M.render('[x](https://a.com"onclick="alert(1))')));
  assert.match(M.render('```\n<b>x</b>\n```'), /&lt;b&gt;x&lt;\/b&gt;/);
});
test('password: options, length, uniqueness, rejection of bad input', () => {
  const o = { length: 24, lower: true, upper: true, digits: true, symbols: true };
  const r = P.generate(o); assert.ok(r.ok); assert.strictEqual(r.password.length, 24);
  for (let i = 0; i < 200; i++) { const p = P.generate({ ...o, length: 4 }).password; assert.ok(/[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^a-zA-Z0-9]/.test(p)); }
  assert.ok(/^\d{20}$/.test(P.generate({ length: 20, digits: true }).password));
  assert.ok(!/[Il1O0]/.test(P.generate({ ...o, length: 128, noAmbiguous: true }).password));
  assert.ok(!P.generate({ length: 16 }).ok); assert.ok(!P.generate({ ...o, length: 500 }).ok);
  assert.notStrictEqual(P.generate(o).password, P.generate(o).password);
  const counts = Array(6).fill(0); for (let i = 0; i < 60000; i++) counts[P.randInt(6)]++;
  counts.forEach(c => assert.ok(c > 9000 && c < 11000));   // roughly uniform
});
