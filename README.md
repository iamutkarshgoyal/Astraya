# Astraya - Luxury Handmade Candle Brand

Astraya is a full-stack e-commerce application for a celestial-themed luxury
handmade candle brand. The app includes a React storefront, FastAPI backend,
PostgreSQL persistence, authentication, cart, wishlist, checkout, WhatsApp
order handoff, admin dashboard, tests, and Docker deployment files.

## Current Status

Milestones 1 through 20 are complete.

## Stack

**Frontend:** React 19, Vite, TypeScript, TailwindCSS, Framer Motion,
React Router with DOM APIs, Axios, React Hook Form, Zod, ShadCN-style UI,
Lucide React, Vitest

**Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Pydantic, Alembic,
PostgreSQL, JWT Authentication, Google OAuth, Passlib, Bcrypt, Python Dotenv,
CORS Middleware, Pytest

## Brand Direction

- Luxury
- Elegant
- Premium
- Minimal
- Warm
- Inspired by the cosmos

## Brand Colors

- Background: `#FAF6EF`, `#F7F2E9`
- Cards: `#FFFDF9`
- Gold: `#D4B06A`
- Dark Gold: `#B88A2A`
- Navy: `#0D2147`
- Text: `#3E3E3E`
- Border: `#E7DCC7`

## Public Contact

- Email: `astraya.candles@gmail.com`
- WhatsApp: `https://wa.me/918958383707`
- The frontend contact form validates locally and opens WhatsApp with an
  encoded message instead of submitting to the backend contact endpoint.

## Project Structure

```text
Astraya/
|-- frontend/
|   |-- public/images/
|   |-- src/components/
|   |-- src/context/
|   |-- src/hooks/
|   |-- src/layouts/
|   |-- src/pages/
|   |-- src/routes/
|   |-- src/services/
|   |-- src/styles/
|   |-- src/types/
|   `-- src/utils/
|-- backend/
|   |-- alembic/
|   |-- app/api/
|   |-- app/core/
|   |-- app/database/
|   |-- app/models/
|   |-- app/routers/
|   |-- app/schemas/
|   |-- app/services/
|   `-- tests/
|-- docker-compose.yml
|-- docker-compose.prod.yml
`-- DEPLOYMENT.md
```

## Docker Quick Start

Start Docker Desktop, then run from the project root:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Backend docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

The development backend runs Alembic migrations and seeds the starter catalog
before starting the API.

## Database

PostgreSQL is the source of truth for application data.
Anonymous pre-login cart and wishlist choices are temporary browser state and
sync into PostgreSQL after the customer signs in.

Product image files live in `images/products/<product-slug>/` and are served
from GitHub through jsDelivr CDN. See `docs/CDN_IMAGES.md` for the upload,
commit, push, URL, and cache refresh workflow. The GitHub repository or image
asset repository must be public for jsDelivr to serve the files.

Default local settings:

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

Hosted PostgreSQL providers such as Neon can be used by setting
`DATABASE_URL`. When this value is present, it overrides the individual
`POSTGRES_*` fields:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require&channel_binding=require
```

Inside Docker, the backend uses `POSTGRES_HOST=postgres` because the database
runs as the `postgres` Compose service. Passwords are encoded with
`quote_plus`.

Database tables:

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

## API Summary

Base API URL: `http://localhost:8000`

- Auth: `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/me`,
  `/auth/forgot-password`, `/auth/reset-password`, `/auth/google`
- Catalog: `/categories`, `/categories/{slug}`, `/products`, `/products/{slug}`
- Cart: `/cart`, `/cart/items`, `/cart/items/{product_id}`
- Wishlist: `/wishlist`, `/wishlist/{product_id}`
- Orders: `/orders`, `/orders/me`, `/orders/{order_number}`
- Reviews: `/reviews/product/{product_id}`, `/reviews`
- Engagement: `/contact`, `/newsletter`
- Admin: `/admin/stats`, `/admin/categories`, `/admin/products`,
  `/admin/orders`, `/admin/customers`, `/admin/contact-messages`,
  `/admin/newsletter`

Default local admin:

- Email: `admin@astraya.in`
- Password: `Admin@12345`

Change these values in production.

## Frontend Routes

- `/`
- `/shop`
- `/categories`
- `/categories/:slug`
- `/products/:slug`
- `/cart`
- `/wishlist`
- `/checkout`
- `/order-success/:orderNumber`
- `/login`
- `/signup`
- `/forgot-password`
- `/profile`
- `/about`
- `/contact`
- `/admin`
- `/faq`
- `/privacy`
- `/terms`

## Testing

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
pytest
python -m compileall app tests

cd ../frontend
npm ci
npm run test
npm run build
npm audit --audit-level=moderate
```

Use Node `22.22.0` or newer for local frontend installs.

## Deployment

Development:

```bash
docker compose up --build
```

Production-style Compose:

```bash
SECRET_KEY=replace-me ADMIN_PASSWORD=replace-me docker compose -f docker-compose.prod.yml up --build -d
```

For a hosted database, add `DATABASE_URL` to your deployment environment or
local `.env` file. Do not commit a real database URL with credentials.

See `DEPLOYMENT.md` for environment variables and verification commands.

## Milestone Progress

- [x] Milestone 1 - Folder structure
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
