import os
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

try:
    from geoalchemy2 import Geometry
    HAS_GEOALCHEMY = True
except ImportError:
    HAS_GEOALCHEMY = False

    class Geometry:
        def __init__(self, geometry_type='GEOMETRY', srid=4326):
            pass

Base = declarative_base()


class IndianAdminBoundaries(Base):
    """
    PostGIS spatial table for Indian administrative boundaries (Block level).
    Table name: admin_boundaries
    """
    __tablename__ = "admin_boundaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    state = Column(String(100), default="West Bengal")
    district = Column(String(100), nullable=False)
    block_name = Column(String(100), nullable=False)

    if HAS_GEOALCHEMY:
        geom = Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326))
    else:
        geom = Column(String, nullable=True)


class RiverBasinVectors(Base):
    """
    PostGIS spatial table for river basin centerline vectors.
    Table name: river_vectors
    """
    __tablename__ = "river_vectors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    river_name = Column(String(100), nullable=False)
    basin = Column(String(100), default="Damodar Lower Basin")

    if HAS_GEOALCHEMY:
        geom = Column(Geometry(geometry_type="MULTILINESTRING", srid=4326))
    else:
        geom = Column(String, nullable=True)


class RescueDispatches(Base):
    """
    PostGIS spatial table for rescue dispatch records and route geometries.
    Table name: rescue_dispatches
    """
    __tablename__ = "rescue_dispatches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dispatch_id = Column(String(100), nullable=False)
    village_id = Column(String(100), nullable=False)
    verified_pct = Column(String(50), default="90.0%")
    route_geojson = Column(String, nullable=True)
    timestamp = Column(String(100), nullable=True)

