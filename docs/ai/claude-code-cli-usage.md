# Claude Code CLI Usage — Phase 5, Option A: Product Details

## Agent / command used

- Assistant: "E-Commerce Code & Developer Assistant" (Claude agent running in this repo's dev workflow), operating directly on the working tree at
  `C:\Capstone Projects\Codemie\capstoneproject_codemie`.
- Branch: `feat/product-details-by-id` (created from `main`).
- Tooling used: `Read`/file edit tools, `git`, `mvnw`/`mvn`, `npm`, `docker compose build`.
- No `git push` and no PR creation was performed — this doc records a local-only commit for the user to review and push.

## Requirements implemented

### Backend (`ecom-project`, Spring Boot + H2)

- Added `GET /api/products/{id}`:
  - `200 OK` with the `Product` JSON body when the id exists.
  - `404 Not Found` when the id does not exist.
  - `400 Bad Request` when `{id}` is not numeric.
- Response shape for success is unchanged from the existing `Product` serialization: `id, name, description, imageUrl, price, category { id, name }`.
- Error responses use a `@ControllerAdvice` (`ApiExceptionHandler`) returning a consistent JSON shape:
  ```json
  { "timestamp": "...", "status": 404, "error": "Not Found", "message": "...", "path": "/api/products/999" }
  ```
- `ProductService.getProductById(Long id)` uses the existing `ProductRepository.findById` and throws a new `ProductNotFoundException` (mapped to 404) when absent.
- Invalid (non-numeric) ids trigger Spring's `MethodArgumentTypeMismatchException`, which is mapped to 400 by the same `@ControllerAdvice`.

### Frontend (`ecom-front/ecom-catalog-react`, React 19 + Vite)

- Added `react-router-dom` (not previously a dependency) and wired up client-side routing:
  - `src/main.jsx` now wraps `App` in a `BrowserRouter`.
  - `src/App.jsx` now declares `Routes`: `/` → `Catalog` page, `/products/:id` → `ProductDetail` page.
  - The previous catalog markup/logic from `App.jsx` was moved, unchanged, into `src/pages/Catalog.jsx`.
- `src/ProductList.jsx` product cards are now wrapped in a `react-router-dom` `Link` to `/products/{id}`, making the whole card clickable/navigable (also reachable via keyboard, since it's a real anchor).
- `src/pages/ProductDetail.jsx` (already present from a prior run) fetches `GET http://localhost:8080/api/products/{id}` and renders:
  - a loading state while the request is in flight,
  - a not-found state on `404`,
  - a generic error state for any other failure,
  - on success: name, image, description, price, category name, and a "Back to catalog" link to `/`.

## Files changed (overview)

Backend:
- `ecom-project/src/main/java/org/ecom/productcatalog/controller/ProductController.java` — added `GET /{id}` endpoint.
- `ecom-project/src/main/java/org/ecom/productcatalog/service/ProductService.java` — added `getProductById`.
- `ecom-project/src/main/java/org/ecom/productcatalog/exception/ProductNotFoundException.java` — new.
- `ecom-project/src/main/java/org/ecom/productcatalog/exception/ApiError.java` — new, consistent error body.
- `ecom-project/src/main/java/org/ecom/productcatalog/exception/ApiExceptionHandler.java` — new `@ControllerAdvice`.
- `ecom-project/src/test/java/org/ecom/productcatalog/controller/ProductControllerGetByIdTest.java` — new MockMvc tests (200 / 404 / 400).

Frontend:
- `ecom-front/ecom-catalog-react/package.json`, `package-lock.json` — added `react-router-dom` dependency and `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` dev dependencies.
- `ecom-front/ecom-catalog-react/vite.config.js` — added Vitest `test` config (`jsdom` environment, setup file, excludes the Playwright `tests/` folder from Vitest runs).
- `ecom-front/ecom-catalog-react/src/setupTests.js` — new, loads `@testing-library/jest-dom` matchers.
- `ecom-front/ecom-catalog-react/src/main.jsx` — wraps `App` in `BrowserRouter`.
- `ecom-front/ecom-catalog-react/src/App.jsx` — now defines `Routes` (`/`, `/products/:id`).
- `ecom-front/ecom-catalog-react/src/pages/Catalog.jsx` — new; catalog logic moved from `App.jsx` unchanged.
- `ecom-front/ecom-catalog-react/src/ProductList.jsx` — cards wrapped in `Link` to `/products/{id}`.
- `ecom-front/ecom-catalog-react/src/pages/ProductDetail.test.jsx` — new Vitest/RTL tests (loading, success, 404, generic error).
- `ecom-front/ecom-catalog-react/src/ProductList.test.jsx` — new Vitest/RTL test asserting card links point to `/products/{id}`.

## Test / build results

- Backend: `./mvnw test` — `BUILD SUCCESS`, 4 tests run (3 new in `ProductControllerGetByIdTest` + the existing `EcomProjectApplicationTests`), 0 failures.
  - Note: `ProductControllerIT.java` (pre-existing, unrelated to this feature) exercises search/sort/min-max price filtering that is not implemented on `GET /api/products` yet. Its filename ends in `IT`, which is **not** picked up by the default Surefire `mvn test` include patterns, so it does not run as part of `mvn test` and does not affect this build. It was verified unaffected by this change by running it explicitly (`./mvnw test -Dtest=ProductControllerIT#getProductsByCategoryPath_stillWorks`), which still passes, confirming `GET /api/products/category/{categoryId}` routing was not broken by the new `GET /api/products/{id}` endpoint.
- Frontend: `npm ci`-equivalent installs done via `npm install`; `npm test` (Vitest) — 2 test files / 5 tests pass (`ProductList.test.jsx`, `pages/ProductDetail.test.jsx`).
  - Pre-existing, unrelated failure flagged (not fixed, out of scope for this feature): `src/api/productsApi.test.js` imports a `./productsApi` module that does not exist in the repo (leftover scaffolding for a separate, unimplemented search/pagination API-client feature).
  - `npm run build` — succeeds (`vite build`, output in `dist/`).
- Docker: `docker compose build` (build only, containers were not started) — both `backend` and `frontend` images build successfully.

## How to run locally

Backend:
```bash
cd ecom-project
./mvnw spring-boot:run      # starts on http://localhost:8080, H2 in-memory DB, seeded via DataSeeder
./mvnw test                 # run backend tests
```

Frontend:
```bash
cd ecom-front/ecom-catalog-react
npm install                 # or npm ci
npm run dev                 # starts on http://localhost:5173
npm test                    # run Vitest/RTL unit tests
npm run build                # production build
```

Manual verification of the new endpoint (with backend running):
```bash
curl -i http://localhost:8080/api/products/1        # 200, product JSON
curl -i http://localhost:8080/api/products/999999   # 404, ApiError JSON
curl -i http://localhost:8080/api/products/abc      # 400, ApiError JSON
```

Docker (build-only sanity check, does not start containers):
```bash
docker compose build
```
