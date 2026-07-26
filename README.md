# Sutherlin Sips — Website

Single-page website for **Sutherlin Sips**, the drive-thru at
1100 W Central Ave, Sutherlin, Oregon — sodas, smoothies, açaí bowls,
coffee & more.

Pure static HTML/CSS/JS, no build step. Hosts on GitHub Pages, Netlify,
or any static host.

## Structure

- `index.html` — the whole site: hero, what Sips serves, featured drink
  photos, about, promo component, visit (address + hours + map), footer
- `css/style.css` — brand stylesheet
- `js/main.js` — SVG icon sprite, mobile nav, scroll reveal, photo fallbacks
- `assets/photos/` — **drop real photos here** (see `assets/photos/README.md`
  for the exact filenames; slots show labeled placeholders until then)
- `assets/fonts/` — self-hosted Bangers / Montserrat / Poppins woff2

## Editing content

Facts on the page are limited to what's publicly verified (address,
categories served, social links). Spots that need owner input are marked
with `EDITABLE` comments in `index.html`:

- **Hours** — currently points to Facebook; replace with real hours.
- **Promo** — the yellow promo card defaults to "specials on Facebook";
  swap in a confirmed offer's heading/text when one is active.
- **About** — two short sentences, safe to reword.

Phone number: not published anywhere we could verify, so it's omitted.
Add it to the Visit list and footer when confirmed.

## Brand system

| Token | Value |
| --- | --- |
| Lime | `#7AC943` |
| Green | `#4CAF50` |
| Deep green | `#2E6B30` |
| Ink | `#111111` |
| Cream | `#F7F7F2` |
| Accents | aqua `#45D0E8` · coral `#FF6B6B` · yellow `#FFC83D` |
| Display | Bangers |
| Headings | Montserrat ExtraBold |
| Body | Poppins |

Rounded image containers, 3px ink outlines, offset solid shadows.

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```
