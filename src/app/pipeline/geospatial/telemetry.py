import json
import os
from pathlib import Path
from typing import Dict, List, Any
import httpx

OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude=23.79&longitude=86.43&hourly=precipitation&forecast_days=2"
)


async def fetch_upstream_rain() -> float:
    """
    Queries the Open-Meteo forecast API for the DVC Damodar upstream catchment (23.79, 86.43).
    Sums the first 24 values of data['hourly']['precipitation'] to get cumulative 24h precipitation in mm.
    Returns float rounded to 1 decimal place.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(OPEN_METEO_URL)
        response.raise_for_status()
        data = response.json()

    hourly_precip = data.get("hourly", {}).get("precipitation", [])
    rain_24h_mm = float(sum(hourly_precip[:24])) if len(hourly_precip) >= 24 else 0.0
    return round(rain_24h_mm, 1)


def get_cwc_gauge_summary(data_path: str = None) -> Dict[str, Any]:
    """
    Reads data/raw/river_gauges.json and filters stations where current_water_level_m >= danger_level_m.
    Returns summary dict with total_monitored, critical_count, and critical_gauges.
    """
    if data_path is None:
        base_dir = Path(__file__).resolve().parents[4]
        data_path = base_dir / "data" / "raw" / "river_gauges.json"
        if not data_path.exists():
            data_path = base_dir / "src" / "frontend" / "public" / "river_gauges.json"

    if not os.path.exists(data_path):
        return {
            "total_monitored": 0,
            "critical_count": 0,
            "critical_gauges": []
        }

    with open(data_path, "r", encoding="utf-8") as f:
        gauges = json.load(f)

    critical_gauges = []
    for gauge in gauges:
        current_m = gauge.get("current_water_level_m", 0.0)
        danger_m = gauge.get("danger_level_m", 0.0)
        is_critical = current_m >= danger_m
        
        gauge_info = {
            **gauge,
            "status": "CRITICAL" if is_critical else "NORMAL",
            "surge_meters": round(max(0.0, current_m - danger_m), 2)
        }
        if is_critical:
            critical_gauges.append(gauge_info)

    return {
        "total_monitored": len(gauges),
        "critical_count": len(critical_gauges),
        "critical_gauges": critical_gauges
    }


# Backward-compatibility helpers
async def get_upstream_catchment_weather() -> Dict[str, Any]:
    rain_24h = await fetch_upstream_rain()
    return {
        "rain_24h_mm": rain_24h,
        "rain_48h_mm": round(rain_24h * 1.5, 1),
        "latitude": 23.79,
        "longitude": 86.43,
    }


def get_cwc_gauge_status(data_path: str = None) -> List[Dict[str, Any]]:
    summary = get_cwc_gauge_summary(data_path)
    if summary["total_monitored"] == 0:
        return []
    if data_path is None:
        base_dir = Path(__file__).resolve().parents[4]
        data_path = base_dir / "data" / "raw" / "river_gauges.json"
        if not data_path.exists():
            data_path = base_dir / "src" / "frontend" / "public" / "river_gauges.json"
    with open(data_path, "r", encoding="utf-8") as f:
        gauges = json.load(f)
    processed = []
    for gauge in gauges:
        current_m = gauge.get("current_water_level_m", 0.0)
        danger_m = gauge.get("danger_level_m", 0.0)
        processed.append({
            **gauge,
            "status": "CRITICAL" if current_m >= danger_m else "NORMAL",
            "surge_meters": round(max(0.0, current_m - danger_m), 2)
        })
    return processed

