# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the product catalog backend. |

Copy `.env.example` to `.env` (or `.env.local`) to override it. Vite inlines this
value at build time, so a production image must be rebuilt when it changes.

## Scripts

- `npm run dev` – start the dev server on http://localhost:5173
- `npm run build` – production build
- `npm run lint` – ESLint
- `npm test` – vitest unit tests (`src/**/*.test.js`)
- `npm run test:e2e` – Playwright e2e tests (`tests/`, needs the backend on `VITE_API_BASE_URL`)
