from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.contact_message import ContactMessage
from app.models.newsletter import NewsletterSubscriber
from app.schemas.auth import MessageResponse
from app.schemas.engagement import (
    ContactMessageCreate,
    ContactMessageRead,
    NewsletterCreate,
    NewsletterRead,
)

router = APIRouter(tags=["engagement"])


@router.post("/contact", response_model=ContactMessageRead, status_code=status.HTTP_201_CREATED)
def create_contact_message(
    payload: ContactMessageCreate,
    db: Session = Depends(get_db),
) -> ContactMessage:
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.post("/newsletter", response_model=NewsletterRead, status_code=status.HTTP_201_CREATED)
def subscribe_newsletter(
    payload: NewsletterCreate,
    db: Session = Depends(get_db),
) -> NewsletterSubscriber:
    existing = db.scalar(
        select(NewsletterSubscriber).where(
            NewsletterSubscriber.email == payload.email.lower()
        )
    )
    if existing:
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing

    subscriber = NewsletterSubscriber(email=payload.email.lower())
    db.add(subscriber)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        subscriber = db.scalar(
            select(NewsletterSubscriber).where(
                NewsletterSubscriber.email == payload.email.lower()
            )
        )
        if subscriber:
            subscriber.is_active = True
            db.commit()
            db.refresh(subscriber)
            return subscriber
        raise
    db.refresh(subscriber)
    return subscriber


@router.delete("/newsletter/{email}", response_model=MessageResponse)
def unsubscribe_newsletter(email: str, db: Session = Depends(get_db)) -> MessageResponse:
    subscriber = db.scalar(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == email.lower())
    )
    if subscriber:
        subscriber.is_active = False
        db.commit()
    return MessageResponse(message="Newsletter preferences updated.")
