from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from threading import Lock

import pandas as pd

from api.config import settings

REQUIRED_COLUMN_LIST = [
    "demographic_dimension",
    "year_month",
    "demographic_value",
    "activeUsers",
    "newUsers",
    "sessions",
    "engagedSessions",
    "eventCount",
    "userEngagementDuration",
    "date_range_start",
    "date_range_end",
]
REQUIRED_COLUMNS = set(REQUIRED_COLUMN_LIST)

SORTABLE_COLUMNS = {
    "year_month",
    "demographic_value",
    "activeUsers",
    "newUsers",
    "sessions",
    "engagedSessions",
    "eventCount",
    "userEngagementDuration",
}


class DataNotReadyError(RuntimeError):
    """Raised when outputs data is missing or invalid."""


@dataclass
class DataCache:
    frame: pd.DataFrame | None = None
    loaded_at: datetime | None = None


_cache = DataCache()
_cache_lock = Lock()


def _outputs_dir() -> Path:
    return Path(settings.output_dir)


def _list_csv_files() -> list[Path]:
    output_dir = _outputs_dir()
    if not output_dir.exists() or not output_dir.is_dir():
        raise DataNotReadyError(f"Output directory not found: {output_dir}")

    files = sorted(output_dir.glob("ga4_demographics_*.csv"))
    if not files:
        raise DataNotReadyError("No demographics CSV files found in outputs directory")
    return files


def _validate_columns(frame: pd.DataFrame, source_file: Path) -> None:
    missing = REQUIRED_COLUMNS.difference(frame.columns)
    if missing:
        missing_columns = ", ".join(sorted(missing))
        raise DataNotReadyError(
            f"CSV file {source_file.name} is missing required columns: {missing_columns}"
        )


def _load_from_disk() -> pd.DataFrame:
    frames: list[pd.DataFrame] = []

    for csv_file in _list_csv_files():
        frame = pd.read_csv(csv_file)
        _validate_columns(frame, csv_file)
        frames.append(frame[REQUIRED_COLUMN_LIST])

    merged = pd.concat(frames, ignore_index=True)

    for column in (
        "activeUsers",
        "newUsers",
        "sessions",
        "engagedSessions",
        "eventCount",
        "userEngagementDuration",
    ):
        merged[column] = (
            pd.to_numeric(merged[column], errors="coerce").fillna(0).astype(int)
        )

    merged["year_month"] = merged["year_month"].astype(str)
    merged["demographic_dimension"] = merged["demographic_dimension"].astype(str)
    merged["demographic_value"] = merged["demographic_value"].astype(str)
    merged["date_range_start"] = merged["date_range_start"].astype(str)
    merged["date_range_end"] = merged["date_range_end"].astype(str)

    return merged


def get_data(force_reload: bool = False) -> pd.DataFrame:
    with _cache_lock:
        now = datetime.now(UTC)

        cache_valid = (
            _cache.frame is not None
            and _cache.loaded_at is not None
            and (now - _cache.loaded_at).total_seconds() < settings.cache_ttl_seconds
        )

        if force_reload or not cache_valid:
            _cache.frame = _load_from_disk()
            _cache.loaded_at = now

        return _cache.frame.copy(deep=False)


def list_dimensions() -> list[str]:
    frame = get_data()
    return sorted(frame["demographic_dimension"].dropna().unique().tolist())


def list_year_months() -> list[str]:
    frame = get_data()
    return sorted(frame["year_month"].dropna().unique().tolist())


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
        lower_value = value.strip().lower()
        frame = frame[
            frame["demographic_value"].str.lower().str.contains(lower_value, na=False)
        ]

    ascending = sort_order.lower() == "asc"
    frame = frame.sort_values(by=sort_by, ascending=ascending)

    total = int(frame.shape[0])
    paged = frame.iloc[offset : offset + limit]

    return total, paged.to_dict(orient="records")
