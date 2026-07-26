from app.core.config import settings


def get_product_image_urls(product_slug: str, total_images: int) -> list[str]:
    image_count = max(1, total_images)
    extension = settings.cdn_image_extension.strip().lstrip(".") or "jpg"
    base_url = settings.product_images_cdn_base_url

    return [
        f"{base_url}/{product_slug}/{index}.{extension}"
        for index in range(1, image_count + 1)
    ]
