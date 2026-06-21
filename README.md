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
| `extract_and_slice.py` | Reproducible script that lifts the character off the original scene art and slices it into body + legs (needs `pillow` + `scipy`). |

## The hero animation

The hero character is the real THOY illustration (`public/assets/hero-mower.png`)
with its background removed and the figure sliced into three layers —
**body**, **front leg** and **back leg**. With CSS animations the rig:

- walks across the hero from right to left (`@keyframes mow`),
- swings each leg from the hip in opposite phase (`stepFront` / `stepBack`),
- gives the body a subtle step-bounce (`bob`), and
- sprays grass clippings out of the mower deck (`clipFly`).

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
