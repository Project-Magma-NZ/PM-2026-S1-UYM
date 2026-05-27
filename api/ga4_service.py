from __future__ import annotations

import os
from datetime import datetime, UTC
from threading import Lock
from dataclasses import dataclass

import pandas as pd
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, FilterExpression, Filter
)

PROPERTY_ID = os.getenv("GA4_PROPERTY_ID")
CREDENTIALS_PATH = os.getenv("GA4_CREDENTIALS_PATH", "credentials.json")
CREDENTIALS_JSON = os.getenv("GA4_CREDENTIALS_JSON")

DEMOGRAPHIC_DIMENSIONS = [
    "city", "country", "region", "language", "userAgeBracket", "userGender"
]

METRICS = [
    "activeUsers", "newUsers", "sessions", "engagedSessions",
    "eventCount", "userEngagementDuration"
]

SORTABLE_COLUMNS = {
    "year_month", "demographic_value", "activeUsers", "newUsers",
    "sessions", "engagedSessions", "eventCount", "userEngagementDuration"
}


class DataNotReadyError(RuntimeError):
    pass


@dataclass
class DataCache:
    frame: pd.DataFrame | None = None
    loaded_at: datetime | None = None


_cache = DataCache()
_cache_lock = Lock()
_client = None


def _get_client() -> BetaAnalyticsDataClient:
    global _client
    if _client is None:
        if CREDENTIALS_JSON:
            import json
            from google.oauth2.service_account import Credentials
            info = json.loads(CREDENTIALS_JSON)
            creds = Credentials.from_service_account_info(info)
        else:
            creds = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH)
        _client = BetaAnalyticsDataClient(credentials=creds)
    return _client


def _fetch_dimension(dimension: str, start_date: str, end_date: str) -> pd.DataFrame:
    client = _get_client()

    dimension_filter = None
    if dimension == "region":
        dimension_filter = FilterExpression(
            filter=Filter(
                field_name="country",
                string_filter=Filter.StringFilter(value="New Zealand")
            )
        )

    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[
            Dimension(name="year"),
            Dimension(name="month"),
            Dimension(name=dimension),
        ],
        metrics=[Metric(name=m) for m in METRICS],
        dimension_filter=dimension_filter,
        keep_empty_rows=False,
        limit=250000
    )
    response = client.run_report(request)

    rows = []
    for row in response.rows:
        year = row.dimension_values[0].value
        month = row.dimension_values[1].value.zfill(2)
        value = row.dimension_values[2].value
        metrics = [v.value for v in row.metric_values]
        rows.append({
            "demographic_dimension": dimension,
            "year_month": f"{year}{month}",
            "demographic_value": value,
            "activeUsers": int(metrics[0]),
            "newUsers": int(metrics[1]),
            "sessions": int(metrics[2]),
            "engagedSessions": int(metrics[3]),
            "eventCount": int(metrics[4]),
            "userEngagementDuration": int(metrics[5]),
            "date_range_start": start_date,
            "date_range_end": end_date,
        })
    return pd.DataFrame(rows)


def _load_from_ga4() -> pd.DataFrame:
    if not PROPERTY_ID:
        raise DataNotReadyError("GA4_PROPERTY_ID is not set")

    frames = []
    for dimension in DEMOGRAPHIC_DIMENSIONS:
        df = _fetch_dimension(dimension, "2025-01-01", "today")
        frames.append(df)

    return pd.concat(frames, ignore_index=True)


def get_data(force_reload: bool = False) -> pd.DataFrame:
    with _cache_lock:
        now = datetime.now(UTC)
        cache_valid = (
            _cache.frame is not None
            and _cache.loaded_at is not None
            and (now - _cache.loaded_at).total_seconds() < 3600
        )
        if force_reload or not cache_valid:
            _cache.frame = _load_from_ga4()
            _cache.loaded_at = now
        return _cache.frame.copy(deep=False)


def list_dimensions() -> list[str]:
    return sorted(get_data()["demographic_dimension"].dropna().unique().tolist())


def list_year_months() -> list[str]:
    return sorted(get_data()["year_month"].dropna().unique().tolist())


def last_loaded_at_iso() -> str | None:
    if _cache.loaded_at is None:
        return None
    return _cache.loaded_at.isoformat()


def list_records(
    *,
    dimension: str | None,
    year_month: str | None,
    value: str | None,
    limit: int,
    offset: int,
    sort_by: str,
    sort_order: str,
) -> tuple[int, list[dict]]:
    frame = get_data()

    if dimension:
        frame = frame[frame["demographic_dimension"] == dimension]
    if year_month:
        frame = frame[frame["year_month"] == year_month]
    if value:
        frame = frame[frame["demographic_value"].str.lower().str.contains(value.strip().lower(), na=False)]

    ascending = sort_order.lower() == "asc"
    frame = frame.sort_values(by=sort_by, ascending=ascending)

    total = int(frame.shape[0])
    paged = frame.iloc[offset: offset + limit]
    return total, paged.to_dict(orient="records")