# OAuth flow removed — Meta credentials are now configured via environment variables.
# See META_PAGE_ACCESS_TOKEN, META_PAGE_ID, META_IG_ACCOUNT_ID in .env
# The /meta/oauth/status endpoint has moved to api/routes/meta.py
from fastapi import APIRouter

router = APIRouter(tags=["Meta OAuth"])
