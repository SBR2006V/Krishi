import json
import os
from pathlib import Path
from typing import Dict, List, Any
import httpx

# DVC Catchment coordinates (Lat: 23.79, Lon: 86.43)
OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude=23.79&longitude=86.43&hourly=precipitation&forecast_days=2"
)


async def get_upstream_catchment_weather() -> Dict[str, Any]:
    """
    Asynchronously calls Open-Meteo API for DVC catchment coordinates (23.79, 86.43).
    Calculates cumulative rainfall for the next 24 hours and 48 hours in mm.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(OPEN_METEO_URL)
        response.raise_for_status()
        data = response.json()

    hourly_precip = data.get("hourly", {}).get("precipitation", [])
    
    # Calculate 24h & 48h cumulative rainfall
    rain_24h_mm = float(sum(hourly_precip[:24])) if len(hourly_precip) >= 24 else 0.0
    rain_48h_mm = float(sum(hourly_precip[:48])) if len(hourly_precip) >= 48 else rain_24h_mm

    return {
        "rain_24h_mm": round(rain_24h_mm, 2),
        "rain_48h_mm": round(rain_48h_mm, 2),
        "latitude": 23.79,
        "longitude": 86.43,
        "raw_response": data,
    }


def get_cwc_gauge_status(data_path: str = None) -> List[Dict[str, Any]]:
    """
    Reads CWC river gauge indicators from data/raw/river_gauges.json.
    Flags gauges where current_water_level_m >= danger_level_m with status == 'CRITICAL'.
    """
    if data_path is None:
        # Default relative path from project root
        base_dir = Path(__file__).resolve().parents[4]
        data_path = base_dir / "data" / "raw" / "river_gauges.json"
        if not data_path.exists():
            # Fallback for frontend public folder path
            data_path = base_dir / "src" / "frontend" / "public" / "river_gauges.json"

    if not os.path.exists(data_path):
        return []

    with open(data_path, "r", encoding="utf-8") as f:
        gauges = json.load(f)

    processed_gauges = []
    for gauge in gauges:
        current_m = gauge.get("current_water_level_m", 0.0)
        danger_m = gauge.get("danger_level_m", 0.0)
        is_critical = current_m >= danger_m
        
        processed_gauges.append({
            **gauge,
            "status": "CRITICAL" if is_critical else "NORMAL",
            "surge_meters": round(max(0.0, current_m - danger_m), 2)
        })

    return processed_gauges
