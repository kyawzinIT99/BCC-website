# Security dependency update — 11 October 2026

Baseline: deployed commit 613839f on codex/hostinger-production. Prepared locally; production has not been changed by this patch.

## Updates

- Next.js and its ESLint config: 16.3.8 (same framework major).
- MySQL2: 3.24.5. The Hostinger parameter adapter now narrows unknown D1 bindings to supported scalar/binary SQL values, preserving ISO timestamp conversion and rejecting unsupported inputs. Bound queries remain parameterized.
- Sharp override: 0.35.5; PostCSS override: 8.5.29; image-size override: 2.0.3.
- Drizzle Kit: 0.31.11 with esbuild scoped to 0.28.2 in its dependency subtree. This also avoids the older esbuild release still listed by Hostinger under a withdrawn advisory.
- Compatible indirect fixes include brace-expansion 1.1.21 / 5.0.12, undici 7.29.1, fast-uri 3.1.8, source-map-js 1.2.2 and js-yaml 4.3.2.
- No forced npm audit downgrades or application framework migration.

## Audit results and limits

Hostinger baseline: 43 advisory findings, including 3 critical. npm counts packages and their affected parents differently: baseline 25 package findings (1 critical, 19 high, 5 moderate).

After changes, npm audit --omit=dev reports 0 findings. Full npm audit reports 8 high findings, all in development-only dependency paths involving braces 3.0.3 through micromatch / fast-glob / Next ESLint and the existing Vinext tooling. These are not fixed or suppressed. The reviewed advisory GHSA-vfj7-8cjw-p6xm lists no patched version, and npm's forced alternative would downgrade framework tooling. Do not accept untrusted brace patterns in build/lint tooling. Recheck upstream for a compatible release.

Zero production npm findings is an advisory scan result, not a guarantee that the entire application is secure. Hostinger must rescan the new deployment before its dashboard count is confirmed.

## Validation

- npm run build passed on Next.js 16.3.8, including TypeScript and all routes.
- All 11 tests passed, including new SQL-value compatibility tests.
- Full ESLint completed with no errors; three existing warnings remain in unrelated UI files. Changed runtime and test lint clean.
- Drizzle generation completed to a temporary local output directory; no database migration was applied.
- Local HTTP checks: /about, /admin and the PDF return 200; PDF SHA256 matches the reviewed privacy-cleaned original (a2af00a8ac862c32e10962f8ca1d9f88d55ed57d5eaffa46c6d04d7289169179).
- Live database connectivity and authenticated production upload/save were not tested with the new driver. No production credentials copied to the review directory.

## Publication and recovery

Await user approval to push this patch, which triggers Hostinger deployment. Existing Hostinger files/database backup is listed as 2026-10-11 11:49 (Custom); restore has not been tested. The prior source commit 613839f remains available. If the new deployment fails, check its logs and preserve the last working deployment. After deployment, verify the live About PDF, authenticated Admin view and Hostinger vulnerability rescan.

## Sources

- https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j
- https://github.com/sidorares/node-mysql2/security/advisories/GHSA-3f6p-5ww8-9rcr
- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- npm official registry version and audit results captured in the local bcc-security-fix review directory.
