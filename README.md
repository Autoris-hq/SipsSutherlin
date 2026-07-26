# Sips — Website

Marketing website for **Sips**, the kids' drink stand in Sutherlin, Oregon.
*Good vibes. Cold sips. Happy kids.*

## Stack

Pure static HTML/CSS/JS — no build step, no dependencies. Ready to host on
GitHub Pages, Netlify, or any static host.

- `index.html` — home (hero, brand values, find-a-sips band, menu preview)
- `menu.html` — full drink menu with add-ons
- `locations.html` — current + upcoming locations
- `about.html` — brand story and values
- `events.html` — Kids Drink Free days, bookings, upcoming events
- `contact.html` — contact info + form (demo form, no backend yet)
- `css/style.css` — brand stylesheet
- `js/main.js` — SVG sprite (cups, icons, illustrations), mobile nav, scroll reveal

## Brand

| Token | Value |
| --- | --- |
| Sips green | `#7AC943` |
| Leaf green | `#4CAF50` |
| Ink | `#111111` |
| Sunshine | `#FFC83D` |
| Cream | `#F7F7F2` |
| Headings | Bangers / Montserrat ExtraBold |
| Body | Poppins / Montserrat |

All artwork (drink cups, icons, storefront) is inline SVG generated from the
brand guide — swap in real photography by replacing the `<svg>` illustration
blocks (`.band-photo`, `.framed-illustration`, `.loc-illustration`).

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```
