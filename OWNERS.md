# Sips Website — Owner's Guide

## Editing your website

1. Go to **sutherlinsips.com/admin** (or tap **Owner Login** at the
   bottom of the website).
2. Type your email address. A **6-digit code** arrives in your inbox
   within seconds.
3. Type the code. The editor opens — no password, no other steps.
4. Click **Page Content**. Change photos, the video, button links, or
   the About text. Click **Save**. The live site updates in about a
   minute.

Only these emails can get codes:

- 541sips@gmail.com
- kylecasteel1@gmail.com

## Tips

- **Always use the newest code email** — each new request cancels older
  codes, and every code works exactly once.
- **Type the code** into the login page rather than tapping the email's
  link — it keeps the login in the browser you started in.
- Photos: JPG around 1200px wide is ideal. Video: MP4 (H.264) only —
  iPhone/CapCut "HEVC" exports won't play for most visitors.
- Logins last about a day per device before asking for a new code.

## The hidden game & scoreboard

The website has a hidden game — **triple-tap the little sun** next to the
hero photo (or type `sips` on a keyboard). Players slide a Sips cup to
catch falling drinks.

- **High scores** are shared across everyone and shown in the game.
- **Free drink:** when a player beats the all-time high score, the game
  shows "🏆 New high score — show this screen at the window for a free
  drink!" with the date. Have them show you that screen to claim it.
- **Reset the scoreboard** anytime at
  **sutherlinsips.com/admin/scores.html** — sign in with your email code
  (same as the editor), then click **Reset Scoreboard**. It clears every
  score so a new contest can start.

## If something looks wrong

- A change not showing? Wait one minute, then refresh the page.
- Editor acting strange? Press **Cmd+Shift+R** (Mac) or
  **Ctrl+Shift+R** (Windows) once to force-load the newest version.

## For whoever maintains this (technical)

- Add/remove owner emails: Cloudflare → Zero Trust → Access →
  Applications → **Sips Admin** → "Owners" policy.
- The GitHub credential lives as the `GITHUB_TOKEN` secret on the
  `sipssutherlin` Worker; it expires **July 2027** — generate a new
  classic token (`repo` scope) and update the secret. Until renewed,
  the admin shows errors but the public site is unaffected.
- Full technical details: see `README.md`.
