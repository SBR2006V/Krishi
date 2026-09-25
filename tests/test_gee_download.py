import os
import pytest
import rasterio
from src.app.pipeline.geospatial.gee_client import fetch_sar_pair


def test_gee_sar_download():
    """
    Tests fetch_sar_pair for Hooghly / Khanakul basin coordinates [87.81, 22.65, 87.98, 22.88].
    Verifies that pre_sar.tif and post_sar.tif exist in data/cache/, are > 0 bytes, and can be read by rasterio.open().
    """
    bbox = [87.81, 22.65, 87.98, 22.88]
    pre_dates = ("2024-09-08", "2024-09-12")
    post_dates = ("2024-09-18", "2024-09-22")
    out_dir = "data/cache"

    pre_path, post_path = fetch_sar_pair(bbox, pre_dates, post_dates, out_dir)

    assert os.path.exists(pre_path), f"Pre-flood SAR GeoTIFF not found at {pre_path}"
    assert os.path.exists(post_path), f"Post-flood SAR GeoTIFF not found at {post_path}"

    assert os.path.getsize(pre_path) > 0, f"Pre-flood SAR GeoTIFF is 0 bytes: {pre_path}"
    assert os.path.getsize(post_path) > 0, f"Post-flood SAR GeoTIFF is 0 bytes: {post_path}"

    with rasterio.open(pre_path) as src_pre:
        assert src_pre.count >= 1
        assert src_pre.width > 0
        assert src_pre.height > 0
        pre_data = src_pre.read(1)
        assert pre_data.size > 0

    with rasterio.open(post_path) as src_post:
        assert src_post.count >= 1
        assert src_post.width > 0
        assert src_post.height > 0
        post_data = src_post.read(1)
        assert post_data.size > 0
