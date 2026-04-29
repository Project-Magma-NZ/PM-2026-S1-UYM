import os
from dataclasses import dataclass


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


settings = Settings()
