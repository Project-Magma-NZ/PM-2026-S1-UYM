from fastapi import APIRouter, HTTPException, Query

from api.models import DemographicListResponse, MetadataListResponse
from api.service import (
    SORTABLE_COLUMNS,
    DataNotReadyError,
    list_dimensions,
    list_records,
    list_year_months,
)

router = APIRouter(tags=["Demographics"])


@router.get("/demographics", response_model=DemographicListResponse)
def get_demographics(
    dimension: str | None = Query(default=None),
    year_month: str | None = Query(default=None),
    value: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    sort_by: str = Query(default="activeUsers"),
    sort_order: str = Query(default="desc"),
):
    try:
        dimensions = list_dimensions()

        if dimension and dimension not in dimensions:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown dimension '{dimension}'. Available: {', '.join(dimensions)}",
            )

        if sort_by not in SORTABLE_COLUMNS:
            allowed = ", ".join(sorted(SORTABLE_COLUMNS))
            raise HTTPException(
                status_code=400,
                detail=f"Invalid sort_by '{sort_by}'. Allowed fields: {allowed}",
            )

        if sort_order.lower() not in {"asc", "desc"}:
            raise HTTPException(
                status_code=400, detail="sort_order must be 'asc' or 'desc'"
            )

        total, items = list_records(
            dimension=dimension,
            year_month=year_month,
            value=value,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return DemographicListResponse(
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            items=items,
        )
    except DataNotReadyError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/demographics/{dimension}", response_model=DemographicListResponse)
def get_demographics_by_dimension(
    dimension: str,
    year_month: str | None = Query(default=None),
    value: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    sort_by: str = Query(default="activeUsers"),
    sort_order: str = Query(default="desc"),
):
    return get_demographics(
        dimension=dimension,
        year_month=year_month,
        value=value,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/metadata/dimensions", response_model=MetadataListResponse)
def get_dimensions():
    try:
        return MetadataListResponse(items=list_dimensions())
    except DataNotReadyError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/metadata/months", response_model=MetadataListResponse)
def get_months():
    try:
        return MetadataListResponse(items=list_year_months())
    except DataNotReadyError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
