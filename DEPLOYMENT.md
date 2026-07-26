# Astraya Deployment

## Local Development

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

The development backend runs Alembic migrations and seeds the starter catalog
before starting the API.

## Production Compose

Create a `.env` file from `.env.example`, then set production secrets:

```bash
SECRET_KEY=replace-with-a-long-random-value
ADMIN_PASSWORD=replace-with-a-strong-admin-password
OWNER_WHATSAPP_PHONE=919876543210
VITE_API_BASE_URL=https://api.example.com
BACKEND_CORS_ORIGINS=https://shop.example.com
```

Build and run:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production frontend is served by Nginx on `${FRONTEND_PORT:-8080}` and the
backend is served on `${BACKEND_PORT:-8000}`. PostgreSQL data is stored in the
`postgres_data` volume.

## Database

Astraya uses PostgreSQL as the source of truth for users, catalog, cart,
wishlist, orders, reviews, contact messages, and newsletter subscribers. The
backend composes the SQLAlchemy URL with `quote_plus` so passwords such as
`Hello@123` are encoded safely.

Run migrations manually when needed:

```bash
cd backend
alembic upgrade head
python -m app.database.seed
```

## Verification

```bash
cd backend && pytest
cd ../frontend && npm run test && npm run build && npm audit --audit-level=moderate
docker compose config
docker compose -f docker-compose.prod.yml config
```
