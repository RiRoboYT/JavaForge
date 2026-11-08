# JavaForge

A clean, modern single-page web app for writing, saving and running Java programs — built for ICSE / Class 10 students as a friendlier alternative to BlueJ.

- **Monaco Editor** (the editor inside VS Code): Java highlighting, auto-indent, bracket matching, code folding, word wrap, minimap, font size, formatting, snippets (`sout`, `psvm`, `fori`, `scanner` …)
- **Run instantly** with OpenJDK 25 via the OnlineCompiler.io API, with an Input box for `Scanner` programs
- **Clear console**: output, highlighted compile errors (click “line N” to jump there, the line is marked in the editor), runtime errors with friendly hints, execution time
- **Dashboard**: saved programs as cards (name, last modified, preview, last-run badge), search, sort, rename, duplicate, copy, delete, 9 templates (incl. ICSE-style programs), stats, JSON export/import backup
- **Themes**: dark/light mode + 6 presets (One Dark, Dracula, Monokai, Solarized Dark, Clean Light, Soft Light) — changes the whole page and the editor instantly
- **Auto-save** while typing, `Ctrl+S` to save, `Ctrl+Enter` to run
- Works with **any class name** — `public class PrimeCheck`, BlueJ-style `public static void main()` (no args), or a `void main()` instance method all run without changes

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page (dashboard + editor views) |
| `style.css` | All styling and theme colour variables |
| `script.js` | Monaco setup, themes, saving, running code, UI logic |
| `config.example.js` | Template for your API key file |
| `config.js` | **Your** API key — git-ignored, never commit it |

## Setup

1. Put your OnlineCompiler.io API key in `config.js` (copy `config.example.js`), **or** open JavaForge → ⚙ Settings and paste it there (stored only in your browser).
2. Open `index.html` in Chrome/Edge/Firefox. That’s it.

If your browser blocks something when opening the file directly, serve the folder instead:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Notes

- Programs are stored in your browser’s LocalStorage. Use **Export** on the dashboard to make a backup file, and **Import** to restore it.
- When you press Run, your code and input are sent to OnlineCompiler.io. The free tier allows 100,000 runs per month.
- Best for single-file Java programs. The runner always starts the class that contains `main`.
- Keep your API key out of public repositories — `config.js` is already in `.gitignore`.
