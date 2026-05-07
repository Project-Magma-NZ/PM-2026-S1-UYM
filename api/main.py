from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import settings
from api.routes.demographics import router as demographics_router
from api.routes.health import router as health_router

app = FastAPI(
    title="GA4 Demographics API",
    description="Serve GA4 demographics CSV data for frontend consumption.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(demographics_router, prefix=settings.api_prefix)
