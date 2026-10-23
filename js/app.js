(function () {
  const $ = id => document.getElementById(id), T = window.QD;
  let toastTimer;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800); }
  function status(el, msg, kind) { el.textContent = msg; el.className = 'status' + (kind ? ' ' + kind : ''); }

  // Copy with the async Clipboard API; fall back to a hidden textarea on older/insecure contexts.
  async function copy(text, emptyMsg) {
    if (!text) return toast(emptyMsg || 'Nothing to copy yet');
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove();
      if (!ok) return toast('Copy failed. Select the text and copy manually.');
    }
    toast('Copied to clipboard');
  }

  // ---- Hash routing: #/json shows the section whose data-view is "json". ----
  const views = [...document.querySelectorAll('[data-view]')].map(v => v.dataset.view);
  function route() {
    const name = location.hash.replace(/^#\/?/, '') || 'home';
    const view = views.includes(name) ? name : 'home';
    document.querySelectorAll('[data-view]').forEach(s => { s.hidden = s.dataset.view !== view; });
    document.querySelectorAll('nav a').forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#/' + view) && a.setAttribute('aria-current', 'page'));
    document.querySelectorAll('nav a:not([aria-current])').forEach(a => a.removeAttribute('aria-current'));
    document.title = (view === 'home' ? 'QuickDrop' : $('view-' + view).querySelector('h1').textContent + ' — QuickDrop');
    const h1 = $('view-' + view).querySelector('h1'); h1.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  // ---- Theme (only the theme name is stored, never user input) ----
  function setTheme(t, save) {
    document.documentElement.dataset.theme = t;
    $('theme-toggle').setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' theme');
    if (save) try { localStorage.setItem('qd-theme', t); } catch (e) {}
  }
  $('theme-toggle').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
  setTheme(document.documentElement.dataset.theme || 'light', false);

  // ---- Home search ----
  $('search').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase(); let shown = 0;
    document.querySelectorAll('.card').forEach(c => {
      const hit = !q || (c.textContent + ' ' + c.dataset.keywords).toLowerCase().includes(q);
      c.hidden = !hit; if (hit) shown++;
    });
    $('no-results').hidden = shown > 0;
  });

  // ---- JSON ----
  const jin = $('json-in'), jst = $('json-status');
  function runJson(fn, doneMsg) {
    const r = fn(jin.value);
    if (r.ok) { jin.value = r.output; status(jst, doneMsg, 'ok'); } else status(jst, r.message, 'err');
  }
  $('json-format').onclick = () => runJson(t => T.json.format(t, $('json-indent').value), '✓ Valid JSON, formatted.');
  $('json-minify').onclick = () => runJson(T.json.minify, '✓ Valid JSON, minified.');
  $('json-copy').onclick = () => copy(jin.value, 'Nothing to copy. Add some JSON first.');
  $('json-clear').onclick = () => { jin.value = ''; status(jst, 'Cleared. Paste JSON above, then press Format.'); jin.focus(); };

  // ---- Text ----
  const tin = $('text-in');
  function updateStats() {
    const s = T.text.stats(tin.value);
    $('st-words').textContent = s.words; $('st-chars').textContent = s.chars; $('st-nospace').textContent = s.noSpaces; $('st-lines').textContent = s.lines;
  }
  document.querySelectorAll('[data-case]').forEach(b => b.onclick = () => {
    if (!tin.value) return toast('Type or paste some text first');
    tin.value = T.text[b.dataset.case](tin.value); updateStats();
  });
  tin.addEventListener('input', updateStats);
  $('text-copy').onclick = () => copy(tin.value, 'Nothing to copy yet');
  $('text-clear').onclick = () => { tin.value = ''; updateStats(); tin.focus(); };

  // ---- Markdown (output is escaped by the renderer, so innerHTML only receives our own tags) ----
  const min = $('md-in');
  min.addEventListener('input', () => { $('md-out').innerHTML = T.markdown.render(min.value); });
  $('md-copy').onclick = () => copy(min.value, 'Nothing to copy yet');
  $('md-clear').onclick = () => { min.value = ''; $('md-out').innerHTML = ''; min.focus(); };

  // ---- Password (generated value lives only in the readonly field; never stored or sent) ----
  const pst = $('pw-status');
  function generate() {
    const r = T.password.generate({ length: $('pw-len').value, lower: $('pw-lower').checked, upper: $('pw-upper').checked, digits: $('pw-digits').checked, symbols: $('pw-symbols').checked, noAmbiguous: $('pw-ambig').checked });
    if (!r.ok) { $('pw-out').value = ''; return status(pst, r.message, 'err'); }
    $('pw-out').value = r.password; status(pst, `${r.label} · about ${r.bits} bits of entropy`, 'ok');
  }
  $('pw-len').addEventListener('input', e => { $('pw-len-val').textContent = e.target.value; });
  $('pw-generate').onclick = generate;
  $('pw-copy').onclick = () => copy($('pw-out').value, 'Generate a password first');

  updateStats(); route();
})();
