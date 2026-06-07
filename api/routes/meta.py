import os
from datetime import date, timedelta

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Meta"])

GRAPH_API_BASE = "https://graph.facebook.com/v21.0"


def _get_connection() -> dict:
    token = os.getenv("META_PAGE_ACCESS_TOKEN", "")
    page_id = os.getenv("META_PAGE_ID", "")
    ig_id = os.getenv("META_IG_ACCOUNT_ID", "")
    page_name = os.getenv("META_PAGE_NAME", "")
    print(f"[Meta] _get_connection: token_set={bool(token)}, page_id={page_id or 'MISSING'}, ig_id={ig_id or 'MISSING'}")
    if not token or not page_id:
        raise HTTPException(
            status_code=503,
            detail="META_PAGE_ACCESS_TOKEN and META_PAGE_ID must be set in the environment",
        )
    return {
        "page_id": page_id,
        "page_name": page_name,
        "page_access_token": token,
        "ig_account_id": ig_id,
    }


def _date_range(days: int = 28) -> tuple[str, str]:
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=days - 1)
    return start.isoformat(), end.isoformat()


async def _graph_get(path: str, params: dict) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GRAPH_API_BASE}/{path}", params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.json())
    return resp.json()


async def _optional_graph_get(path: str, params: dict) -> dict | None:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GRAPH_API_BASE}/{path}", params=params)
    if resp.status_code != 200:
        print(f"[Meta] Optional Graph request failed ({resp.status_code}): {resp.text[:300]}")
        return None
    return resp.json()


# --- Status (replaces OAuth status) ---

@router.get("/meta/oauth/status")
async def meta_status():
    token = os.getenv("META_PAGE_ACCESS_TOKEN", "")
    page_id = os.getenv("META_PAGE_ID", "")
    ig_id = os.getenv("META_IG_ACCOUNT_ID", "")
    page_name = os.getenv("META_PAGE_NAME", "")
    facebook_connected = bool(token and page_id)
    instagram_connected = bool(ig_id)
    return {
        "connected": facebook_connected or instagram_connected,
        "facebook_connected": facebook_connected,
        "instagram_connected": instagram_connected,
        "page_name": page_name or None,
        "page_id": page_id or None,
        "ig_account_id": ig_id or None,
    }


# --- Facebook endpoints ---

@router.get("/meta/facebook/page")
async def get_facebook_page():
    conn = _get_connection()
    return await _graph_get(
        conn["page_id"],
        {"fields": "id,name,fan_count,followers_count,website", "access_token": conn["page_access_token"]},
    )


@router.get("/meta/facebook/insights")
async def get_facebook_insights(days: int = 28):
    conn = _get_connection()
    since, until = _date_range(days)
    token = conn["page_access_token"]
    page_id = conn["page_id"]

    async with httpx.AsyncClient(timeout=15) as client:
        page_resp = await client.get(
            f"{GRAPH_API_BASE}/{page_id}",
            params={"fields": "fan_count,followers_count", "access_token": token},
        )
        page_data = page_resp.json() if page_resp.status_code == 200 else {}
        print(f"[Meta] FB page fields: {page_data}")

    followers_count = page_data.get("followers_count") or page_data.get("fan_count") or 0
    data = [
        {"name": "page_followers", "values": [{"value": followers_count, "end_time": until}]},
        {"name": "page_fans", "values": [{"value": followers_count, "end_time": until}]},
    ]

    for metric in ("page_reach", "page_post_engagements", "views", "page_views_total", "page_impressions"):
        result = await _optional_graph_get(
            f"{page_id}/insights",
            {
                "metric": metric,
                "period": "day",
                "since": since,
                "until": until,
                "access_token": token,
            },
        )
        if result:
            data.extend(result.get("data", []))

    return {"data": data}


@router.get("/meta/facebook/demographics")
async def get_facebook_demographics():
    conn = _get_connection()
    token = conn["page_access_token"]
    page_id = conn["page_id"]
    attempts = []

    metrics = (
        "page_fans_gender_age",
        "page_fans_by_gender_by_age",
        "page_content_activity_by_age_gender_unique",
        "page_impressions_by_age_gender_unique",
        "page_impressions_by_age_gender",
    )

    for metric in metrics:
        try:
            data = await _graph_get(
                f"{page_id}/insights",
                {"metric": metric, "period": "lifetime", "access_token": token},
            )
            print(f"[Meta] FB demographics OK with metric={metric}")
            if not data.get("data"):
                attempts.append({"metric": metric, "status": "empty"})
                continue
            return data
        except HTTPException as e:
            print(f"[Meta] FB demographics failed with metric={metric}: {e.detail}")
            attempts.append({"metric": metric, "status": "error", "detail": e.detail})
            continue
    return {"data": [], "diagnostics": {"attempts": attempts}}


# --- Instagram endpoints ---

@router.get("/meta/instagram/account")
async def get_instagram_account():
    conn = _get_connection()
    ig_id = conn.get("ig_account_id") or ""
    if not ig_id:
        raise HTTPException(status_code=503, detail="META_IG_ACCOUNT_ID not set in environment")
    return await _graph_get(
        ig_id,
        {
            "fields": "id,username,name,followers_count,follows_count,media_count,profile_picture_url",
            "access_token": conn["page_access_token"],
        },
    )


@router.get("/meta/instagram/insights")
async def get_instagram_insights(days: int = 28, since: str | None = None, until: str | None = None):
    conn = _get_connection()
    ig_id = conn.get("ig_account_id") or ""
    if not ig_id:
        raise HTTPException(status_code=503, detail="META_IG_ACCOUNT_ID not set in environment")
    if not (since and until):
        since, until = _date_range(days)
    data = []
    for metric in ("reach", "views", "impressions"):
        result = await _optional_graph_get(
            f"{ig_id}/insights",
            {
                "metric": metric,
                "period": "day",
                "since": since,
                "until": until,
                "access_token": conn["page_access_token"],
            },
        )
        if result:
            data.extend(result.get("data", []))
    return {"data": data}


@router.get("/meta/instagram/demographics")
async def get_instagram_demographics(breakdown: str = "age"):
    conn = _get_connection()
    ig_id = conn.get("ig_account_id") or ""
    if not ig_id:
        raise HTTPException(status_code=503, detail="META_IG_ACCOUNT_ID not set in environment")
    return await _graph_get(
        f"{ig_id}/insights",
        {
            "metric": "follower_demographics",
            "metric_type": "total_value",
            "period": "lifetime",
            "breakdown": breakdown,
            "access_token": conn["page_access_token"],
        },
    )
