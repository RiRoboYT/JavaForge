# JavaForge

A clean, modern web app for writing, saving and running Java programs — built for ICSE / Class 10 students as a friendlier alternative to BlueJ.

## Why there's a server part

OnlineCompiler.io doesn't let web pages call its API directly (the browser blocks it — a "CORS" error). So the page sends your code to a small helper on **your own site or computer**, which forwards it to OnlineCompiler.io and adds your API key. Your key never reaches the browser.

There are two ways to run JavaForge — use whichever you like (or both):

### A) On your website (Hostinger)

Works from any device: laptop, school computer, tablet.

1. In Hostinger → **Websites → Manage → File Manager**, open `public_html` (or a subfolder like `public_html/javaforge`).
2. Upload these files into that folder:
   - `index.html`, `style.css`, `script.js`
   - `run.php`, `secret.php`, `.htaccess`
3. Visit your site. The status bar at the bottom should say **● Connected**.

Needs a Hostinger plan with PHP (the normal *Web Hosting* plans or a VPS). **Website Builder** plans can't run PHP, so they won't work.

Don't upload `start.bat`, `server.py` or `JavaForgeServer.java` — they're only for your own computer (`.htaccess` blocks them anyway).

### B) On your own computer

1. Double-click **`start.bat`** (Windows).
2. A black window opens and JavaForge opens in your browser at `http://localhost:8000`.
3. Keep the black window open while you use JavaForge. Close it to stop.

`start.bat` uses Python if you have it, otherwise Java (including the Java that comes with BlueJ). If neither is installed, install Python from python.org and tick **"Add python.exe to PATH"**.

On Mac/Linux, run `python3 server.py` in the JavaForge folder.

> Opening `index.html` directly (double-clicking it) shows the app but **can't run code** — the page will tell you to use `start.bat` instead.

## Your API key

The key lives in **`secret.php`** — open it in Notepad and put the key between the quotes:

```php
<?php
return 'your-key-here';
```

Both `run.php` (website) and `start.bat` (computer) read it from there. Opening `secret.php` in a browser shows nothing, and `.htaccess` blocks it completely. It's in `.gitignore` so it never goes to GitHub. `secret.example.php` is a blank template.

## Protection on your website (run.php)

Because anyone can visit your site, `run.php`:
- only accepts requests from your own website,
- allows **30 runs per visitor every 5 minutes** (change `JF_RATE_LIMIT` / `JF_RATE_WINDOW` at the top of `run.php`),
- rejects code or input longer than 65,536 characters,
- always uses the `openjdk-25` compiler.

## Moving your saved programs

Programs are saved in the browser, separately for each address (your website, `localhost:8000`, a file on disk…). To move them: **Export** on the old one → **Import** on the new one.

## Features

- **Monaco Editor** (the editor inside VS Code): Java highlighting, auto-indent, bracket matching, code folding, word wrap, minimap, font size, formatting, snippets (`sout`, `psvm`, `fori`, `scanner` …)
- **Run instantly** with OpenJDK 25, with an Input box for `Scanner` programs
- **Clear console**: output, highlighted compile errors (click “line N” to jump there), runtime errors with friendly hints, execution time
- **Dashboard**: program cards (name, last modified, preview, last-run badge), search, sort, rename, duplicate, copy, delete, 9 templates (incl. ICSE-style programs), weekly stats, JSON export/import
- **Themes**: dark/light mode + 6 presets (One Dark, Dracula, Monokai, Solarized Dark, Clean Light, Soft Light)
- **Auto-save** while typing, `Ctrl+S` to save, `Ctrl+Enter` to run
- Works with **any class name** — `public class PrimeCheck`, BlueJ-style `public static void main()`, or a `void main()` instance method

## Files

| File | Where it goes | What it is |
| --- | --- | --- |
| `index.html`, `style.css`, `script.js` | website + computer | The app |
| `run.php` | website | Forwards code to OnlineCompiler.io with your key |
| `secret.php` | website + computer | **Your API key** (private) |
| `.htaccess` | website | Blocks access to private files |
| `start.bat` | computer | Double-click to start JavaForge locally |
| `server.py` / `JavaForgeServer.java` | computer | The local server (Python / Java version) |
| `secret.example.php` | — | Blank key template |
