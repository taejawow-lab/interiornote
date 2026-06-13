# Interiornote GA4 DebugView helper — 2026-06-13

## Scope

Follow-up after confirming production GA4 hits are sent to `G-T0NJ28302B`, but the user still cannot see data in Google Analytics. The next low-risk action was to make browser-side DebugView testing possible without installing the Google Analytics Debugger extension.

## Change

- Added runtime URL-parameter support: `?ga4_debug=1`.
- When the parameter is present, the inline GA4 snippet adds `debug_mode:true` to both `gtag('config', ...)` and the manual `page_view` event.
- Normal visitors without the parameter are unchanged.

## Local verification

- `npm run build` passed and generated 229 pages.
- `npm run qa:ga4` passed for `G-T0NJ28302B` and rejected the old `G-TONJ28302B`.
- `dist/index.html` contains the runtime `ga4_debug` switch and `debug_mode:true` branch.

## How to use

Open this URL while watching GA4 Admin > DebugView or Realtime:

`https://interiornote.org/?ga4_debug=1`

Expected hit traits:

- measurement ID: `G-T0NJ28302B`
- event: `page_view`
- parameter: `debug_mode=true`
- page location: `https://interiornote.org/?ga4_debug=1`

## Rollback

Revert this helper commit if not needed. It only affects requests where `ga4_debug=1` is explicitly present.
