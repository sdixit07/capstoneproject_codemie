# Test Execution Report

## Context
- Date: 2026-09-15 (13:55-14:00 IST)
- Branch: feature/server-side-search
- PR: N/A (report generated from local run; branch up to date with origin/feature/server-side-search)
- Latest commit under test: f256143 "feat(catalog-ui): add loading indicators and error states with retry"
- Environment: Local (git-bash / Windows), backend + frontend served via `docker compose up -d --build`
  (backend container on :8080, frontend/nginx container on :5173, both verified healthy via HTTP 200
  before running Playwright)
- Notes: `npm ci` failed with `EUSAGE` because `package-lock.json` is out of sync with `package.json`
  (pre-existing uncommitted local modification to package-lock.json, not part of this run's changes).
  Fell back to `npm install` to unblock build/test execution, per script's own guidance to adapt for
  environment quirks. This lockfile drift should be fixed/committed separately so `npm ci` works in CI.

## Backend (Spring Boot) - mvn test
- Command: `cd ecom-project && ./mvnw -q test`
- Result: PASS (BUILD SUCCESS)
- Tests run: 1
- Failures: 0
- Errors: 0
- Skipped: 0
- Build time: ~9.1s test execution (EcomProjectApplicationTests.contextLoads)
- Details: Spring context loads cleanly, H2 in-memory DB schema (category, product) created via
  Hibernate, data seeder inserts 3 categories / 4 products successfully. Only cosmetic warning:
  Mockito self-attaching / dynamic agent loading warning (JDK future-compat notice, non-blocking).

## Frontend Build (React/Vite)
- Command: `cd ecom-front/ecom-catalog-react && npm install && npm run build`
- Result: PASS
- Output: `vite v6.3.2 building for production... 36 modules transformed. built in 907ms`
  - dist/index.html: 0.47 kB
  - dist/assets/index-*.css: 231.73 kB (gzip 30.88 kB)
  - dist/assets/index-*.js: 192.05 kB (gzip 60.63 kB)
- No build errors or warnings.

## Frontend Unit Tests (Vitest)
- Command: `npx vitest run`
- Result: FAIL (pre-existing defect, unchanged since prior run)
- Test Files: 2 failed (2)
- Tests: 2 failed (2)
- Details:
  - `src/api/productsApi.test.js` > "fetchProducts sends query params and returns json" -
    `ReferenceError: vi is not defined` (missing `import { vi } from 'vitest'`)
  - `src/api/productsApi.test.js` > "fetchCategories sends request to /api/categories" - same
    `ReferenceError: vi is not defined`
  - `tests/catalog-search-pagination.spec.js` also gets picked up by the default Vitest test glob
    and fails to collect (`Playwright Test did not expect test.describe() to be called here`) because
    Vitest is not configured to exclude the Playwright `tests/` directory. This is a Vitest config
    issue (missing `exclude`/`include` scoping), separate from the `vi` import bug.

## Playwright E2E
- Command: `npx playwright install --with-deps && npx playwright test`
  (Playwright reused the already-running Docker frontend container on http://localhost:5173 via
  `reuseExistingServer: true` in playwright.config.js - no port conflict, no new dev server spawned.)
- Result: FAIL (3/4 failing; same root cause as previous run - unchanged by the loading/error-state
  UX commit f256143, since that commit did not add pagination)
- Tests: 4
- Passed: 1
- Failed: 3
- Flaky: none reported
- Breakdown:
  1. "loads initial products and shows pagination controls" - FAIL (10.3s) - `getByRole('button',
     { name: /Prev/i })` not found; no Prev/Next controls exist in the current UI.
  2. "can search by keyword and resets to page 1 behavior" - FAIL (10.3s) - same missing
     Prev/Next button locator, expected `toBeDisabled()`.
  3. "can change sort order and it updates results" - PASS (280ms).
  4. "can paginate to next page and updates the list" - FAIL (test timeout 60s) - `Next` button
     never appears, `.click()` times out waiting for the locator.
- Root cause (confirmed unchanged from prior run): the backend/frontend do not implement pagination
  UI (Prev/Next controls); the search/sort/list features work, but these 3 E2E tests assert
  pagination controls that do not exist in the shipped implementation.
- Attachments: Playwright HTML/trace artifacts and error-context.md files under
  `ecom-front/ecom-catalog-react/test-results/`.

## Summary
- Overall status: FAIL (backend PASS, frontend build PASS, frontend unit tests FAIL, E2E FAIL)
- Backend: PASS (1/1)
- Frontend build: PASS
- Frontend unit tests (Vitest): FAIL (0/2 passing) - broken by missing `vi` import
- Playwright E2E: FAIL (1/4 passing) - 3 tests fail due to missing pagination UI

### Follow-ups / defects
1. **[Bug] Vitest unit tests broken** - `src/api/productsApi.test.js` uses `vi.fn()` without
   importing `vi` from `vitest`. Add `import { vi } from 'vitest'` (or extend the existing
   `import { describe, it, expect, beforeEach } from 'vitest'` line). Low effort (~5 min).
2. **[Config] Vitest picks up Playwright spec files** - `tests/catalog-search-pagination.spec.js`
   is collected by the default Vitest run and fails to load because it uses `@playwright/test`'s
   `test.describe`. Vitest config needs an `exclude` entry for the `tests/` (Playwright) directory,
   or Playwright specs should live outside Vitest's default include glob.
3. **[Product gap / test mismatch] Missing pagination UI** - 3 of 4 Playwright E2E tests assert
   Prev/Next pagination controls that do not exist in the current catalog UI. The backend returns
   all matching products in one response and the frontend renders them without pagination. Decide
   whether to (a) implement pagination in the UI to match the tests, or (b) update/remove these
   E2E assertions to match the current (non-paginated) design. This is unchanged by the
   loading/error-state UX commit (f256143), which did not touch pagination.
4. **[Housekeeping] package-lock.json out of sync** - `npm ci` fails with `EUSAGE` because the
   committed/working-tree `package-lock.json` does not match `package.json` (missing entries for
   `@playwright/test`, `vitest`, and their transitive deps). Regenerate and commit an up-to-date
   lockfile so CI (`npm ci`) is reproducible; `npm install` was used as a workaround for this run.
5. **[Low priority]** `npm install` reports 19 vulnerabilities (3 low, 5 moderate, 10 high, 1
   critical) in frontend dependencies - recommend `npm audit` review as a follow-up, not a blocker
   for this feature branch.
