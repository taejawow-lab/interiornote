import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const expected = process.env.EXPECTED_GA4_ID || 'G-T0NJ28302B';
const wrong = process.env.WRONG_GA4_ID || 'G-TONJ28302B';
const htmlPath = join(process.cwd(), 'dist', 'index.html');

if (!existsSync(htmlPath)) {
  console.error(`[qa:ga4] Missing ${htmlPath}. Run npm run build first.`);
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');
const checks = [
  [`gtag loader uses ${expected}`, html.includes(`https://www.googletagmanager.com/gtag/js?id=${expected}`)],
  [`gtag config uses ${expected}`, html.includes(`gtag('config','${expected}'`) || html.includes(`gtag('config', '${expected}'`)],
  [`manual page_view is present`, html.includes(`gtag('event','page_view'`) || html.includes(`gtag('event', 'page_view'`)],
  [`wrong GA4 id ${wrong} is absent`, !html.includes(wrong)],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error(`[qa:ga4] GA4 regression detected. Expected ${expected}; wrong id ${wrong} must not appear.`);
  process.exit(1);
}

console.log(`[qa:ga4] OK: ${expected} is present and ${wrong} is absent in dist/index.html`);
