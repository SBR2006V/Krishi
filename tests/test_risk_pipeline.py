import os
import pytest
from fastapi.testclient import TestClient
from src.app.main import app
from src.app.pipeline.geospatial.gee_client import fetch_sar_pair
from src.app.pipeline.ml.change_detector import detect_flood_extent
from src.app.pipeline.geospatial.risk_evaluator import evaluate_flood_impact

client = TestClient(app)


def test_change_detection_and_risk_evaluation():
    """
    Verifies that detect_flood_extent and evaluate_flood_impact process SAR GeoTIFFs,
    output valid GeoJSON files, and compute flooded_acres > 0.
    """
    bbox = [87.81, 22.65, 87.98, 22.88]
    cache_dir = "data/cache"
    pre_path, post_path = fetch_sar_pair(bbox, ("2024-09-08", "2024-09-12"), ("2024-09-18", "2024-09-22"), cache_dir)

    flood_mask_path = detect_flood_extent(pre_path, post_path, out_geojson="data/geojson/flood_mask.geojson")
    assert os.path.exists(flood_mask_path)
    assert os.path.getsize(flood_mask_path) > 0

    village_geojson_path = "data/geojson/village_grids.geojson"
    if not os.path.exists(village_geojson_path):
        village_geojson_path = "src/frontend/public/village_grids.geojson"

    geojson_dict = evaluate_flood_impact(
        flood_mask_path,
        village_geojson_path,
        out_geojson="data/geojson/active_inundation.geojson"
    )
    assert geojson_dict.get("type") == "FeatureCollection"
    assert "features" in geojson_dict
    assert len(geojson_dict["features"]) > 0

    total_flooded_acres = 0.0
    for feature in geojson_dict["features"]:
        props = feature["properties"]
        assert "flooded_acres" in props
        assert "threat_level" in props or "threatLevel" in props
        assert isinstance(props["flooded_acres"], (int, float))
        total_flooded_acres += float(props["flooded_acres"])

    assert total_flooded_acres > 0.0, "Flooded acres calculation must be > 0"


def test_run_scan_endpoint_http_200():
    """
    Verifies POST /api/v1/pipeline/run-scan returns HTTP 200 and updated FeatureCollection.
    """
    response = client.post("/api/v1/pipeline/run-scan")
    assert response.status_code == 200
    data = response.json()
    assert data.get("type") == "FeatureCollection"
    assert "features" in data
    assert len(data["features"]) > 0

