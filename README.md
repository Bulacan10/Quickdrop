# QuickDrop

Free, private, in-browser utilities: **JSON Formatter & Validator**, **Text Converter**, **Markdown Previewer**, **Password Generator**.
Plain HTML, CSS and vanilla JavaScript. No framework, backend, build step or external requests.

## Run locally
Open `index.html` in a browser (double-click works), or serve it:
```bash
cd quickdrop
python3 -m http.server 8000   # then visit http://localhost:8000
```
Run the logic tests (Node 18+): `node --test tests/logic.test.js`

## Deploy to GitHub Pages
```bash
cd quickdrop
git init && git add . && git commit -m "QuickDrop MVP"
git branch -M main
git remote add origin https://github.com/<you>/quickdrop.git
git push -u origin main
```
Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save.**
The site appears at `https://<you>.github.io/quickdrop/` within a minute or two. All paths are relative, so the repo-name subpath works.

## Structure
- `index.html`, `styles.css` — markup and themes (CSS variables; light/dark)
- `js/app.js` — hash routing, theme, search, clipboard, DOM wiring
- `js/tools/*.js` — pure logic per tool (also loadable in Node for tests)
- `tests/logic.test.js` — automated tests of the logic

## Privacy
All processing is local. Nothing you type or generate is sent anywhere or saved. The only thing stored is your theme choice (`localStorage`). A Content-Security-Policy meta tag blocks external resources. Passwords use `crypto.getRandomValues` with rejection sampling; `Math.random()` is never used.

## Limitations
- The Markdown renderer is a small custom one: headings, bold/italic/strike, inline code, fenced code, links (http/https/mailto only), lists (no nesting), blockquotes, rules. No tables, images, nested lists or raw HTML (HTML is shown as text on purpose).
- Title Case capitalises every word (no "small word" rules like *of*, *the*); sentence case lowercases everything else, so acronyms and names are lowercased.
- Very large JSON (many MB) may freeze the tab briefly. JSON numbers beyond JS precision lose digits when reformatted.
- Entropy figures are estimates of the generator's possible output space, not a guarantee about a password you reuse.
- Clipboard copy needs HTTPS or localhost for the modern API; a fallback is used otherwise.
- Tested in Node only (see below). Not yet checked in real browsers or with screen readers.
