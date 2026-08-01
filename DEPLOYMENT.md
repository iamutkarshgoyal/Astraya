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
OWNER_WHATSAPP_PHONE=918958383707
VITE_API_BASE_URL=/api
BACKEND_CORS_ORIGINS=https://astrayacandles.com,https://www.astrayacandles.com
CDN_BASE_URL=https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products
OWNER_NOTIFICATION_EMAIL=orders@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=replace-with-smtp-user
SMTP_PASSWORD=replace-with-smtp-password
SMTP_FROM_EMAIL=orders@astrayacandles.com
WHATSAPP_ACCESS_TOKEN=replace-with-meta-system-user-token
WHATSAPP_PHONE_NUMBER_ID=replace-with-meta-phone-number-id
WHATSAPP_ORDER_TEMPLATE_NAME=astraya_new_order
WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

Build and run:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production frontend is served by Nginx on `${FRONTEND_PORT:-8080}` and the
backend is served on `${BACKEND_PORT:-8000}`. PostgreSQL data is stored in the
`postgres_data` volume.

## Custom Domain

The canonical production URL is `https://astrayacandles.com`. The frontend
metadata, sitemap, robots file, structured data, and backend CORS defaults use
this apex domain. `https://www.astrayacandles.com` redirects to the apex domain.

The domain and TLS were verified on July 31, 2026. The apex returns the Netlify
site, `www` redirects to the apex, and `/api/health` reaches the Render service
with its database connected. Keep this configuration when changing DNS:

1. Add `astrayacandles.com` and `www.astrayacandles.com` in Netlify under
   **Domain management**.
2. Set `astrayacandles.com` as the primary domain.
3. At the registrar, apply the exact apex and `www` DNS records shown by
   Netlify, or delegate the domain to Netlify DNS.
4. Wait for Netlify to issue the TLS certificate and verify both HTTPS URLs.
5. Set the Render `BACKEND_CORS_ORIGINS` value to
   `https://astrayacandles.com,https://www.astrayacandles.com` and redeploy.
6. Keep Netlify `VITE_API_BASE_URL=/api` so API requests use the existing
   proxy and do not expose a second public origin in frontend code.

After DNS propagates, verify:

```bash
curl -I https://astrayacandles.com
curl -I https://www.astrayacandles.com
curl https://astrayacandles.com/robots.txt
curl https://astrayacandles.com/sitemap.xml
```

## Order Notifications

Every order stores the customer name, email, mobile number, street address,
city, state, pincode, timestamp, line prices, and customization preview. Owner
notifications are queued after checkout so a mail or Meta API outage does not
reject a valid order.

Set `OWNER_NOTIFICATION_EMAIL` and the SMTP variables in Render to receive the
full order email and custom preview attachments. Set
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and
`OWNER_WHATSAPP_PHONE` to send the same summary and previews through WhatsApp
Cloud API.

Meta may reject free-form business-initiated WhatsApp messages outside its
allowed conversation window. Create an approved utility template with one body
text variable, then set `WHATSAPP_ORDER_TEMPLATE_NAME`; the API sends the full
summary through that variable before sending custom preview media. The admin
Orders view records `sent`, `failed`, or `not_configured` for each channel.

## Database

Astraya uses PostgreSQL as the source of truth for users, catalog, cart,
wishlist, orders, reviews, contact messages, and newsletter subscribers. The
backend composes the SQLAlchemy URL with `quote_plus` so passwords such as
`Hello@123` are encoded safely.

## Product Images

Product images are served through jsDelivr from GitHub. Upload assets under
`images/products/<product-slug>/`, push them to the configured branch, and use
`docs/CDN_IMAGES.md` for URL format and cache refresh details.

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
