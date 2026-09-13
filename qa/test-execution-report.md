# Test Execution Report — Server-side pagination for products

| | |
| --- | --- |
| **Date** | 2026-09-13 |
| **Branch** | `feature/server-side-sorting` |
| **Commits under test** | `675671d` (pagination), `a0144a0` (Docker verification + e2e fixes) |
| **Feature** | Server-side pagination for `GET /api/products` (backend + React frontend) |
| **Overall result** | **PASS** — all suites green; 2 defects found and fixed during execution |

## 1. Summary

| Suite | Command | Result |
| --- | --- | --- |
| Backend unit + integration | `./mvnw clean test` | **PASS** — 52 run, 0 failures, 0 errors, 10 skipped |
| Frontend unit | `npm test` (vitest) | **PASS** — 19 passed, 0 failed |
| Frontend production build | `npm run build` | **PASS** — 35 modules, no errors |
| Lint | `npx eslint src tests` | **PASS** — exit 0, no findings |
| Docker image build | `docker compose build` | **PASS** — both images built |
| Live API contract | `curl` against running containers | **PASS** — 6/6 checks |
| End-to-end (default page size) | `npx playwright test` | **PASS** — 9 passed, 3 skipped |
| End-to-end (small page size) | `VITE_PAGE_SIZE=2 npx playwright test` | **PASS** — 12 passed, 0 skipped |

## 2. Environment

| Component | Version / detail |
| --- | --- |
| OS | Windows 11 Enterprise 10.0.26200 |
| Docker Engine | 28.5.1 (Docker Desktop) |
| Backend runtime | Java 21 (`eclipse-temurin:21-jre-jammy`), Maven 3.9.8 in image |
| Backend database | H2 in-memory (`jdbc:h2:mem:ecomdb`) |
| Frontend build | Node 20 Alpine, Vite 6.3.2 |
| Unit test runner | Vitest 2.1.9, `environment: node` |
| E2E runner | Playwright, Chromium (Desktop Chrome), 2 workers |
| Seed dataset | **4 products across 2 categories** |

## 3. Backend — `./mvnw clean test`

Result: **BUILD SUCCESS** — `Tests run: 52, Failures: 0, Errors: 0, Skipped: 10`.

Per-class results captured:

| Test class | Run | Failures | Skipped |
| --- | --- | --- | --- |
| `EcomProjectApplicationTests` | 1 | 0 | 0 |
| `ProductServicePagingTests` | 7 | 0 | 0 |
| `ProductServiceSortTests` | 5 | 0 | 0 |
| `ProductControllerIT`, `ProductSortingTests` | remainder of the 52 | 0 | 10 |

### Contract coverage (MockMvc)

| Requirement | Test | Result |
| --- | --- | --- |
| Default paging returns expected metadata fields | `getProducts_noParams_returnsFirstPageWithMetadata` | PASS |
| `page` / `size` params honoured | `getProducts_pageAndSizeAreHonoured` | PASS |
| Last page may be partial | `getProducts_lastPageMayBePartial` | PASS |
| Page beyond last returns empty content, keeps metadata | `getProducts_pageBeyondLast_returnsEmptyContentButKeepsMetadata` | PASS |
| Maximum size (50) accepted | `getProducts_maximumSizeIsAccepted` | PASS |
| Paging combines with sorting | `getProducts_pagingCombinesWithSorting` | PASS |
| Negative `page` → 400 | `getProducts_negativePage_returnsBadRequest` | PASS |
| `size < 1` → 400 | `getProducts_sizeBelowOne_returnsBadRequest` | PASS |
| `size > 50` → 400 | `getProducts_sizeAboveMaximum_returnsBadRequest` | PASS |
| Non-numeric paging params → 400 | `getProducts_nonNumericPagingParams_returnBadRequest` | PASS |
| Category endpoint is paged too | `getProductsByCategoryPath_isPagedToo` | PASS |
| Category endpoint invalid size → 400 | `getProductsByCategoryPath_invalidSize_returnsBadRequest` | PASS |

### Skipped tests (10)

All 10 are **pre-existing** `@Disabled` specs in `ProductControllerIT` for the
unimplemented `search` / `categoryId` / `minPrice` / `maxPrice` query params
(`"...not implemented on GET /api/products yet - see backlog"`). They are unrelated
to pagination and were intentionally left disabled.

### Note on test discovery

`maven-surefire-plugin` previously used its default includes, which **exclude
`*IT` classes**. `ProductControllerIT` was therefore being compiled but never
executed. Surefire now includes `*Test`, `*Tests` and `*IT`, so the MockMvc
integration tests genuinely run as part of `mvn test`.

## 4. Frontend unit tests — `npm test`

Result: **19 passed / 0 failed**, 2 files, 822ms.

| File | Tests | Result |
| --- | --- | --- |
| `src/api/productsApi.test.js` | 15 | PASS |
| `src/Pagination.test.js` | 4 | PASS |

Coverage highlights:

- Default paging params present in the request URL (`page=0&size=10`).
- `page` / `size` forwarded; out-of-range values clamped client-side (`page=-5` → 0, `size=999` → 50).
- Category endpoint URL built correctly with paging.
- `normalizePage` response-shape matrix: `PagedResponse` DTO, raw Spring Data `Page` (`number`), `pageable.pageNumber` fallback, bare array from an unpaged backend, `null` / non-object payloads, and `totalPages` derived when omitted.
- Pagination button rules: Previous disabled on first page, Next disabled on last, both disabled for an empty catalog, correct `Page X of Y` label.

### Scope note — no component-rendering tests

`vite.config.js` sets the Vitest `environment` to `node`, and neither `jsdom` nor
`@testing-library/react` is a dependency. Rendering `<Pagination />` or `<App />`
would require introducing a DOM environment and a component-testing library, which
was out of scope. The component's decision logic is covered as pure functions above,
and its rendered markup is covered by the Playwright suite in section 6.

## 5. Build, lint and Docker

| Check | Result |
| --- | --- |
| `npm run build` | PASS — 35 modules transformed, built in ~1.0s. `dist/index.html` 0.47 kB, CSS 231.73 kB (gzip 30.88 kB), JS 192.42 kB (gzip 60.87 kB) |
| `npx eslint src tests` | PASS — exit 0, no findings |
| `docker compose build` | PASS — `capstoneproject_codemie-backend` 509MB, `capstoneproject_codemie-frontend` 74.2MB |
| `docker compose up -d` | PASS — backend `0.0.0.0:8080->8080`, frontend `0.0.0.0:5173->80`, both `running` |

Neither Dockerfile required modification for this feature.

## 6. Live API verification (against running containers)

| # | Request | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| 1 | `GET /api/products` | 200 + full envelope | 200, `content` + all metadata fields | PASS |
| 2 | `GET /api/products?page=0&size=3` | first 3 ids | ids `[1,2,3]` | PASS |
| 3 | `GET /api/products?page=1&size=3` | partial last page + metadata | ids `[4]`, `page: 1`, `size: 3`, `totalElements: 4`, `totalPages: 2` | PASS |
| 4 | `GET /api/products?page=0&size=3&sortBy=price&sortDir=desc` | sorted desc, `id asc` tiebreaker applied | `sort: "price: DESC,id: ASC"`, prices `[999.99, 599.99, 129.99]` | PASS |
| 5 | `?page=-1` / `?size=0` / `?size=51` / `?page=abc` | 400 each | **400, 400, 400, 400** | PASS |
| 6 | `GET /api/products/category/1?page=0&size=2` | 200 + paged envelope | `page: 0`, `size: 2`, `totalElements: 2`, `totalPages: 1` | PASS |

Frontend served through nginx: **HTTP 200**.

## 7. End-to-end (Playwright)

Executed against the Dockerised backend. Two runs were required — see Defect 2.

### Run A — default page size (10)

**9 passed, 3 skipped** (12.0s).

The 3 skipped specs are the multi-page behaviours. With only 4 seeded products, a
page size of 10 puts the entire catalog on one page, so `Next` is disabled and the
specs self-skip via `test.skip(...)`. **This meant the core pagination behaviour was
not actually being exercised** — addressed by Defect 2 below.

### Run B — `VITE_PAGE_SIZE=2` (forces a multi-page catalog)

**12 passed, 0 skipped** (4.3s).

| Spec | Result |
| --- | --- |
| First page shows indicator, capped at page size | PASS |
| Previous disabled on the first page | PASS |
| Next advances the page and requests `page=1` from the backend | PASS |
| Next disabled once the last page is reached | PASS |
| Changing sort order resets to page 0 (`page=0&sortDir=desc` requested) | PASS |
| Changing category resets to page 0 | PASS |
| 6 pre-existing sorting specs (`catalog-sort.spec.js`) | PASS |

## 8. Defects found during execution

Both were found by executing against a real stack — neither was visible from the
native build alone. Both are **fixed** in commit `a0144a0`.

### Defect 1 — e2e spec asserted a full first page

- **Severity:** Medium (test defect — the spec would fail for any user running it)
- **Detail:** `catalog-pagination.spec.js` asserted `toHaveCount(10)` on the first page. The seeded catalog holds only 4 products, so the assertion could never pass.
- **Fix:** the spec now asserts the page is non-empty and capped at the page size, rather than exactly full.
- **Status:** Fixed, re-run PASS.

### Defect 2 — pagination behaviour was untestable against the seed data

- **Severity:** High (coverage gap — the feature's primary behaviour was unverified)
- **Detail:** at the hardcoded page size of 10, all 4 seeded products fit on one page, so every multi-page spec self-skipped. Next/Previous navigation and reset-to-page-0 were never executed.
- **Fix:** page size now reads `VITE_PAGE_SIZE` (valid range 1–50, otherwise 10), following the existing `VITE_API_BASE_URL` convention. A small-page run exercises the multi-page paths.
- **Status:** Fixed — all 12 specs pass at `VITE_PAGE_SIZE=2`.

### Observation — CORS is pinned to port 5173

- **Severity:** Low for this feature; worth tracking
- **Detail:** an initial e2e attempt on port 5199 failed **all 12 specs** with no products rendered. Both `ProductController` and `CategoryController` hardcode `@CrossOrigin(origins = "http://localhost:5173")`, so the browser blocks requests from any other origin. Failure mode is silent — an empty catalog, not a visible error.
- **Action:** not changed. It pre-dates this feature and widening the allowed origins is a separate decision. E2E runs must use port 5173.

## 9. Known gaps / follow-ups

| Item | Notes |
| --- | --- |
| No server-side name search | The search box filters the **current page only**. Searching for a product on page 4 while viewing page 1 finds nothing. Adding a `search` param would also let several of the 10 `@Disabled` tests be re-enabled. |
| 10 disabled backend tests | Pre-existing, awaiting `search` / `minPrice` / `maxPrice` support. |
| No component-rendering tests | Would require adding `jsdom` + `@testing-library/react`; see section 4. |
| Small seed dataset | 4 products means realistic paging depends on `VITE_PAGE_SIZE`. A larger seed set would make default-size runs meaningful. |
| CORS origin hardcoded | See section 8. |

## 10. How to reproduce

```bash
# Backend unit + integration tests
cd ecom-project && ./mvnw clean test

# Frontend unit tests, build, lint
cd ecom-front/ecom-catalog-react
npm install && npm test && npm run build && npx eslint src tests

# Full stack via Docker
docker compose build && docker compose up -d

# End-to-end (backend must be up; frontend must serve on port 5173 for CORS)
cd ecom-front/ecom-catalog-react
CI_CI=1 npx playwright test                      # default page size
VITE_PAGE_SIZE=2 CI_CI=1 npx playwright test     # exercises multi-page paths
```
