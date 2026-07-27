# CLAUDE.md

## Active Development Contract

Build Astraya milestone by milestone.

- Complete only one milestone per turn unless the user explicitly approves the
  next milestone.
- Do not skip milestones.
- After completing a milestone, review the work, fix issues, report what was
  completed, then stop and wait for approval.
- No placeholder code.
- No lorem ipsum.
- Every code file must compile before a milestone is marked complete.
- Components should be reusable and production-ready.

Current stop point: **Milestone 20 - Deployment is complete.**

## Project Context

Astraya is a full-stack e-commerce application for a luxury handmade candle
brand inspired by the cosmos.

The application is split into:

- `frontend/` - React 19, Vite, TypeScript, TailwindCSS, Framer Motion, React
  Router with DOM APIs, Axios, React Hook Form, Zod, ShadCN-style UI,
  Lucide React, Vitest
- `backend/` - Python 3.12, FastAPI, SQLAlchemy 2, Pydantic, Alembic,
  PostgreSQL, JWT Authentication, Google OAuth, Passlib, Bcrypt, Python Dotenv,
  CORS Middleware, Pytest
- `docker-compose.yml` - local development runtime with frontend, backend, and
  PostgreSQL services
- `docker-compose.prod.yml` - production-style runtime with Nginx frontend,
  backend, and PostgreSQL services

## Brand System

Visual direction:

- Luxury
- Elegant
- Premium
- Minimal
- Warm
- Inspired by the cosmos

Colors:

- Background: `#FAF6EF`, `#F7F2E9`
- Cards: `#FFFDF9`
- Gold: `#D4B06A`
- Dark Gold: `#B88A2A`
- Navy: `#0D2147`
- Text: `#3E3E3E`
- Border: `#E7DCC7`
- White: `#FFFFFF`

Typography:

- Headings: Cinzel, Playfair Display, Cormorant Garamond
- Body: Lora, Libre Baskerville
- Buttons: Poppins

Public contact details:

- Email: `astraya.candles@gmail.com`
- WhatsApp: `https://wa.me/918958383707`
- The frontend contact form validates locally and opens WhatsApp with an
  encoded message. It must not call the backend contact endpoint.

## Folder Structure

Frontend:

```text
frontend/
|-- public/images/
|-- src/components/
|-- src/context/
|-- src/hooks/
|-- src/layouts/
|-- src/pages/
|-- src/routes/
|-- src/services/
|-- src/styles/
|-- src/types/
`-- src/utils/
```

Backend:

```text
backend/
|-- alembic/
|-- app/api/
|-- app/core/
|-- app/database/
|-- app/models/
|-- app/routers/
|-- app/schemas/
|-- app/services/
`-- tests/
```

## Database Rules

PostgreSQL is the source of truth for application data. Do not store business
data in JSON files, local text files, browser-only state, or ad hoc SQLite
databases.
Anonymous pre-login cart and wishlist choices may live temporarily in the
browser and must sync into PostgreSQL after authentication.

Product image files must live in `images/products/<product-slug>/` and are
served from GitHub through jsDelivr CDN. Keep the CDN settings in the backend
configuration and follow `docs/CDN_IMAGES.md` for upload and cache refresh
steps. The GitHub repository or image asset repository must be public for
jsDelivr to serve the files.

Default local database settings:

```python
username = "postgres"
password = quote_plus("Hello@123")
host = "localhost"
port = "5432"
database = "postgres"
engine = create_engine(
    f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"
)
```

Hosted PostgreSQL providers such as Neon should be configured with
`DATABASE_URL`. When present, it overrides the individual `POSTGRES_*` fields:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require&channel_binding=require
```

Inside Docker, the backend must use `POSTGRES_HOST=postgres` because the
database runs as the `postgres` Compose service. The backend settings must use
`quote_plus` for the password so `Hello@123` is encoded safely in the SQLAlchemy
connection string.

Tables:

- Users
- Categories
- Products
- Product Images
- Cart Items
- Orders
- Order Items
- Wishlist
- Reviews
- Contact Messages
- Newsletter

## Completed Functionality

- Full storefront: home, shop, categories, product detail, reviews, about,
  WhatsApp-first contact, FAQ, privacy, and terms.
- Customer flows: signup, login, forgot/reset password, profile, cart,
  wishlist, checkout, and WhatsApp order confirmation handoff.
- Admin dashboard: stats, products, categories, orders, customers, contact
  messages, and newsletter subscribers.
- Backend APIs: auth, catalog, cart, wishlist, orders, reviews, contact,
  newsletter, and admin.
- Seed data: admin user, categories, products, product images, and reviews.
- Local and production Docker Compose files.
- Frontend and backend tests.

## Development Notes

- Keep backend routes in `backend/app/routers/`.
- Keep route aggregation in `backend/app/api/`.
- Keep SQLAlchemy models in `backend/app/models/`.
- Keep Pydantic schemas in `backend/app/schemas/`.
- Keep business logic in `backend/app/services/`.
- Keep shared backend config in `backend/app/core/`.
- Keep database engine, session, and base config in `backend/app/database/`.
- Keep frontend API calls in `frontend/src/services/`.
- Keep reusable UI in `frontend/src/components/`.
- Keep page-level views in `frontend/src/pages/`.
- Prefer environment variables over hard-coded service URLs.
- Run Alembic migrations with `alembic upgrade head` before starting the
  backend outside Docker.
- Use Node `22.22.0` or newer for frontend dependency installs.
- The frontend uses `react-router@8.3.0` directly because React Router 8
  exposes DOM APIs from `react-router`.
- Google login requires `GOOGLE_CLIENT_ID`.
- Local password reset can expose the reset token when
  `EXPOSE_PASSWORD_RESET_TOKEN=true` and `ENVIRONMENT` is not `production`.
- Hosted databases should use `DATABASE_URL` in the deployment environment. Do
  not commit real database credentials.
- Netlify hosts the React frontend only. Deploy FastAPI separately, for example
  with the root `render.yaml` Blueprint, then set Netlify
  `VITE_API_BASE_URL` to the deployed backend URL and set backend
  `BACKEND_CORS_ORIGINS` to the Netlify site origin.

## Local Commands

```bash
docker compose up --build
cd backend && pytest
cd frontend && npm run test && npm run build
```

Default local admin:

- Email: `admin@astraya.in`
- Password: `Admin@12345`

## Milestone Plan

- [x] Milestone 1 - Create complete folder structure
- [x] Milestone 2 - Initialize React frontend
- [x] Milestone 3 - Initialize FastAPI backend
- [x] Milestone 4 - Configure PostgreSQL
- [x] Milestone 5 - Create SQLAlchemy models
- [x] Milestone 6 - Authentication APIs
- [x] Milestone 7 - Header and Footer
- [x] Milestone 8 - Home Page
- [x] Milestone 9 - Shop Page
- [x] Milestone 10 - Categories
- [x] Milestone 11 - Product Details
- [x] Milestone 12 - Cart
- [x] Milestone 13 - Wishlist
- [x] Milestone 14 - Checkout
- [x] Milestone 15 - WhatsApp Order Integration
- [x] Milestone 16 - About
- [x] Milestone 17 - Contact
- [x] Milestone 18 - Admin Dashboard
- [x] Milestone 19 - Testing
- [x] Milestone 20 - Deployment
