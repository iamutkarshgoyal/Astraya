from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRead


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=30)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(min_length=20)


class GoogleLoginRequest(BaseModel):
    id_token: str = Field(min_length=20)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str = Field(min_length=20)
    new_password: str = Field(min_length=8, max_length=128)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(TokenPair):
    user: UserRead


class MessageResponse(BaseModel):
    message: str


class PasswordResetStartResponse(MessageResponse):
    reset_token: str | None = None
