# InteriorNote GA4 final verification — 2026-06-10

## Scope

Follow-up after GA4 measurement ID correction for `interiornote.org`.

## Root cause

The live site previously used the wrong measurement ID:

- Wrong: `G-T0NJ28302B` — digit zero after `T`
- Correct: `G-TONJ28302B` — letter `O` after `T`

The correction commit deployed earlier:

- `0ffcece71a86b4956c7d97952b5d6c033cc46a9d`
- Commit title: `Fix InteriorNote GA4 measurement ID`
- GitHub Actions / Cloudflare Pages: success

## Production browser evidence

Representative URL:

- `https://interiornote.org/?v=ga4-final-smoke-0ffcece7`

Browser-side checks:

- `gtag/js?id=G-TONJ28302B` loaded.
- `window.dataLayer` contains `config` for `G-TONJ28302B`.
- `window.dataLayer` contains explicit `page_view` event.
- Performance resource list contains Google Analytics collect request:
  - `https://www.google-analytics.com/g/collect?...&tid=G-TONJ28302B...&en=page_view...`
- No `G-T0NJ28302B` appeared in the production browser check.

## Regression guard added

Added a lightweight local QA guard:

- `scripts/qa-ga4.mjs`
- `npm run qa:ga4`

The guard checks the built `dist/index.html` for:

- Correct loader ID: `G-TONJ28302B`
- Correct `gtag('config', ...)` ID
- Manual `page_view` event
- Absence of the wrong ID `G-T0NJ28302B`

Observed result:

```txt
PASS gtag loader uses G-TONJ28302B
PASS gtag config uses G-TONJ28302B
PASS manual page_view is present
PASS wrong GA4 id G-T0NJ28302B is absent
[qa:ga4] OK: G-TONJ28302B is present and G-T0NJ28302B is absent in dist/index.html
```

## User-side verification note

GA4 Realtime should show visits within seconds to a few minutes after opening `https://interiornote.org/` in a normal browser. The GA4 setup card / "data collection pending" status can lag behind Realtime and may take hours to refresh.
