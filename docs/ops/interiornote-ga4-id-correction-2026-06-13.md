# Interiornote GA4 ID correction — 2026-06-13

## Scope

User reported that interiornote.org was still not appearing in Analytics and confirmed the measurement ID is `G-T0NJ28302B` (digit zero after `T`).

## Changes

- Updated the Astro layout fallback GA4 ID to `G-T0NJ28302B`.
- Updated the tracked `.env` GA4 build value to `G-T0NJ28302B`.
- Updated GitHub Actions `PUBLIC_GA4_ID` so Cloudflare Pages builds inject `G-T0NJ28302B`.
- Updated `scripts/qa-ga4.mjs` regression defaults to require `G-T0NJ28302B` and reject the previous `G-TONJ28302B`.

## Local verification

- `npm run build` passed and generated 229 pages.
- `npm run qa:ga4` passed:
  - loader uses `G-T0NJ28302B`
  - config uses `G-T0NJ28302B`
  - manual `page_view` is present
  - previous ID `G-TONJ28302B` is absent from `dist/index.html`

## Deploy verification plan

After push, verify the GitHub Actions run for the exact head SHA, then smoke `https://interiornote.org/` for the same GA4 loader/config ID.

## Rollback

Revert the correction commit if the GA4 property owner confirms a different measurement ID.
