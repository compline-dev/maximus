"""
Redis-based filtering engine for properties.

Uses ZRANGEBYSCORE for numeric ranges, SINTER/SUNIONSTORE for exact matches,
then intersects all result sets to produce the final list of matching IDs.
"""
from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from typing import Any

from .redis_client import get_redis


@dataclass
class PropertyFilter:
    price_min: float | None = None
    price_max: float | None = None
    area_min: float | None = None
    area_max: float | None = None
    floor_min: int | None = None
    floor_max: int | None = None
    price_per_meter_min: float | None = None
    price_per_meter_max: float | None = None
    living_area_min: float | None = None
    living_area_max: float | None = None
    rooms: list[str] = field(default_factory=list)
    status: list[str] = field(default_factory=list)
    building_id: list[str] = field(default_factory=list)
    section: list[str] = field(default_factory=list)
    property_type: list[str] = field(default_factory=list)
    features: list[str] = field(default_factory=list)
    euro_layout: str | None = None
    studio: str | None = None
    sort_by: str = 'price'
    sort_dir: str = 'asc'
    offset: int = 0
    limit: int = 50


def _zrange_ids(r, key: str, min_val: float | None, max_val: float | None) -> set[str] | None:
    """Get IDs from sorted set within score range. Returns None if no filter applied."""
    if min_val is None and max_val is None:
        return None
    lo = min_val if min_val is not None else '-inf'
    hi = max_val if max_val is not None else '+inf'
    return set(r.zrangebyscore(key, lo, hi))


def _union_sets(r, prefix: str, values: list[str]) -> set[str] | None:
    """Union of multiple sets (e.g. rooms=1,2 → rooms:1 ∪ rooms:2). None if empty."""
    if not values:
        return None
    if len(values) == 1:
        return r.smembers(f'{prefix}{values[0]}')
    tmp_key = f'_tmp:{uuid.uuid4().hex}'
    keys = [f'{prefix}{v}' for v in values]
    r.sunionstore(tmp_key, *keys)
    result = r.smembers(tmp_key)
    r.delete(tmp_key)
    return result


def filter_properties(f: PropertyFilter) -> dict[str, Any]:
    r = get_redis()

    candidates: list[set[str]] = []

    # Numeric range filters via sorted sets
    for key, lo, hi in [
        ('idx:properties:price', f.price_min, f.price_max),
        ('idx:properties:area', f.area_min, f.area_max),
        ('idx:properties:floor', f.floor_min, f.floor_max),
        ('idx:properties:price_per_meter', f.price_per_meter_min, f.price_per_meter_max),
        ('idx:properties:living_area', f.living_area_min, f.living_area_max),
    ]:
        ids = _zrange_ids(r, key, lo, hi)
        if ids is not None:
            candidates.append(ids)

    # Exact match filters via sets (with union for multi-value)
    for prefix, values in [
        ('idx:properties:rooms:', f.rooms),
        ('idx:properties:status:', f.status),
        ('idx:properties:building:', f.building_id),
        ('idx:properties:section:', f.section),
        ('idx:properties:property_type:', f.property_type),
    ]:
        ids = _union_sets(r, prefix, values)
        if ids is not None:
            candidates.append(ids)

    # Feature filters — each feature must be present (intersection)
    for feat in f.features:
        feat_ids = r.smembers(f'idx:properties:feature:{feat}')
        candidates.append(feat_ids)

    # Single-value exact filters
    if f.euro_layout is not None:
        candidates.append(r.smembers(f'idx:properties:euro:{f.euro_layout}'))
    if f.studio is not None:
        candidates.append(r.smembers(f'idx:properties:studio:{f.studio}'))

    # Intersect all candidate sets
    if candidates:
        result_ids = candidates[0]
        for s in candidates[1:]:
            result_ids = result_ids & s
    else:
        result_ids = r.smembers('idx:properties:all')

    total = len(result_ids)

    # Sort
    sort_key_map = {
        'price': 'idx:properties:price',
        'area': 'idx:properties:area',
        'floor': 'idx:properties:floor',
        'price_per_meter': 'idx:properties:price_per_meter',
    }
    sorted_key = sort_key_map.get(f.sort_by, 'idx:properties:price')

    if result_ids:
        scored = []
        pipe = r.pipeline()
        for pid in result_ids:
            pipe.zscore(sorted_key, pid)
        scores = pipe.execute()
        for pid, score in zip(result_ids, scores):
            scored.append((pid, score or 0))
        reverse = f.sort_dir == 'desc'
        scored.sort(key=lambda x: x[1], reverse=reverse)
        page_ids = [pid for pid, _ in scored[f.offset:f.offset + f.limit]]
    else:
        page_ids = []

    # Fetch full property data
    properties = _fetch_properties(r, page_ids)

    return {
        'total': total,
        'offset': f.offset,
        'limit': f.limit,
        'results': properties,
    }


def _fetch_properties(r, ids: list[str]) -> list[dict[str, Any]]:
    if not ids:
        return []
    pipe = r.pipeline()
    for pid in ids:
        pipe.hgetall(f'property:{pid}')
    raw_list = pipe.execute()

    result = []
    for raw in raw_list:
        if not raw:
            continue
        # Parse JSON fields back
        for json_field in ('images', 'custom_fields'):
            if json_field in raw:
                try:
                    raw[json_field] = json.loads(raw[json_field])
                except (json.JSONDecodeError, TypeError):
                    pass
        # Cast numeric strings
        for num_field in ('price', 'area', 'price_per_meter', 'living_area'):
            if num_field in raw:
                try:
                    raw[num_field] = float(raw[num_field])
                except (ValueError, TypeError):
                    pass
        result.append(raw)
    return result


def get_property_detail(property_id: str) -> dict[str, Any] | None:
    r = get_redis()
    data = r.hgetall(f'property:{property_id}')
    if not data:
        return None
    for json_field in ('images', 'custom_fields'):
        if json_field in data:
            try:
                data[json_field] = json.loads(data[json_field])
            except (json.JSONDecodeError, TypeError):
                pass
    for num_field in ('price', 'area', 'price_per_meter', 'living_area'):
        if num_field in data:
            try:
                data[num_field] = float(data[num_field])
            except (ValueError, TypeError):
                pass
    return data


def get_available_filters() -> dict[str, Any]:
    """Return all available filter options for the frontend to build UI."""
    r = get_redis()
    pipe = r.pipeline()

    # Min/max for numeric ranges
    for key in ['idx:properties:price', 'idx:properties:area',
                'idx:properties:floor', 'idx:properties:price_per_meter',
                'idx:properties:living_area']:
        pipe.zrange(key, 0, 0, withscores=True)   # min
        pipe.zrange(key, -1, -1, withscores=True)  # max

    results = pipe.execute()

    def _minmax(pair_index: int) -> dict:
        lo = results[pair_index * 2]
        hi = results[pair_index * 2 + 1]
        return {
            'min': lo[0][1] if lo else None,
            'max': hi[0][1] if hi else None,
        }

    # Collect set-based options
    rooms_keys = r.keys('idx:properties:rooms:*')
    rooms = sorted({k.split(':')[-1] for k in rooms_keys}, key=lambda x: int(x) if x.isdigit() else 0)

    status_keys = r.keys('idx:properties:status:*')
    statuses = sorted({k.split(':')[-1] for k in status_keys})

    building_keys = r.keys('idx:properties:building:*')
    buildings = []
    for bk in building_keys:
        bid = bk.split(':')[-1]
        house_data = r.hgetall(f'house:{bid}')
        buildings.append({
            'id': bid,
            'name': house_data.get('name', bid),
        })

    section_keys = r.keys('idx:properties:section:*')
    sections = sorted({k.split(':')[-1] for k in section_keys})

    total = r.scard('idx:properties:all')

    return {
        'total_properties': total,
        'price': _minmax(0),
        'area': _minmax(1),
        'floor': _minmax(2),
        'price_per_meter': _minmax(3),
        'living_area': _minmax(4),
        'rooms': rooms,
        'statuses': statuses,
        'buildings': buildings,
        'sections': sections,
        'feed_updated_at': r.get('feed:updated_at'),
    }


def get_sections() -> list[dict[str, Any]]:
    """Return all house/section objects."""
    r = get_redis()
    keys = r.keys('house:*')
    pipe = r.pipeline()
    for k in keys:
        pipe.hgetall(k)
    return pipe.execute()
