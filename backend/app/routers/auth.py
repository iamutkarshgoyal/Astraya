from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import decode_token
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetStartResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenPair,
)
from app.schemas.user import UserRead
from app.services.auth_service import (
    authenticate_user,
    create_password_reset_token,
    create_user_from_signup,
    get_user_by_email,
    issue_auth_response,
    reset_password,
    upsert_google_user,
)
from app.core.security import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        user = create_user_from_signup(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return issue_auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = authenticate_user(db, payload.email, payload.password)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return issue_auth_response(user)


@router.post("/refresh", response_model=TokenPair)
def refresh_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> TokenPair:
    token_payload = decode_token(payload.refresh_token, expected_type="refresh")
    if token_payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    subject = token_payload.get("sub")
    if not subject or not str(subject).isdigit():
        raise HTTPException(status_code=401, detail="Invalid refresh token subject")

    user = db.get(User, int(subject))
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User account is unavailable")

    return TokenPair(
        access_token=create_access_token(subject=str(user.id), role=user.role),
        refresh_token=create_refresh_token(subject=str(user.id)),
    )


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/forgot-password", response_model=PasswordResetStartResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> PasswordResetStartResponse:
    user = get_user_by_email(db, payload.email)
    reset_token: str | None = None
    if user is not None and user.is_active:
        generated_token = create_password_reset_token(db, user)
        if settings.expose_password_reset_token and not settings.is_production:
            reset_token = generated_token

    return PasswordResetStartResponse(
        message=(
            "If an Astraya account exists for this email, password reset "
            "instructions have been prepared."
        ),
        reset_token=reset_token,
    )


@router.post("/reset-password", response_model=MessageResponse)
def complete_password_reset(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    user = get_user_by_email(db, payload.email)
    if user is None or not reset_password(db, user, payload.reset_token, payload.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    return MessageResponse(message="Password reset completed successfully.")


@router.post("/google", response_model=AuthResponse)
def google_login(
    payload: GoogleLoginRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google login is not configured",
        )

    try:
        token_info = id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google identity token",
        ) from exc

    email = token_info.get("email")
    google_sub = token_info.get("sub")
    full_name = token_info.get("name") or token_info.get("given_name") or "Astraya Customer"

    if not email or not google_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google identity token is missing required profile fields",
        )

    user = upsert_google_user(
        db=db,
        email=email,
        full_name=full_name,
        google_sub=google_sub,
    )
    return issue_auth_response(user)
