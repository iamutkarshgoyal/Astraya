from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "Astraya API"
    environment: str = "local"
    postgres_user: str = "postgres"
    postgres_password: str = "Hello@123"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "postgres"
    backend_cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    secret_key: str = "change-this-before-production"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 14
    google_client_id: str = ""
    password_reset_token_expire_minutes: int = 30
    expose_password_reset_token: bool = True
    owner_whatsapp_phone: str = "919876543210"
    default_shipping_charge: int = 99
    tax_rate_percent: int = 5
    admin_email: str = "admin@astraya.in"
    admin_password: str = "Admin@12345"
    cdn_base_url: str = ""
    cdn_github_username: str = "iamutkarshgoyal"
    cdn_github_repository: str = "Astraya"
    cdn_github_branch: str = "main"
    cdn_image_extension: str = "jpg"

    @property
    def sqlalchemy_database_uri(self) -> str:
        password = quote_plus(self.postgres_password)
        return (
            "postgresql+psycopg2://"
            f"{self.postgres_user}:{password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def product_images_cdn_base_url(self) -> str:
        if self.cdn_base_url.strip():
            return self.cdn_base_url.strip().rstrip("/")
        return (
            "https://cdn.jsdelivr.net/gh/"
            f"{self.cdn_github_username}/{self.cdn_github_repository}"
            f"@{self.cdn_github_branch}/images/products"
        )

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


settings = Settings()
