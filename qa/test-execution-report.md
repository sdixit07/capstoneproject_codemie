# Test Execution Report

**Date:** 2026-09-23
**Branch:** `feat/product-entity-package-cleanup`
**Scope:** Backend Maven test suite (`ecom-project/`), executed against the `Product` JPA entity package-relocation refactor (entity moved from `org.ecom.productcatalog.Product` to `org.ecom.productcatalog.model.Product`, matching `Category`) and the newly added `ProductDetail` frontend page (no backend changes).

## 1. Backend — Maven / JUnit (Surefire)

**Command:** `./mvnw.cmd test` (run from `ecom-project/`)

**Result: BUILD SUCCESS**

```
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

Only `org.ecom.productcatalog.EcomProjectApplicationTests` (Spring context load test) is picked up by the default `mvn test` invocation. This is expected and unchanged from the prior run on this branch: Surefire's default include patterns (`*Test.java`, `*Tests.java`, `*TestCase.java`) do not match the repository's `*IT.java` naming convention, and no Failsafe plugin is configured in `pom.xml`, so `ProductControllerIT.java` is silently excluded from the standard test phase.

**Evidence:** `ecom-project/target/surefire-reports/TEST-org.ecom.productcatalog.EcomProjectApplicationTests.xml`, `org.ecom.productcatalog.EcomProjectApplicationTests.txt`

### Class breakdown (standard `mvn test` run)

| Test class | Run | Passed | Failed | Errors | Skipped | Time |
|---|---|---|---|---|---|---|
| `org.ecom.productcatalog.EcomProjectApplicationTests` | 1 | 1 | 0 | 0 | 0 | 12.63 s |

### Additional finding (informational — not part of the standard `mvn test` run)

For completeness, `ProductControllerIT.java` (13 MockMvc integration tests covering `/api/products` search, sort, min/max price filtering and validation, plus `/api/products/category/{id}`) was re-run explicitly via `./mvnw.cmd test -Dtest=ProductControllerIT`:

```
Tests run: 13, Failures: 10, Errors: 0, Skipped: 0 -- BUILD FAILURE
```

Root cause: `ProductController.java` only implements `GET /api/products` (no params) and `GET /api/products/category/{categoryId}` — it has no `search`, `sort`, `minPrice`/`maxPrice` query-param handling or validation. The test class asserts behavior for all of these. Confirmed via `git diff main` that the only change on this branch to either `ProductController.java` or `ProductControllerIT.java` is the entity import path (`org.ecom.productcatalog.Product` → `org.ecom.productcatalog.model.Product`) — the class logic and assertions are otherwise unchanged from `main`. This is **not a regression introduced by the Product entity package-relocation refactor**; it is pre-existing dead/untested coverage under the standard build. No fix was attempted, per task scope (test execution + report only).

#### Failing tests (`ProductControllerIT`)

| Test | Failure reason |
|---|---|
| `getProducts_bothBounds_returnInclusiveRange` | JSON path `$` — expected collection size `6`, got `27` (no price-range filtering applied) |
| `getProducts_boundsAreInclusive` | JSON path `$` — expected collection size `1`, got `27` |
| `getProducts_maxPriceOnly_filtersOutExpensiveProducts` | JSON path `$` — expected collection size `2`, got `27` |
| `getProducts_minPriceGreaterThanMaxPrice_returnsBadRequest` | Expected HTTP status `400`, got `200` (no validation implemented) |
| `getProducts_minPriceOnly_filtersOutCheaperProducts` | JSON path `$` — expected collection size `6`, got `27` |
| `getProducts_negativePrice_returnsBadRequest` | Expected HTTP status `400`, got `200` |
| `getProducts_nonNumericPrice_returnsBadRequest` | Expected HTTP status `400`, got `200` |
| `getProducts_priceRangeCombinesWithCategory` | JSON path `$` — expected collection size `1`, got `27` |
| `getProducts_priceRangeWithoutMatches_returnsEmptyArray` | JSON path `$` — expected collection size `0`, got `27` |
| `getProducts_sort_price_desc_works` | JSON path `$[0].price` — expected value greater than `120.0`, got `101.0` (no sort param handling) |

All 10 failures trace back to the same root cause (missing controller functionality for search/sort/price-range params), not to distinct bugs.

**Evidence:** `ecom-project/target/surefire-reports/TEST-org.ecom.productcatalog.controller.ProductControllerIT.xml`, `org.ecom.productcatalog.controller.ProductControllerIT.txt`

## 2. Notable warnings / environment notes

- `HHH90000025`: H2Dialect does not need to be specified explicitly (cosmetic Hibernate deprecation warning, not an error).
- `spring.jpa.open-in-view is enabled by default` — Spring Boot informational warning, no action needed.
- Mockito self-attaching / dynamic Java agent loading warnings (`ByteBuddy` agent) — expected on this JDK/Mockito combination, does not affect test outcomes; will require explicit agent configuration on a future JDK.
- No database connectivity issues: H2 in-memory `testdb` started cleanly, schema (`category`, `product` tables + FK) created successfully, and seed inserts/selects completed without error in both runs.

## 3. Summary

| Suite | Run | Passed | Failed | Errors | Skipped |
|---|---|---|---|---|---|
| Backend (`mvn test`, standard) | 1 | 1 | 0 | 0 | 0 |
| Backend (`ProductControllerIT`, explicit run, informational) | 13 | 3 | 10 | 0 | 0 |

**Overall result (standard `mvn test` command as requested): PASS** — 1/1 tests passed, BUILD SUCCESS.

**Regression check for the Product entity package-relocation refactor:** No regressions attributable to the refactor were found. The one test that is part of the standard build (`EcomProjectApplicationTests`) passes, confirming the Spring context (including JPA entity scanning after the package move) loads correctly. The failing `ProductControllerIT` tests correspond to functionality (query-param filtering/sorting) absent from `main` as well as this branch, verified by direct diff — a pre-existing gap, out of scope for this refactor's QA pass.
