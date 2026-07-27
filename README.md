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
- `assets/photos/` + `assets/brand/` — **drop the real photos, logo, and
  banner here** (see `assets/photos/README.md` for the exact filenames;
  slots show labeled placeholders until then, and the header falls back
  to a text wordmark until `assets/brand/logo.png` exists)
- `assets/fonts/` — self-hosted Bangers / Montserrat / Poppins woff2

## Owner admin (no code needed)

The site has a built-in admin panel at **`/admin/`**
(https://autoris-hq.github.io/SipsSutherlin/admin/) powered by
[Sveltia CMS](https://github.com/sveltia/sveltia-cms). Owners can change
every photo, the video, the "See The Menu" / "See Specials" button links,
and the About section. Saving publishes automatically in about a minute.

**One-time setup per owner:**

1. Create a GitHub account (free) and get added as a collaborator on this
   repo with **Write** access (repo Settings → Collaborators).
2. Create a fine-grained personal access token at
   https://github.com/settings/personal-access-tokens/new —
   Repository access: *Only select repositories* → this repo;
   Permissions: *Contents → Read and write*. Set a long expiration.
3. Open `/admin/`, choose **Sign in with GitHub**, and use the
   token option, pasting the token. The browser remembers it.

**Editing:** open `/admin/` → *Page Content* → change fields / upload
images → **Save**. Uploads land in `assets/uploads/`; all editable text
and paths live in `content/site.json`, which the page reads at load.

Video tip: upload MP4 (H.264) only — iPhone/CapCut HEVC exports won't
play in Chrome or Firefox.

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
