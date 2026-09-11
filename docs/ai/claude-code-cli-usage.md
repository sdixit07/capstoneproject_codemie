# Claude Code CLI Usage - Price Range Filter (feat/server-side-catalog-query)

Session evidence for the end-to-end implementation of the **Price Range Filter**
feature in the e-commerce product catalog (Spring Boot backend + React/Vite frontend).

- Date: 2026-09-11
- Branch: `feat/server-side-catalog-query`
- Tooling: Claude Code CLI (Read + Bash only, files authored via shell heredocs),
  Maven wrapper 3.9.9 / JDK 21 (Corretto), Node 24 / npm 11.

## 1. Feature request driving the work

> Implement the Price Range Filter feature end-to-end.
>
> **Backend** - add optional `minPrice` / `maxPrice` query parameters to
> `GET /api/products` alongside the existing parameters. Semantics: `minPrice` only ->
> `price >= minPrice`; `maxPrice` only -> `price <= maxPrice`; both -> inclusive range;
> neither -> no price restriction. Implement it with `JpaSpecificationExecutor` plus a
> `Specification` builder so price and category predicates compose. Return HTTP 400 with a
> clear message when `minPrice > maxPrice` (and for negative prices), reusing the existing
> error-reporting mechanism or adding a small `@RestControllerAdvice`. Cover it with
> repository-level (`@DataJpaTest`), service-level and MockMvc integration tests using
> distinguishable price buckets.
>
> **Frontend** - add "Min Price"/"Max Price" numeric inputs in a `PriceFilter.jsx`
> component wired into `App.jsx`, send the params only when non-blank, validate min > max
> inline without firing a request, and add a Clear/Reset control that empties the fields and
> reloads the unfiltered list. The existing category filter must keep working in combination
> with the price filter.
>
> **Also** - create an executable `scripts/build.sh` (backend `mvnw` + frontend
> `npm ci` / `npm run build`, `set -euo pipefail`, script-relative paths), actually run the
> builds and tests, and document the session in `docs/ai/claude-code-cli-usage.md`.

## 2. State of the repository before the change (findings)

The branch name is aspirational: the "server-side catalog query" was **not** implemented in
main code, only sketched in two broken test stubs, and the build was red.

| Finding | Detail |
| --- | --- |
| `GET /api/products` took no query parameters | It returned `productRepository.findAll()`; category filtering existed only as the separate path endpoint `/api/products/category/{categoryId}`. |
| No `Specification` support | `ProductRepository` extended `JpaRepository` only. |
| Backend test sources did not compile | `ProductControllerIT.java` used `org.junit.jpiter` (typo), `@Autowire` and `@TEST`; `mvnw clean test` failed in `testCompile` with 8 errors. |
| `ProductControllerIT` would never have run anyway | Surefire default includes do not match `*IT.java` and no Failsafe plugin was configured. |
| H2 missing from `pom.xml` | `application.properties` configures `jdbc:h2:mem:testdb` + `org.h2.Driver`, but the only JDBC dependency was `mysql-connector-j`. |
| Frontend API module missing | `src/api/productsApi.test.js` imported `./productsApi`, which did not exist; it also used `vi` without importing it and called a non-existent matcher `orOnlyCalled()`, so vitest could not collect the suite. |
| `npm ci` was broken | `package-lock.json` was out of sync with `package.json` (vitest was never locked). |
| Frontend filtering was fully client-side | `App.jsx` fetched all products with raw `fetch` and filtered/sorted in memory. |

## 3. Files created / modified

### Backend (`ecom-project/`)

| File | Change | Rationale |
| --- | --- | --- |
| `src/main/java/org/ecom/productcatalog/repository/ProductRepository.java` | modified | Now also extends `JpaSpecificationExecutor<Product>` so dynamic filters can be composed. |
| `src/main/java/org/ecom/productcatalog/repository/specification/ProductSpecifications.java` | created | Individually optional predicates (`hasCategory`, `priceGreaterThanOrEqualTo`, `priceLessThanOrEqualTo`, `nameOrDescriptionContains`) plus `withFilters(...)` / `priceBetween(...)` composition helpers. |
| `src/main/java/org/ecom/productcatalog/service/ProductService.java` | modified | Added `getProducts(categoryId, minPrice, maxPrice, search, sort)`, `getProductsByPriceRange(...)`, price-range validation and whitelist-based sort parsing. Existing `getAllProducts()` / `getProductByCategory()` untouched. |
| `src/main/java/org/ecom/productcatalog/controller/ProductController.java` | modified | `GET /api/products` now accepts optional `categoryId`, `minPrice`, `maxPrice`, `search`, `sort` and delegates to the service. |
| `src/main/java/org/ecom/productcatalog/exception/InvalidProductQueryException.java` | created | Domain exception for unusable filter combinations. |
| `src/main/java/org/ecom/productcatalog/exception/ApiError.java` | created | Single JSON error shape (`timestamp`, `status`, `error`, `message`, `path`). |
| `src/main/java/org/ecom/productcatalog/exception/GlobalExceptionHandler.java` | created | `@RestControllerAdvice` mapping `InvalidProductQueryException` and `MethodArgumentTypeMismatchException` to HTTP 400 + `ApiError`. |
| `pom.xml` | modified | Added the missing `com.h2database:h2` runtime dependency and `maven-failsafe-plugin` so `*IT` tests actually execute during `verify`. |
| `src/test/java/org/ecom/productcatalog/repository/ProductSpecificationsTest.java` | created | `@DataJpaTest` coverage: min-only, max-only, both, inclusive boundaries, no-match, price+category composition. |
| `src/test/java/org/ecom/productcatalog/service/ProductServiceTest.java` | created | Service-level coverage of the same cases plus invalid-range, negative-price and bad-sort paths. |
| `src/test/java/org/ecom/productcatalog/controller/ProductControllerIT.java` | repaired + extended | Fixed the non-compiling stub, seeded two categories with distinct price buckets, added MockMvc assertions for filtered 200s, inclusive boundaries, empty results, price+category combination and both 400 cases. |

### Frontend (`ecom-front/ecom-catalog-react/`)

| File | Change | Rationale |
| --- | --- | --- |
| `src/api/productsApi.js` | created | The module the existing test expected: `fetchProducts`, `fetchCategories`, `buildProductQuery` (omits blank params) and `validatePriceRange`. |
| `src/PriceFilter.jsx` | created | Min/Max numeric inputs, inline validation message and the Clear button - a presentational sibling of `CategoryFilter.jsx`. |
| `src/App.jsx` | modified | Holds `minPrice` / `maxPrice` / `priceError` state, fetches through the API module, debounces price changes (300 ms), skips the request while the range is invalid, and resets on Clear. Category/search/sort behaviour kept as before. |
| `src/App.css` | modified | Appended `.price-filter` / `.price-filter-error` styling (plain CSS, matching the existing file). |
| `src/api/productsApi.test.js` | repaired + extended | Imported `vi`, replaced the non-existent `orOnlyCalled()` matcher, added cases for blank omission, min-only, max-only, both + category, `buildProductQuery` and `validatePriceRange`. |
| `package-lock.json` | modified | Regenerated by `npm install` because the committed lockfile was out of sync, which made `npm ci` fail. |

### Scripts / docs

| File | Change | Rationale |
| --- | --- | --- |
| `scripts/build.sh` | created (executable) | One command to build and test both stacks; `set -euo pipefail`, script-relative paths, progress headers. |
| `docs/ai/claude-code-cli-usage.md` | filled in (was 0 bytes) | This document. |

Existing `Dockerfile`s and `docker-compose.yml` were **not** touched.

## 4. Design decisions and trade-offs

1. **Specifications over derived queries / `@Query`.** The catalog needs any combination of
   category, price bounds and search. `JpaSpecificationExecutor` + `ProductSpecifications`
   keeps every predicate optional and independently testable; each builder returns a neutral
   `cb.conjunction()` when its argument is `null`, so `withFilters(...)` can compose blindly
   with no null branching at the call sites. `Specification.where(...)` was avoided
   (deprecated in newer Spring Data) in favour of `alwaysTrue().and(...)`.
2. **Validation lives in the service, not the controller.** `ProductService.validatePriceRange`
   throws `InvalidProductQueryException`, so the rule holds for every caller and is unit
   testable without MVC. The controller stays a thin mapping layer and returns no ad-hoc
   strings.
3. **New `@RestControllerAdvice`.** The codebase had no error handling at all, so a small
   `GlobalExceptionHandler` plus an `ApiError` record was added as the one error shape. It
   also converts `MethodArgumentTypeMismatchException` (e.g. `minPrice=abc`) into a 400 with
   a readable message instead of Spring's default 400 body.
4. **`double` for prices.** `Product.price` is a primitive `double`, so the params are
   `Double` (nullable = "not supplied"). Introducing `BigDecimal` would have been a wider,
   unrelated refactor of the entity, seeder and frontend.
5. **Response shape of `GET /api/products` kept as a JSON array.** The pre-existing IT stub
   asserted a paged envelope (`items`/`page`/`size`/`totalItems`/`totalPages`) that no
   production code ever produced. Introducing paging would have changed the contract the
   React app consumes, so the array contract was preserved and those specific assertions in
   the stub were re-pointed at the real contract. `search` and `sort` params *were* added so
   the intent of the other two stub tests is still exercised. Paging remains open work.
6. **Failsafe added.** Without it `ProductControllerIT` silently never ran; `verify` now runs
   unit tests (Surefire) and the integration test (Failsafe).
7. **Price filtering is server-side, category/search/sort stay client-side.** This is the
   smallest change that satisfies the feature (the API layer supports all five params, so
   moving the rest server-side later is a one-line change per filter).
8. **Debounced fetch + no request on invalid range.** The effect validates first; when the
   range is invalid it sets the inline error and returns before scheduling the request.

## 5. API contract

### `GET /api/products`

All query parameters are optional. With no parameters the full catalog is returned, exactly
as before this change.

| Param | Type | Optional | Semantics |
| --- | --- | --- | --- |
| `minPrice` | number (`Double`) | yes | `price >= minPrice` (inclusive) |
| `maxPrice` | number (`Double`) | yes | `price <= maxPrice` (inclusive) |
| `categoryId` | integer (`Long`) | yes | `category.id = categoryId` |
| `search` | string | yes | case-insensitive `LIKE` on `name` or `description` |
| `sort` | string `field[,asc\|desc]` | yes | sortable fields: `id`, `name`, `price` |

Rules: `minPrice` only -> lower bound; `maxPrice` only -> upper bound; both -> inclusive
range; neither -> no price restriction. Filters combine with `AND`.

**Example requests**

```
GET /api/products
GET /api/products?minPrice=100
GET /api/products?maxPrice=250.50
GET /api/products?minPrice=100&maxPrice=500
GET /api/products?categoryId=1&minPrice=100&maxPrice=700&sort=price,desc
```

**200 OK** - `GET /api/products?minPrice=100&maxPrice=200`

```json
[
  {
    "id": 4,
    "name": "Blender",
    "description": "High speed blender for smoothies and more.",
    "imageUrl": "https://placehold.co/600x400",
    "price": 129.99,
    "category": { "id": 3, "name": "Home and Kitchen" }
  }
]
```

**400 Bad Request** - `GET /api/products?minPrice=500&maxPrice=100`

```json
{
  "timestamp": "2026-09-11T20:21:05.5196641+05:30",
  "status": 400,
  "error": "Bad Request",
  "message": "minPrice (500.0) must be less than or equal to maxPrice (100.0)",
  "path": "/api/products"
}
```

Other 400 messages from the same handler:

- `minPrice must not be negative but was -10.0` (same for `maxPrice`)
- `Parameter 'maxPrice' has an invalid value: cheap`
- `Unsupported sort field 'foo'. Supported fields: [id, name, price]`

`GET /api/products/category/{categoryId}` is unchanged and still returns the plain list.

## 6. How to build and test

```bash
# everything (backend verify + frontend install, vitest, vite build)
./scripts/build.sh

# backend only
cd ecom-project
./mvnw -B clean verify        # on Git Bash for Windows: sh ./mvnw -B clean verify

# frontend only
cd ecom-front/ecom-catalog-react
npm ci                        # npm install if the lockfile is out of sync
npm test                      # vitest run
npm run build                 # vite production build
```

`scripts/build.sh` resolves paths from its own location, so it can be run from any working
directory, and fails fast (`set -euo pipefail`). It also installs the parent
`ecom-front/package.json` (where `bootstrap` / `react-bootstrap` are declared and from where
node resolves them) - but only when `ecom-front/node_modules` is missing, see section 9.

Note: `mvnw -o` (offline) does not work in this environment - the Surefire/Failsafe plugin
jars are not in the local `~/.m2` cache, so the build needs network access on first run.

## 7. Verification results (actual output)

### 7.1 Baseline before the change (both stacks red)

`sh ./mvnw -B clean test` in `ecom-project`:

```
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.13.0:testCompile
        (default-testCompile) on project productcatalog: Compilation failure
[ERROR] .../ProductControllerIT.java:[7,24] package org.junit.jpiter does not exist
[ERROR] .../ProductControllerIT.java:[25,6] cannot find symbol  symbol: class Autowire
[ERROR] .../ProductControllerIT.java:[79,6] cannot find symbol  symbol: class TEST
[INFO] BUILD FAILURE
```

`npm test` in `ecom-front/ecom-catalog-react`:

```
 FAIL  src/api/productsApi.test.js [ src/api/productsApi.test.js ]
Error: Failed to load url ./productsApi (resolved id: ./productsApi) in
.../src/api/productsApi.test.js. Does the file exist?

 Test Files  1 failed (1)
      Tests  no tests
```

### 7.2 Backend after the change - `sh ./mvnw -B clean verify`

Surefire (unit / slice tests):

```
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 12.00 s -- in org.ecom.productcatalog.EcomProjectApplicationTests
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.954 s -- in org.ecom.productcatalog.repository.ProductSpecificationsTest
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.745 s -- in org.ecom.productcatalog.service.ProductServiceTest
[INFO] Results:
[INFO] Tests run: 19, Failures: 0, Errors: 0, Skipped: 0
```

Failsafe (integration test):

```
[INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 9.505 s -- in org.ecom.productcatalog.controller.ProductControllerIT
[INFO] Results:
[INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- failsafe:3.5.2:verify (default) @ productcatalog ---
[INFO] BUILD SUCCESS
[INFO] Total time:  34.226 s
```

Total backend: **32 tests, 0 failures, 0 errors**, jar built at
`ecom-project/target/productcatalog-0.0.1-SNAPSHOT.jar`.

### 7.3 Frontend after the change

`npm test` (vitest):

```
 RUN  v2.1.9 C:/Capstone Projects/Codemie/capstoneproject_codemie/ecom-front/ecom-catalog-react

 v src/api/productsApi.test.js (12 tests) 9ms

 Test Files  1 passed (1)
      Tests  12 passed (12)
   Duration  717ms
```

`npm run build` (vite):

```
vite v6.3.2 building for production...
transforming...
v 35 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.47 kB | gzip:  0.31 kB
dist/assets/index-DwmIE6Xb.css  231.67 kB | gzip: 30.90 kB
dist/assets/index-BIPKdgYo.js   191.62 kB | gzip: 60.49 kB
v built in 1.19s
```

`npx eslint src` produced no output (no errors, no warnings).

### 7.4 Full pipeline - `bash scripts/build.sh` (run from `/tmp`, i.e. outside the repo)

```
==================================================================
>>> BUILD SUCCESSFUL
==================================================================
Backend jar : /c/Capstone Projects/Codemie/capstoneproject_codemie/ecom-project/target
Frontend dist: /c/Capstone Projects/Codemie/capstoneproject_codemie/ecom-front/ecom-catalog-react/dist
```

Exit code: `0`.

### 7.5 Not executed

- The React UI was not exercised in a browser and there are **no component/DOM tests**: the
  project has no `jsdom` / `@testing-library/react` dependency and no vitest `environment`
  configuration. The price-filter logic that *is* covered by tests was therefore extracted
  into pure functions (`buildProductQuery`, `validatePriceRange`) in `src/api/productsApi.js`.
- The application was not run against MySQL/Postgres via `docker compose`; all backend tests
  run on the in-memory H2 database configured in `application.properties`.

### 7.6 Live smoke check against the built jar

`java -jar target/productcatalog-0.0.1-SNAPSHOT.jar` (H2 + `DataSeeder`, 4 seeded products
at 99.99 / 129.99 / 599.99 / 999.99), queried with curl:

```
$ curl -s 'http://localhost:8080/api/products' | (count)
4 products

$ curl -s 'http://localhost:8080/api/products?minPrice=599.99'
[('Smart phone', 599.99), ('Laptop', 999.99)]          # lower bound is inclusive

$ curl -s 'http://localhost:8080/api/products?minPrice=100&maxPrice=200'
[{"id":4,"name":"Blender","description":"High speed blender for smoothies and more.",
  "imageUrl":"https://placehold.co/600x400","price":129.99,
  "category":{"id":3,"name":"Home and Kitchen"}}]

$ curl -s -i 'http://localhost:8080/api/products?minPrice=500&maxPrice=100'
HTTP/1.1 400
Content-Type: application/json
{"timestamp":"2026-09-11T20:21:05.5196641+05:30","status":400,"error":"Bad Request",
 "message":"minPrice (500.0) must be less than or equal to maxPrice (100.0)","path":"/api/products"}

$ curl -s 'http://localhost:8080/api/products?minPrice=-10'
{"timestamp":"...","status":400,"error":"Bad Request",
 "message":"minPrice must not be negative but was -10.0","path":"/api/products"}

$ curl -s 'http://localhost:8080/api/products?maxPrice=cheap'
{"timestamp":"...","status":400,"error":"Bad Request",
 "message":"Parameter 'maxPrice' has an invalid value: cheap","path":"/api/products"}

$ curl -s 'http://localhost:8080/api/products?sort=foo'
{"timestamp":"...","status":400,"error":"Bad Request",
 "message":"Unsupported sort field 'foo'. Supported fields: [id, name, price]","path":"/api/products"}
```

## 8. Open items / follow-ups

- **Paging is still not implemented.** The `items` / `page` / `size` / `totalItems` /
  `totalPages` envelope sketched in the original test stubs is intentionally out of scope for
  this feature; `GET /api/products` returns a plain JSON array.
- The frontend still filters by category and searches/sorts in memory. The API layer already
  supports `categoryId`, `search` and `sort`, so moving those server-side is a small follow-up.
- No component-level tests (needs `jsdom` + `@testing-library/react` as dev dependencies).
- `Product.price` is a `double`; money would be better modelled as `BigDecimal`.

## 9. Note on `ecom-front/node_modules`

`ecom-front/node_modules` (3159 files) is **committed to the repository**, and
`bootstrap` / `react-bootstrap` are resolved from there. Running `npm ci` in that folder
rewrites those tracked files (line-ending churn only, no content change), so
`scripts/build.sh` installs the parent manifest **only when `ecom-front/node_modules` is
missing** and prints `ecom-front/node_modules already present - skipping parent install`
otherwise. Any incidental churn produced while verifying this feature was reverted with
`git checkout -- ecom-front/node_modules`, so the working tree contains only the intended
changes. `ecom-front/ecom-catalog-react/node_modules` is git-ignored and is installed by
the script.

Final confirmation run of `bash scripts/build.sh` from `/tmp` (i.e. outside the repository):

```
[INFO] Tests run: 19, Failures: 0, Errors: 0, Skipped: 0      <- Surefire
[INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0      <- Failsafe (ProductControllerIT)
[INFO] BUILD SUCCESS
ecom-front/node_modules already present - skipping parent install
 Test Files  1 passed (1)
      Tests  12 passed (12)
built in 781ms
>>> BUILD SUCCESSFUL
```

Script exit code: `0`.
