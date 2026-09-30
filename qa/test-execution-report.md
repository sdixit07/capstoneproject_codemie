# QA Test Execution Report

**Branch:** `feat/product-details-by-id`
**Date:** 2026-09-30

## Backend tests (JUnit / Maven)

**Command:** `cd ecom-project && ./mvnw -q test`

**Result:** All tests passed.

| Test class | Result |
|---|---|
| `org.ecom.productcatalog.controller.ProductControllerGetByIdTest` | Tests run: 4, Failures: 0, Errors: 0, Skipped: 0 |
| `org.ecom.productcatalog.controller.ProductControllerIT` | Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 |
| `org.ecom.productcatalog.EcomProjectApplicationTests` | Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 |
| **Total** | **Tests run: 6, Failures: 0, Errors: 0, Skipped: 0** |

`./mvnw -q test` exited with code 0. No `Tests run:` line was printed to console under `-q`; the per-class summaries above were pulled from `target/surefire-reports/*.txt`.

## Frontend E2E tests (Playwright)

**Setup:**
- `npm ci` — completed successfully (274 packages installed, exit code 0; `npm audit` reports 19 pre-existing vulnerabilities in dependencies, no action taken as it is out of scope).
- `npx playwright install --with-deps` — completed successfully (exit code 0, no output; browsers were already present/no missing OS deps).

**Command:** `npm run test:e2e` (runs `playwright test`, chromium project, 2 workers)

**Result:** 8 tests total — **5 passed, 3 failed, 0 flaky** (run duration ~1.4m).

| Spec file | Test | Result |
|---|---|---|
| `product-details.spec.js` | clicking a catalog card navigates to its product details page | passed |
| `product-details.spec.js` | deep link to an existing product id shows full details | passed |
| `product-details.spec.js` | deep link to a non-existent product id shows not-found message with back link | passed |
| `product-details.spec.js` | deep link to a non-numeric product id shows an error state | passed |
| `catalog-search-pagination.spec.js` | loads initial products and shows pagination controls | **failed** |
| `catalog-search-pagination.spec.js` | can search by keyword and resets to page 1 behavior | **failed** |
| `catalog-search-pagination.spec.js` | can change sort order and it updates results | passed |
| `catalog-search-pagination.spec.js` | can paginate to next page and updates the list | **failed** |

All 4 tests in `product-details.spec.js` (the feature under test on this branch) pass.

## Notes / Failures

All backend tests pass. All frontend tests for the product-details feature (the scope of this branch) pass.

The 3 failures are all in `catalog-search-pagination.spec.js`, which is unrelated to the product-details feature being delivered on this branch. Root cause investigated in `ecom-front/ecom-catalog-react/src/pages/Catalog.jsx`: the current catalog page implementation fetches the full product list from `/api/products` in one call and does client-side filtering/sorting only — there is no pagination UI (no "Prev"/"Next" buttons, no `pagination` component) and no server-side query flow anywhere in `src/`. The spec file was written against a server-side paginated catalog that does not exist in the current implementation.

1. **`loads initial products and shows pagination controls`**
   - Error: `expect(locator).toBeVisible() failed` — `getByRole('button', { name: /Prev/i })` — element not found (timeout 10000ms).
   - Cause: Catalog page has no Prev button. Mitigation: either implement server-side pagination with Prev/Next controls in `Catalog.jsx`, or remove/update this test if pagination is out of scope.

2. **`can search by keyword and resets to page 1 behavior`**
   - Error: `expect(locator).toBeDisabled() failed` — `getByRole('button', { name: /Prev/i })` — element not found (timeout 10000ms).
   - Cause: same as above — no Prev button exists to assert against.

3. **`can paginate to next page and updates the list`**
   - Error: `Test timeout of 60000ms exceeded` while `locator.click` waited for `getByRole('button', { name: /Next/i })`.
   - Cause: same as above — no Next button exists to click.

These 3 failures are pre-existing and unrelated to the `feat/product-details-by-id` changes; they were not introduced by this branch. No action taken on them here beyond documenting root cause, since implementing catalog pagination is outside the scope of the product-details feature.
