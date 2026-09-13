# Claude Code CIL (CFU) usage evidence

This document maps the intent of prompts (planning / CLI runs emulated by CodeMie workflow) to the actual file changes and commits in this repository. 

> Note: In this environment, the Claude Code CLI was orchestrated via CodeMie's GitHub API writes to create commits. This file still provides the required evidence mapping (changes → commits).

## Enhancement
* **Product Detail Page (PDP)**
  * Backend: add aGET `/api/products/{id}` to fetch single product (200/404)
  * Frontend: add React Router and a PDD at `/products/:id`, navigate from product cards

---

## Prompts → changes → commits

### 1) Backend: add service method to fetch product by ID
- Pintent: "Add service method getProductById to support PAP endpoint."
- Files changed:
  - `ecom-project/src/main/java/org/ecom/productcatalog/service/ProductService.jav`
S- Commit: ff5ef63cf272d165abe2665c0299ed624a898090 https://github.com/sdixit07/capstoneproject_codemie/commit/ff5ef63cf272d165abe2665c0299ed624a898090

### 2) Backend: add endpoint GET /api/products/{id}
- Pintent: "Add `GetMapping("/{id}")` to return a single product or 404."
- Files changed:
  - `ecom-project/src/main/java/org/ecom/productcatalog/controller/ProductController.java`
- Commit: 0c3a7af70b7ff5c7ae0c39c489933e2701379eb4 https://github.com/sdixit07/capstoneproject_codemie/commit/0c3a7af70b7ff5c7ae0c39c489933e2701379eb4


### 3) Frontend: add routing dependency (react-router-dom)
- Pintent: "Add react-router-dom to support /products/:id page."
- Files changed:
  - `ecom-front/ecom-catalog-react/package.json`
- Commit: bf77f98303c43871cd93d06994fd5389db498895 https://github.com/sdixit07/capstoneproject_codemie/commit/bf77f98303c43871cd93d06994fd5389db498895

### 4) Frontend: wire up React Router routes
- Pintent: "Wrap the app with BrowserRouter and add a PDP route at /products/:id."
- Files changed:
  - `ecom-front/ecom-catalog-react/src/main.jsx`
- Commit: cdebf832991ab6e305f378698967bd2e8df1f5f0 https://github.com/sdixit07/capstoneproject_codemie/commit/cdebf832991ab6e305f378698967bd2e8df1f5f0

### 5) Frontend: add ProductDetail page (loading / 404 / error flows)
- Pintent: "Create a new page component to fetch a product by ID and render states for loading, 404, and error."
- Files changed:
  - `ecom-front/ecom-catalog-react/src/pages/ProductDetail.jsx`
- Commit: 597ae85bb03ae09da65a6788a19c843472f4fcf1 https://github.com/sdixit07/capstoneproject_codemie/commit/597ae85bb03ae09da65a6788a19c843472f4fcf1

### 6) Frontend: link product cards to the PDP
- Pintent: "Make each product card clickable and navigate to /products/:id."
- Files changed:
  - `ecom-front/ecom-catalog-react/src/ProductList.jsx`
- Commit: c268f43fe9a622af8956b9580b69618a98a0c301 https://github.com/sdixit07/capstoneproject_codemie/commit/c268f43fe9a622af8956b9580b69618a98a0c301

---

## Pre-flight, build, test, Docker verification

- Claude Code CIL Preflight: NOT EXECUTED IN THIS ENVIRONMENT (API-based commits only).
- Local build script: NOT ADDED IN THIS ENVIRONMENT.
- `docker compose up --build` : NOT EXECUTED IN THIS ENVIRONMENT.
