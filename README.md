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

## Owner admin (no code, no tokens)

The admin panel lives at **https://sutherlinsips.com/admin/** (also the
"Owner Login" link in the site footer), powered by
[Sveltia CMS](https://github.com/sveltia/sveltia-cms). Owners can change
every photo, the video, the "See The Menu" / "See Specials" button links,
and the About section. Saving publishes automatically in about a minute.

**Owner login:** enter your email → receive a 6-digit code → you're in.
Only the emails allowed in the Cloudflare Access policy can get codes.
No passwords, no tokens — the Worker (`worker.js`) holds the GitHub
credential server-side and only honors requests that passed the email
gate (it verifies the Cloudflare Access JWT).

**Maintainer setup (one time), in the Cloudflare dashboard:**

1. Zero Trust → Access → the `Sips Admin` application must cover BOTH
   hostnames (`sutherlinsips.com` and `www.sutherlinsips.com`) with BOTH
   paths `admin*` and `api*`, policy allowing the owner emails,
   login method One-time PIN.
2. Workers → `sipssutherlin` → Settings → Variables and Secrets:
   - `GITHUB_TOKEN` (secret): a **classic** PAT with `repo` scope
     (classic, because the CMS also uses GitHub's GraphQL API)
   - `ACCESS_TEAM_DOMAIN` (var): e.g. `yourteam.cloudflareaccess.com`
   - `ACCESS_AUD` (var): the Access application's Audience (AUD) tag,
     shown on the application's overview page

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
