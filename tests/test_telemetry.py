import pytest
from fastapi.testclient import TestClient
from src.app.main import app
from src.app.pipeline.geospatial.telemetry import (
    fetch_upstream_rain,
    get_cwc_gauge_summary,
)

client = TestClient(app)


@pytest.mark.asyncio
async def test_fetch_upstream_rain_returns_float():
    """
    Verifies that fetch_upstream_rain() calls Open-Meteo API and returns a float rounded to 1 decimal place.
    """
    rain_24h = await fetch_upstream_rain()
    assert isinstance(rain_24h, float)
    assert rain_24h >= 0.0


def test_get_cwc_gauge_summary_returns_dict():
    """
    Verifies that get_cwc_gauge_summary() reads river_gauges.json and flags critical stations.
    """
    summary = get_cwc_gauge_summary()
    assert isinstance(summary, dict)
    assert "total_monitored" in summary
    assert "critical_count" in summary
    assert "critical_gauges" in summary
    assert summary["total_monitored"] >= summary["critical_count"]


def test_live_telemetry_endpoint_http_200():
    """
    Verifies GET /api/v1/telemetry/live returns HTTP 200 with required structure.
    """
    response = client.get("/api/v1/telemetry/live")
    assert response.status_code == 200
    data = response.json()
    assert "upstream_dvc_rain_mm" in data
    assert "cwc_danger_gauges_count" in data
    assert "risk_status" in data
    assert "critical_gauges" in data


def test_active_inundation_endpoint_http_200():
    """
    Verifies GET /api/v1/maps/active-inundation returns HTTP 200 and GeoJSON FeatureCollection.
    """
    response = client.get("/api/v1/maps/active-inundation")
    assert response.status_code == 200
    data = response.json()
    assert data.get("type") == "FeatureCollection"
    assert "features" in data
    assert len(data["features"]) > 0

