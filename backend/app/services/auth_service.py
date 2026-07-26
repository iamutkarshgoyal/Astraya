from datetime import UTC, datetime, timedelta
from secrets import token_urlsafe

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import AuthResponse, SignupRequest


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def create_user_from_signup(db: Session, payload: SignupRequest) -> User:
    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        phone=payload.phone,
        hashed_password=get_password_hash(payload.password),
        is_verified=False,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Email is already registered") from None
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def issue_auth_response(user: User) -> AuthResponse:
    subject = str(user.id)
    return AuthResponse(
        user=user,
        access_token=create_access_token(subject=subject, role=user.role),
        refresh_token=create_refresh_token(subject=subject),
    )


def create_password_reset_token(db: Session, user: User) -> str:
    token = token_urlsafe(32)
    user.password_reset_token_hash = hash_token(token)
    user.password_reset_expires_at = datetime.now(UTC) + timedelta(
        minutes=settings.password_reset_token_expire_minutes,
    )
    db.commit()
    return token


def reset_password(db: Session, user: User, reset_token: str, new_password: str) -> bool:
    if user.password_reset_token_hash is None or user.password_reset_expires_at is None:
        return False
    if user.password_reset_expires_at < datetime.now(UTC):
        return False
    if user.password_reset_token_hash != hash_token(reset_token):
        return False

    user.hashed_password = get_password_hash(new_password)
    user.password_reset_token_hash = None
    user.password_reset_expires_at = None
    db.commit()
    return True


def upsert_google_user(
    db: Session,
    email: str,
    full_name: str,
    google_sub: str,
) -> User:
    user = db.scalar(select(User).where(User.google_sub == google_sub))
    if user:
        user.email = email.lower()
        user.full_name = full_name
        user.is_verified = True
        db.commit()
        db.refresh(user)
        return user

    existing_email_user = get_user_by_email(db, email)
    if existing_email_user:
        existing_email_user.google_sub = google_sub
        existing_email_user.is_verified = True
        db.commit()
        db.refresh(existing_email_user)
        return existing_email_user

    user = User(
        email=email.lower(),
        full_name=full_name,
        google_sub=google_sub,
        hashed_password=None,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
