from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client

SUPABASE_URL = "https://qccgvinzjinshhirmgme.supabase.co"
SUPABASE_KEY = "sb_publishable_oOfSuLa8C-z0u6AfGjLF0w_3-u2cxRs"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter(tags=["Metrics"])


class MetricEntry(BaseModel):
    metric_name: str
    date: str
    value: str


@router.get("/metrics")
def get_metrics():
    try:
        response = supabase.table("metrics_entries").select("*").order("date", desc=True).execute()
        return {"total": len(response.data), "items": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/metrics")
def add_metric(entry: MetricEntry):
    try:
        response = supabase.table("metrics_entries").insert({
            "metric_name": entry.metric_name,
            "date": entry.date,
            "value": entry.value,
        }).execute()
        return {"success": True, "item": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/metrics/{id}")
def update_metric(id: int, entry: MetricEntry):
    try:
        response = supabase.table("metrics_entries").update({
            "metric_name": entry.metric_name,
            "date": entry.date,
            "value": entry.value,
        }).eq("id", id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Metric not found")
        return {"success": True, "item": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/metrics/{id}")
def delete_metric(id: int):
    try:
        response = supabase.table("metrics_entries").delete().eq("id", id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Metric not found")
        return {"success": True, "deleted_id": id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))