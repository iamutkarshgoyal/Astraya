from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserRead


class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    title: str | None = Field(default=None, max_length=150)
    comment: str = Field(min_length=6)


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    user_id: int | None
    rating: int
    title: str | None = None
    comment: str
    is_approved: bool
    user: UserRead | None = None
    created_at: datetime
