from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=10)


class ContactMessageRead(ContactMessageCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_read: bool
    created_at: datetime


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime
