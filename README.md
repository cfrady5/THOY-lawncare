# THOY Lawncare

A static landing page for THOY Lawncare, built with plain HTML, CSS and a tiny
bit of vanilla JavaScript so it can be hosted directly on **GitHub Pages** with
no build step.

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The whole page (nav, hero, services, contact, footer). |
| `styles.css` | All styling and the hero animation. |
| `script.js` | Mobile menu toggle, footer year, demo contact form. |
| `assets/` | Logo, favicon, and the sliced character images. |
| `extract_and_slice.py` | Reproducible script that crops the clean illustration and slices it into body + legs (needs `pillow` + `scipy`). |

## The hero animation

The hero character is the THOY illustration (`public/assets/character-clean.png`,
a transparent-background PNG) sliced into three layers — **body**, **front leg**
and **back leg**. He stays parked on the lawn while CSS animations:

- swing each leg from the hip in opposite phase (`stepFront` / `stepBack`), and
- spray grass clippings out of the mower deck (`clipFly`).

Motion is disabled automatically for visitors with
`prefers-reduced-motion: reduce`.

To regenerate the sliced character images:

```bash
pip install pillow scipy
python3 extract_and_slice.py
```

## Publishing on GitHub Pages

1. Push this branch (or merge it into your Pages branch).
2. In the repo: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**, then pick the branch and the **`/ (root)`**
   folder.
4. Save — the site goes live at `https://<user>.github.io/<repo>/`.

All asset paths are relative, so the page works correctly from a project
subpath. A `.nojekyll` file is included so GitHub Pages serves the files as-is.

## Local preview

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
```

> The earlier React/Vite source still lives in `src/` and is no longer used by
> the published site; it can be removed if you want a pure static repo.
