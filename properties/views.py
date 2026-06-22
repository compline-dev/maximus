from __future__ import annotations

from django.http import JsonResponse, HttpRequest

from .filters import (
    PropertyFilter,
    filter_properties,
    get_available_filters,
    get_property_detail,
    get_sections,
)
from .parser import fetch_and_parse


def _parse_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [v.strip() for v in value.split(',') if v.strip()]


def _parse_float(value: str | None) -> float | None:
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _parse_int(value: str | None) -> int | None:
    if not value:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def properties_list(request: HttpRequest) -> JsonResponse:
    """
    GET /api/properties/?price_min=5000000&price_max=20000000&rooms=1,2&section=1&...
    """
    q = request.GET
    f = PropertyFilter(
        price_min=_parse_float(q.get('price_min')),
        price_max=_parse_float(q.get('price_max')),
        area_min=_parse_float(q.get('area_min')),
        area_max=_parse_float(q.get('area_max')),
        floor_min=_parse_int(q.get('floor_min')),
        floor_max=_parse_int(q.get('floor_max')),
        price_per_meter_min=_parse_float(q.get('price_per_meter_min')),
        price_per_meter_max=_parse_float(q.get('price_per_meter_max')),
        living_area_min=_parse_float(q.get('living_area_min')),
        living_area_max=_parse_float(q.get('living_area_max')),
        rooms=_parse_list(q.get('rooms')),
        status=_parse_list(q.get('status')),
        building_id=_parse_list(q.get('building_id')),
        section=_parse_list(q.get('section')),
        property_type=_parse_list(q.get('property_type')),
        features=_parse_list(q.get('features')),
        euro_layout=q.get('euro_layout'),
        studio=q.get('studio'),
        sort_by=q.get('sort_by', 'price'),
        sort_dir=q.get('sort_dir', 'asc'),
        offset=_parse_int(q.get('offset')) or 0,
        limit=min(_parse_int(q.get('limit')) or 50, 200),
    )
    data = filter_properties(f)
    return JsonResponse(data, safe=False, json_dumps_params={'ensure_ascii': False})


def property_detail(request: HttpRequest, property_id: str) -> JsonResponse:
    """GET /api/properties/<id>/"""
    data = get_property_detail(property_id)
    if data is None:
        return JsonResponse({'error': 'Not found'}, status=404)
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})


def filters_view(request: HttpRequest) -> JsonResponse:
    """GET /api/filters/ — available filter options for frontend."""
    data = get_available_filters()
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})


def sections_view(request: HttpRequest) -> JsonResponse:
    """GET /api/sections/ — all sections/houses."""
    data = get_sections()
    return JsonResponse(data, safe=False, json_dumps_params={'ensure_ascii': False})


def parse_now(request: HttpRequest) -> JsonResponse:
    """POST /api/parse/ — trigger immediate feed parse (for admin/debug)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)
    updated = fetch_and_parse()
    return JsonResponse({'updated': updated})
