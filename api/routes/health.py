from fastapi import APIRouter

from api.models import HealthResponse
from api.service import DataNotReadyError, get_data, last_loaded_at_iso, list_dimensions

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health_check():
    try:
        get_data()
        dimensions = list_dimensions()
        return HealthResponse(
            status="ok",
            data_ready=True,
            available_dimensions=dimensions,
            last_loaded_at=last_loaded_at_iso(),
        )
    except DataNotReadyError:
        return HealthResponse(
            status="degraded",
            data_ready=False,
            available_dimensions=[],
            last_loaded_at=last_loaded_at_iso(),
        )
