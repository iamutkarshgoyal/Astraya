from typing import Literal

from pydantic import BaseModel, Field, field_validator


class CandleCustomization(BaseModel):
    wax_color: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")
    wax_color_name: str = Field(min_length=2, max_length=40)
    decoration: Literal["none", "hearts", "daisy", "rose", "petals"]
    decoration_label: str = Field(min_length=2, max_length=60)
    decoration_color: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")
    glitter: bool = False


class CustomizableItem(BaseModel):
    customization: CandleCustomization | None = None
    preview_image: str | None = Field(default=None, max_length=1_200_000)

    @field_validator("preview_image")
    @classmethod
    def validate_preview_image(cls, value: str | None) -> str | None:
        if value is None:
            return None
        allowed_prefixes = (
            "data:image/jpeg;base64,",
            "data:image/png;base64,",
            "data:image/webp;base64,",
            "https://",
            "/",
        )
        if not value.startswith(allowed_prefixes):
            raise ValueError("Preview must be a website image or supported image data URL")
        return value
