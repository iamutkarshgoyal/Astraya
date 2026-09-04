# Repository Guidelines

## Project Structure & Module Organization

Astraya uses a React 19, Vite, and TypeScript frontend with a FastAPI/PostgreSQL backend. In `frontend/src`, place reusable UI in `components/`, screens in `pages/`, API access in `services/`, state in `context/`, and contracts in `types/`. Keep WebGL code under `components/three/`. Browser assets belong in `frontend/public/`; CDN catalog originals live in `images/products/<product-slug>/`.

Backend modules live in `backend/app/{routers,schemas,models,services,database}`. Alembic revisions are in `backend/alembic/versions`, with tests in `backend/tests`. Deployment configuration is in `docker-compose*.yml`, `netlify.toml`, and `render.yaml`.

## Build, Test, and Development Commands

Use Node 22.22.0 or newer.

```bash
docker compose up --build                 # Start frontend, API, and PostgreSQL
cd frontend && npm ci && npm run dev      # Run Vite at localhost:5173
cd frontend && npm run build              # Type-check and create production output
cd frontend && npm run test               # Run Vitest once
cd backend && .venv/bin/uvicorn app.main:app --reload
cd backend && .venv/bin/alembic upgrade head
cd backend && .venv/bin/pytest
```

Create the backend virtual environment and install `backend/requirements.txt` before using `.venv` commands.

## Coding Style & Naming Conventions

TypeScript is strict. Use two-space indentation, single quotes, semicolons, and the `@/` alias. Name components and pages in PascalCase (`ProductCard.tsx`), hooks with `use` (`useCart.ts`), and services in kebab-case (`order-service.ts`). Reuse existing contexts, types, and API services.

For Python, use four-space indentation, snake_case functions/modules, PascalCase classes, and type hints. Keep routers thin and business behavior in services. No formatter or linter is configured; match adjacent code.

## Testing Guidelines

Place Vitest files beside their subjects as `*.test.ts`; put Pytest files in `backend/tests` as `test_*.py`. Add regression tests for pricing, customization, authentication, orders, migrations, and API contracts. There is no coverage threshold, but new behavior needs meaningful success and failure cases. Run both suites and the frontend build before a PR.

## Commit & Pull Request Guidelines

History uses short summaries such as `added dns and domain`. Prefer a concise imperative subject for one logical change. PRs should explain behavior/schema changes, link issues, list verification commands, and include desktop/mobile screenshots for UI work. Call out environment variables or Alembic revisions.

## Security & Configuration

Never commit `.env` files, Neon URLs, SMTP credentials, JWT secrets, or WhatsApp tokens. Configure secrets in Netlify/Render and keep `BACKEND_CORS_ORIGINS` aligned with `astrayacandles.com`. Include an Alembic migration whenever persisted models change.
