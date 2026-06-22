"""
XML parser for Profitbase feed → Redis.

Redis key schema:
  property:{id}                     — Hash with all fields + images as JSON
  idx:properties:all                — Set of all property IDs
  idx:properties:price              — Sorted Set (score=price)
  idx:properties:area               — Sorted Set (score=area)
  idx:properties:floor              — Sorted Set (score=floor)
  idx:properties:price_per_meter    — Sorted Set (score=price_per_meter)
  idx:properties:living_area        — Sorted Set (score=living_area)
  idx:properties:rooms:{n}          — Set
  idx:properties:status:{status}    — Set
  idx:properties:building:{id}      — Set
  idx:properties:section:{n}        — Set
  idx:properties:property_type:{t}  — Set
  idx:properties:euro:{0|1}         — Set
  idx:properties:studio:{0|1}       — Set
  idx:properties:floor_range        — Sorted Set for floor filtering
  house:{id}                        — Hash with house info
  object:{id}                       — Hash with complex info
  feed:xml:hash                     — last XML hash
"""
from __future__ import annotations

import hashlib
import json
import logging
import xml.etree.ElementTree as ET
from typing import Any

import requests
from django.conf import settings

from .redis_client import get_redis

logger = logging.getLogger(__name__)

NS = '{http://webmaster.yandex.ru/schemas/feed/realty/2010-06}'
FEED_HASH_KEY = 'feed:xml:hash'
FEED_UPDATED_AT_KEY = 'feed:updated_at'


def _text(el: ET.Element | None) -> str:
    """Safe text extraction."""
    if el is None:
        return ''
    return (el.text or '').strip()


def _float(el: ET.Element | None, default: float = 0.0) -> float:
    t = _text(el)
    if not t:
        return default
    try:
        return float(t)
    except ValueError:
        return default


def _parse_offer(offer: ET.Element) -> dict[str, Any]:
    """Parse single <offer> into a flat dict."""
    offer_id = offer.attrib.get('internal-id', '')

    obj_el = offer.find(f'{NS}object')
    house_el = offer.find(f'{NS}house')
    price_el = offer.find(f'{NS}price')
    area_el = offer.find(f'{NS}area')
    pm_el = offer.find(f'{NS}price-meter')
    ls_el = offer.find(f'{NS}living-space')
    loc_el = obj_el.find(f'{NS}location') if obj_el is not None else None

    images: dict[str, list[str]] = {'plan': [], 'plan_floor': [], 'house': [], 'other': []}
    for img in offer.findall(f'{NS}image'):
        img_type = img.attrib.get('type', 'other').replace(' ', '_')
        url = (img.text or '').strip()
        if url:
            bucket = images.get(img_type, images['other'])
            bucket.append(url)

    custom_fields: dict[str, str] = {}
    for cf in offer.findall(f'{NS}custom-field'):
        name = _text(cf.find(f'{NS}name'))
        val = _text(cf.find(f'{NS}value'))
        if name and val:
            custom_fields[name] = val

    return {
        'id': offer_id,
        'property_type': _text(offer.find(f'{NS}property_type')),
        'number': _text(offer.find(f'{NS}number')),
        'preset_code': _text(offer.find(f'{NS}preset-code')),
        'status': _text(offer.find(f'{NS}status')),
        'status_humanized': _text(offer.find(f'{NS}status-humanized')),
        'rooms': _text(offer.find(f'{NS}rooms')),
        'floor': _text(offer.find(f'{NS}floor')),
        'building_section': _text(offer.find(f'{NS}building-section')),
        'euro_layout': _text(offer.find(f'{NS}euro-layout')),
        'studio': _text(offer.find(f'{NS}studio')),
        'price': str(_float(price_el.find(f'{NS}value') if price_el is not None else None)),
        'currency': _text(price_el.find(f'{NS}currency') if price_el is not None else None),
        'area': str(_float(area_el.find(f'{NS}value') if area_el is not None else None)),
        'price_per_meter': str(_float(pm_el.find(f'{NS}value') if pm_el is not None else None)),
        'living_area': str(_float(ls_el.find(f'{NS}value') if ls_el is not None else None)),
        'floors_total': _text(house_el.find(f'{NS}floors-total') if house_el is not None else None),
        'building_id': _text(house_el.find(f'{NS}id') if house_el is not None else None),
        'building_name': _text(house_el.find(f'{NS}name') if house_el is not None else None),
        'built_year': _text(house_el.find(f'{NS}built-year') if house_el is not None else None),
        'ready_quarter': _text(house_el.find(f'{NS}ready-quarter') if house_el is not None else None),
        'building_state': _text(house_el.find(f'{NS}building-state') if house_el is not None else None),
        'complex_id': _text(obj_el.find(f'{NS}id') if obj_el is not None else None),
        'complex_name': _text(obj_el.find(f'{NS}name') if obj_el is not None else None),
        'address': _text(loc_el.find(f'{NS}address') if loc_el is not None else None),
        'city': _text(loc_el.find(f'{NS}locality-name') if loc_el is not None else None),
        'region': _text(loc_el.find(f'{NS}region') if loc_el is not None else None),
        'images': json.dumps(images, ensure_ascii=False),
        'custom_fields': json.dumps(custom_fields, ensure_ascii=False),
        'creation_date': _text(offer.find(f'{NS}creation-date')),
        'last_update_date': _text(offer.find(f'{NS}last-update-date')),
    }


def fetch_and_parse() -> bool:
    """
    Download feed, check hash, parse if changed.
    Returns True if data was updated.
    """
    r = get_redis()

    logger.info('Downloading Profitbase feed...')
    resp = requests.get(settings.PROFITBASE_FEED_URL, timeout=60)
    resp.raise_for_status()
    xml_bytes = resp.content

    xml_hash = hashlib.sha256(xml_bytes).hexdigest()
    old_hash = r.get(FEED_HASH_KEY)
    if xml_hash == old_hash:
        logger.info('Feed unchanged (hash match), skipping parse.')
        return False

    logger.info('Feed changed, parsing %d bytes...', len(xml_bytes))
    root = ET.fromstring(xml_bytes)

    pipe = r.pipeline()

    # ponytail: bulk-delete old indexes before rebuild; fine at 200 offers
    old_keys = r.keys('idx:properties:*')
    old_prop_keys = r.keys('property:*')
    old_house_keys = r.keys('house:*')
    old_obj_keys = r.keys('object:*')
    for k in old_keys + old_prop_keys + old_house_keys + old_obj_keys:
        pipe.delete(k)
    pipe.execute()

    pipe = r.pipeline()
    seen_houses: set[str] = set()
    seen_objects: set[str] = set()
    count = 0

    for offer in root.findall(f'{NS}offer'):
        data = _parse_offer(offer)
        pid = data['id']
        if not pid:
            continue

        # Store property hash
        pipe.hset(f'property:{pid}', mapping=data)
        pipe.sadd('idx:properties:all', pid)

        # Sorted set indexes (numeric range queries)
        price = float(data['price'])
        area = float(data['area'])
        floor = float(data['floor']) if data['floor'] else 0
        ppm = float(data['price_per_meter'])
        la = float(data['living_area'])

        if price > 0:
            pipe.zadd('idx:properties:price', {pid: price})
        if area > 0:
            pipe.zadd('idx:properties:area', {pid: area})
        if floor > 0:
            pipe.zadd('idx:properties:floor', {pid: floor})
        if ppm > 0:
            pipe.zadd('idx:properties:price_per_meter', {pid: ppm})
        if la > 0:
            pipe.zadd('idx:properties:living_area', {pid: la})

        # Set indexes (exact match)
        if data['rooms']:
            pipe.sadd(f'idx:properties:rooms:{data["rooms"]}', pid)
        if data['status']:
            pipe.sadd(f'idx:properties:status:{data["status"]}', pid)
        if data['building_id']:
            pipe.sadd(f'idx:properties:building:{data["building_id"]}', pid)
        if data['building_section']:
            pipe.sadd(f'idx:properties:section:{data["building_section"]}', pid)
        if data['property_type']:
            pipe.sadd(f'idx:properties:property_type:{data["property_type"]}', pid)
        if data['euro_layout']:
            pipe.sadd(f'idx:properties:euro:{data["euro_layout"]}', pid)
        if data['studio']:
            pipe.sadd(f'idx:properties:studio:{data["studio"]}', pid)

        # Custom field indexes (features like "Кухня-гостиная", "Панорамное остекление")
        custom_fields = json.loads(data['custom_fields']) if data['custom_fields'] != '{}' else {}
        for cf_name, cf_val in custom_fields.items():
            if cf_val:
                safe_name = cf_name.replace(' ', '_').lower()
                pipe.sadd(f'idx:properties:feature:{safe_name}', pid)

        # Store house/object info once
        if data['building_id'] and data['building_id'] not in seen_houses:
            seen_houses.add(data['building_id'])
            pipe.hset(f'house:{data["building_id"]}', mapping={
                'id': data['building_id'],
                'name': data['building_name'],
                'floors_total': data['floors_total'],
                'built_year': data['built_year'],
                'ready_quarter': data['ready_quarter'],
                'building_state': data['building_state'],
            })

        if data['complex_id'] and data['complex_id'] not in seen_objects:
            seen_objects.add(data['complex_id'])
            pipe.hset(f'object:{data["complex_id"]}', mapping={
                'id': data['complex_id'],
                'name': data['complex_name'],
                'address': data['address'],
                'city': data['city'],
                'region': data['region'],
            })

        count += 1

    # Save hash + timestamp
    import datetime
    pipe.set(FEED_HASH_KEY, xml_hash)
    pipe.set(FEED_UPDATED_AT_KEY, datetime.datetime.now().isoformat())
    pipe.execute()

    logger.info('Parsed %d properties into Redis.', count)
    return True
