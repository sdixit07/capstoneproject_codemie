# Test Execution Report

**Date:** 2026-09-19
**Branch:** `feat/product-entity-package-cleanup`
**Scope:** Backend Maven test suite (`ecom-project/`) and frontend Playwright E2E suite (`ecom-front/ecom-catalog-react/`), executed against the `Product` JPA entity package-relocation refactor (entity moved from `org.ecom.productcatalog.Product` to `org.ecom.productcatalog.model.Product`, matching `Category`; declared as no behavior change).

## 1. Backend — Maven / JUnit (Surefire)

**Command:** `mvnw.cmd test` (run from `ecom-project/`)

**Result: BUILD SUCCESS**

```
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

Only `org.ecom.productcatalog.EcomProjectApplicationTests` (Spring context load test) is picked up by the default `mvn test` invocation. This is expected: Surefire's default include patterns (`*Test.java`, `*Tests.java`, `*TestCase.java`) do not match the repository's `*IT.java` naming convention, and no Failsafe plugin is configured in `pom.xml`, so `ProductControllerIT.java` is silently excluded from the standard test phase. This is not new — confirmed by diffing against `main`, where the only change to `ProductControllerIT.java` on this branch is the entity import path (`org.ecom.productcatalog.Product` → `org.ecom.productcatalog.model.Product`); the class and its assertions are otherwise unchanged.

**Evidence:** `ecom-project/target/surefire-reports/` (`TEST-org.ecom.productcatalog.EcomProjectApplicationTests.xml`, `org.ecom.productcatalog.EcomProjectApplicationTests.txt`)

### Additional finding (informational — not part of the standard `mvn test` run)

For completeness, `ProductControllerIT.java` (13 MockMvc integration tests covering `/api/products` search, sort, min/max price filtering and validation, plus `/api/products/category/{id}`) was run explicitly via `mvnw.cmd test -Dtest=ProductControllerIT`:

```
Tests run: 13, Failures: 10, Errors: 0, Skipped: 0 -- BUILD FAILURE
```

Root cause: `ProductController.java` only implements `GET /api/products` (no params) and `GET /api/products/category/{categoryId}` — it has no `search`, `sort`, `minPrice`/`maxPrice` query-param handling or validation. The test class asserts behavior for all of these. This mismatch pre-dates this branch (verified via `git diff main` on both the controller and the test file — the only change on this branch to either file is the entity import path) and is **not a regression introduced by the Product entity package-relocation refactor** under review. No fix was attempted, per task scope (test execution + report only, no unrelated refactor/feature work); flagging here for visibility since it represents dead/untested coverage under the standard build.

## 2. Frontend — Playwright E2E

**Setup:**
- `npm ci` in `ecom-front/ecom-catalog-react/` — 193 packages installed successfully (19 pre-existing npm audit advisories, unrelated to this change, not addressed).
- `npx playwright install --with-deps` — browsers already present, exit 0, no changes needed.
- App stack brought up via `docker compose up -d --build` from repo root (backend on `:8080`, frontend on `:5173`, both using the self-contained H2 in-memory DB per `docker-compose.yml`; no separate `db` service). Verified reachable: `GET http://localhost:8080/api/products` → 200, `GET http://localhost:5173/` → 200.
- Ran `CI_CI=1 FE_BASE_URL=http://localhost:5173 npm run test:e2e` (`playwright test`) so Playwright's `webServer` config reused the already-running Docker frontend container instead of starting its own `npm run dev` server.

**Result:**

```
4 tests, 1 passed, 3 failed
```

| Test | Result |
|---|---|
| loads initial products and shows pagination controls | FAILED |
| can search by keyword and resets to page 1 behavior | FAILED |
| can change sort order and it updates results | passed |
| can paginate to next page and updates the list | FAILED (60s timeout) |

Root cause of the 3 failures: the tests expect visible `Prev`/`Next` pagination buttons (`getByRole('button', { name: /Prev|Next/i })`), but the frontend catalog UI does not render any pagination controls — confirmed by searching `ecom-front/ecom-catalog-react/src` for pagination-related UI code (none found outside of a test mock file). Confirmed via `git diff main -- ecom-front/ecom-catalog-react/src` that this branch makes **no frontend changes at all** (it is a backend-only entity package refactor), so this is a pre-existing frontend feature gap, not a regression caused by the change under review. No fix was attempted, per task scope.

**Evidence:** `ecom-front/ecom-catalog-react/test-results/` (per-test failure artifacts: `error-context.md`, traces) and `ecom-front/ecom-catalog-react/test-results/.last-run.json`. No `playwright-report/` HTML report was generated (no HTML reporter configured in `playwright.config.js`; default list reporter used).

## 3. Summary

| Suite | Run | Passed | Failed | Errors | Skipped |
|---|---|---|---|---|---|
| Backend (`mvn test`, standard) | 1 | 1 | 0 | 0 | 0 |
| Backend (`ProductControllerIT`, explicit run, informational) | 13 | 3 | 10 | 0 | 0 |
| Frontend (Playwright E2E) | 4 | 1 | 3 | 0 | 0 |

**Regression check for the Product entity package-relocation refactor:** No regressions attributable to the refactor were found. The one test that is part of the standard build (`EcomProjectApplicationTests`) passes, confirming the Spring context (including JPA entity scanning after the package move) loads correctly. The failing `ProductControllerIT` tests and the failing Playwright tests both correspond to functionality (query-param filtering/sorting on the backend, pagination controls on the frontend) that is absent from `main` as well as this branch, verified by direct diff — pre-existing gaps, out of scope for this refactor's QA pass.

## 4. Environment state at end of run

- Docker Compose stack (backend, frontend) was brought up during this run via docker compose up -d --build to make the app reachable for the Playwright E2E run, and was torn down afterward via docker compose down. Confirmed via docker compose ps -a that no containers remain. The stack is **not running** at the end of this QA pass.
