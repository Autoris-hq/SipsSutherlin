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
| `about.jpg` | About section (4:3) | The lime-green Sips stand |
| `featured-1.jpg` … `featured-3.jpg` | Featured Sips grid (square) | Drink close-ups from the video / Facebook page |

Tips: JPG around 1200–1600px on the long edge keeps the page fast.
Square crops look best in the featured grid.

After the site has its final domain, change the `og:image` tag in
`index.html` to the absolute URL of `assets/brand/banner.jpg`.
