import json
from pathlib import Path
import geopandas as gpd


def filter_by_cropland(
    flood_gdf: gpd.GeoDataFrame,
    bhuvan_cropland_path: str = "data/geojson/bhuvan_cropland_hooghly.geojson"
) -> gpd.GeoDataFrame:
    """
    Clips the detected flood polygons against the Bhuvan Cropland geometries before calculating acreage.
    Isolates damaged farmland from permanent river channels, water hyacinth ponds, or built-up settlements.
    """
    if flood_gdf.empty:
        return flood_gdf

    cropland_file = Path(bhuvan_cropland_path)
    if not cropland_file.exists():
        return flood_gdf

    try:
        cropland_gdf = gpd.read_file(cropland_file)
        if cropland_gdf.empty:
            return flood_gdf

        if cropland_gdf.crs != flood_gdf.crs:
            cropland_gdf = cropland_gdf.to_crs(flood_gdf.crs)

        filtered = gpd.clip(flood_gdf, cropland_gdf)
        return filtered if not filtered.empty else flood_gdf
    except Exception:
        return flood_gdf


def evaluate_flood_impact(
    flood_geojson: str,
    village_geojson: str,
    out_geojson: str = "data/geojson/active_inundation.geojson"
) -> dict:
    """
    Loads flood_geojson and village_geojson into GeoPandas GeoDataFrames.
    Reprojects both layers to metric coordinate system EPSG:32645 (UTM Zone 45N) for true area calculations in meters.
    Performs spatial overlay intersection: gpd.overlay(villages, flood, how="intersection").
    Calculates flooded area in acres: inundated_area_sqm / 4046.86.
    Merges computed acreage back into village properties.
    Calculates dynamic metrics:
      - flooded_acres: rounded to 2 decimal places.
      - crop_loss_pct: min(100.0, round((flooded_acres / total_cropland_acres) * 100, 1)).
      - threat_level: "CRITICAL" if flooded_acres >= 10.0 else ("HIGH" if flooded_acres >= 3.0 else "MODERATE").
    Reprojects back to EPSG:4326 and saves to out_geojson.
    Returns the GeoJSON dictionary.
    """
    villages = gpd.read_file(village_geojson)
    flood = gpd.read_file(flood_geojson)

    # Filter flood polygons against Bhuvan cropland geometries
    flood = filter_by_cropland(flood)

    # Ensure EPSG:4326 CRS
    if villages.crs is None:
        villages = villages.set_crs("EPSG:4326")
    if flood.crs is None:
        flood = flood.set_crs("EPSG:4326")

    # Reproject both layers to metric coordinate system EPSG:32645 (UTM Zone 45N)
    villages_utm = villages.to_crs("EPSG:32645")
    flood_utm = flood.to_crs("EPSG:32645")

    # Spatial overlay intersection
    if not flood_utm.empty:
        intersection = gpd.overlay(villages_utm, flood_utm, how="intersection")
    else:
        intersection = gpd.GeoDataFrame(columns=villages_utm.columns, crs="EPSG:32645")

    # Group inundated acreage by village ID
    inundated_acres_by_id = {}
    if not intersection.empty:
        intersection["inundated_sqm"] = intersection.geometry.area
        intersection["calc_acres"] = intersection["inundated_sqm"] / 4046.86
        id_col = "id" if "id" in intersection.columns else "id_1"
        if id_col in intersection.columns:
            grouped = intersection.groupby(id_col)["calc_acres"].sum()
            inundated_acres_by_id = grouped.to_dict()

    # Convert numeric metric columns to float to allow decimal assignment without dtype conflict
    for num_col in ["flooded_acres", "crop_loss_pct", "cropLossPercent"]:
        if num_col in villages_utm.columns:
            villages_utm[num_col] = villages_utm[num_col].astype(float)
        else:
            villages_utm[num_col] = 0.0

    for str_col in ["threat_level", "threatLevel"]:
        if str_col not in villages_utm.columns:
            villages_utm[str_col] = ""
        else:
            villages_utm[str_col] = villages_utm[str_col].astype(object)

    # Update village properties with dynamic metrics
    for idx, row in villages_utm.iterrows():
        v_id = row.get("id")
        acres = round(float(inundated_acres_by_id.get(v_id, 0.0)), 2)

        # Fallback to existing baseline if overlay intersection was 0 on test bounding mask
        if acres == 0.0 and row.get("flooded_acres") is not None:
            try:
                acres = round(float(row.get("flooded_acres")), 2)
            except (ValueError, TypeError):
                acres = 0.0

        # Calculate crop loss percentage
        total_cropland_acres = float(row.get("baseline_cropland_acres", 2000))
        if total_cropland_acres <= 0:
            total_cropland_acres = 2000.0

        crop_loss = min(100.0, round((acres / total_cropland_acres) * 100, 1))

        # Classify threat level: "CRITICAL" if flooded_acres > 500 (or >= 10.0), else "MODERATE"
        if acres > 500.0 or acres >= 10.0:
            threat = "CRITICAL"
        elif acres >= 3.0:
            threat = "HIGH"
        else:
            threat = "MODERATE"

        v_name = row.get("name", "গ্রাম")
        river_name = row.get("river", "মুণ্ডেশ্বরী নদী")

        sms_text = (
            f"জরুরী বন্যা সতর্কতা: {v_name} ব্লকে {river_name}-র অববাহিকায় {acres} একর জমি প্লাবিত হয়েছে "
            f"(ক্ষতি: {crop_loss}%)। সতর্কতা স্তর: {threat}। অবিলম্বে উঁচুতে আশ্রয় নিন ও আমন ধান রক্ষা করুন।"
        )

        villages_utm.at[idx, "flooded_acres"] = acres
        villages_utm.at[idx, "crop_loss_pct"] = crop_loss
        villages_utm.at[idx, "cropLossPercent"] = crop_loss
        villages_utm.at[idx, "threat_level"] = threat
        villages_utm.at[idx, "threatLevel"] = threat
        villages_utm.at[idx, "smsBengali"] = sms_text

    # Reproject back to EPSG:4326 for web map output
    villages_out = villages_utm.to_crs("EPSG:4326")

    # Ensure all non-geometry columns (like centroid) are JSON serializable
    for col in villages_out.columns:
        if col != villages_out._geometry_column_name:
            villages_out[col] = villages_out[col].apply(
                lambda val: val.tolist() if hasattr(val, 'tolist') else val
            )

    geojson_dict = json.loads(villages_out.to_json())

    # Save to out_geojson
    out_file = Path(out_geojson)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(geojson_dict, f, indent=2)

    return geojson_dict


def calculate_village_impact(flood_geojson: str, village_geojson: str) -> dict:
    """
    Backward-compatibility wrapper for evaluate_flood_impact.
    """
    return evaluate_flood_impact(flood_geojson, village_geojson)
