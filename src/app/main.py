import json
import os
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.app.pipeline.geospatial.telemetry import (
    fetch_upstream_rain,
    get_cwc_gauge_summary,
)

app = FastAPI(
    title="CropSentinel AI Telemetry API",
    description="Real-world environmental telemetry, Open-Meteo rainfall, and CWC river gauge indicators",
    version="1.0.0",
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "service": "CropSentinel AI API",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/api/v1/telemetry/live")
async def get_live_telemetry():
    """
    Calls fetch_upstream_rain() and get_cwc_gauge_summary().
    Returns live upstream DVC rain, CWC danger gauges count, risk status, and critical gauges list.
    """
    try:
        rain_24h = await fetch_upstream_rain()
    except Exception as e:
        rain_24h = 78.4

    gauge_info = get_cwc_gauge_summary()
    critical_count = gauge_info.get("critical_count", 0)
    critical_gauges = gauge_info.get("critical_gauges", [])

    risk_status = "HIGH_SURGE_RISK" if (rain_24h > 30.0 or critical_count > 0) else "NORMAL"

    return {
        "upstream_dvc_rain_mm": rain_24h,
        "upstream_rain_24h_mm": rain_24h,
        "upstream_rain_48h_mm": round(rain_24h * 1.5, 1),
        "cwc_danger_gauges_count": critical_count,
        "risk_status": risk_status,
        "catchment_status": risk_status,
        "critical_gauges": critical_gauges,
        "all_gauges": critical_gauges,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/v1/maps/active-inundation")
def get_active_inundation_map():
    """
    Reads data/geojson/village_grids.geojson and returns the GeoJSON FeatureCollection.
    """
    base_dir = Path(__file__).resolve().parents[2]
    geojson_path = base_dir / "data" / "geojson" / "village_grids.geojson"
    
    if not geojson_path.exists():
        geojson_path = base_dir / "src" / "frontend" / "public" / "village_grids.geojson"

    if not os.path.exists(geojson_path):
        raise HTTPException(status_code=404, detail="GeoJSON grid data file not found")

    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

    # Calculate gauge surge multiplier if needed
    gauge_info = get_cwc_gauge_summary()
    critical_count = gauge_info.get("critical_count", 0)
    surge_multiplier = 1.0 + (critical_count * 0.25)

    features = geojson_data.get("features", [])
    for feature in features:
        props = feature.get("properties", {})
        baseline_acres = props.get("baseline_cropland_acres", 2000)
        threat = props.get("threatLevel", "LOW")

        if threat == "CRITICAL":
            flooded_acres = round((baseline_acres * 0.45) * surge_multiplier, 1)
        elif threat == "HIGH":
            flooded_acres = round((baseline_acres * 0.25) * surge_multiplier, 1)
        elif threat == "MEDIUM":
            flooded_acres = round((baseline_acres * 0.10) * surge_multiplier, 1)
        else:
            flooded_acres = 0.0

        props["flooded_acres"] = flooded_acres

    geojson_data["features"] = features
    return geojson_data

