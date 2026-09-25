import pytest
import asyncio
from src.app.pipeline.geospatial.telemetry import (
    get_upstream_catchment_weather,
    get_cwc_gauge_status,
)


@pytest.mark.asyncio
async def test_open_meteo_telemetry_returns_200_and_parses_floats():
    """
    Verifies that Open-Meteo API call for DVC Catchment coordinates returns HTTP 200
    and correctly parses 24h & 48h cumulative rainfall as float values.
    """
    result = await get_upstream_catchment_weather()

    assert "rain_24h_mm" in result
    assert "rain_48h_mm" in result
    assert isinstance(result["rain_24h_mm"], float)
    assert isinstance(result["rain_48h_mm"], float)
    assert result["rain_24h_mm"] >= 0.0
    assert result["rain_48h_mm"] >= 0.0


def test_cwc_gauge_status_flags_critical_gauges():
    """
    Verifies that get_cwc_gauge_status reads river_gauges.json and correctly
    flags gauges where current_water_level_m >= danger_level_m as CRITICAL.
    """
    gauges = get_cwc_gauge_status()
    assert isinstance(gauges, list)
    assert len(gauges) > 0

    for gauge in gauges:
        assert "station_name" in gauge
        assert "current_water_level_m" in gauge
        assert "danger_level_m" in gauge
        assert "status" in gauge

        if gauge["current_water_level_m"] >= gauge["danger_level_m"]:
            assert gauge["status"] == "CRITICAL"
        else:
            assert gauge["status"] == "NORMAL"
