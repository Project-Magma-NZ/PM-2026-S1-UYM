import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    api_prefix: str = os.getenv("API_PREFIX", "/api/v1")
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    output_dir: str = os.getenv("OUTPUT_DIR", "backend/Google Analytics/outputs")
    allowed_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    )
    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL_SECONDS", "120"))

    # Meta OAuth app credentials — set these in .env
    meta_app_id: str = os.getenv("META_APP_ID", "")
    meta_app_secret: str = os.getenv("META_APP_SECRET", "")
    meta_redirect_uri: str = os.getenv("META_REDIRECT_URI", "http://localhost:8000/api/v1/meta/oauth/callback")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Supabase — service role key for backend-to-database writes
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


settings = Settings()
