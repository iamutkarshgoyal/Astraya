from fastapi import APIRouter

from app.routers import admin, auth, cart, catalog, engagement, health, orders, reviews, wishlist

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(catalog.router)
api_router.include_router(cart.router)
api_router.include_router(wishlist.router)
api_router.include_router(orders.router)
api_router.include_router(reviews.router)
api_router.include_router(engagement.router)
api_router.include_router(admin.router)
