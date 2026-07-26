# Photos & brand assets

Drop the real files in using these exact paths — the site picks them up
automatically. Until a file exists, its slot shows a labeled placeholder
(and the header shows a text wordmark instead of the logo).

## Brand (goes in `assets/brand/`)

| File | Where it appears | Which supplied asset |
| --- | --- | --- |
| `brand/logo.png` | Header logo | The "Sips · Sutherlin, OR" logo (transparent PNG preferred; a white background also works — the header blends it out) |
| `brand/banner.jpg` | Social-share preview (`og:image`) | The wide "Good Vibes. Cold Sips." banner |

## Photos (this folder)

| File | Where it appears | Which supplied asset |
| --- | --- | --- |
| `hero.jpg` | Hero, top of page (4:3) | The three drinks on the picnic table |
| `about.jpg` | About section (4:3) | The lime-green Sips stand (couple at the window) |
| `featured-1.jpg` | Featured grid (square) | The açaí bowl with berries and banana |
| `featured-2.jpg` | Featured grid (square) | The littlest Sips fan (green bow + heart sunglasses) |
| `featured-3.jpg` | Featured grid (square) | Any drink close-up from the video / Facebook page |

Tips: JPG around 1200–1600px on the long edge keeps the page fast.
Square crops look best in the featured grid.

The `og:image` tag in `index.html` points at the GitHub Pages URL;
update the domain if the site moves to its own domain.
