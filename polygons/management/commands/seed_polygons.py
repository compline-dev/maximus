from __future__ import annotations

from django.core.management.base import BaseCommand

from polygons.models import FlatPolygon
from polygons.seed_data import FIRST_FLOOR, SECTION_POLYGON_PATHS
from properties.filters import PropertyFilter, filter_properties
from properties.redis_client import get_redis


def _floors_total_for_section(section: str) -> int | None:
    r = get_redis()
    sample_id = next(iter(r.smembers(f'idx:properties:section:{section}') or []), None)
    if not sample_id:
        return None
    prop = r.hgetall(f'property:{sample_id}')
    building_id = prop.get('building_id')
    if not building_id:
        return None
    house = r.hgetall(f'house:{building_id}')
    raw = house.get('floors_total')
    return int(raw) if raw and str(raw).isdigit() else None


def _flats_on_floor(section: str, floor: int) -> list[dict]:
    data = filter_properties(
        PropertyFilter(section=[section], floor_min=floor, floor_max=floor, limit=50),
    )
    return sorted(data['results'], key=lambda p: int(p.get('number') or 0))


class Command(BaseCommand):
    help = (
        'Seed floor-plan SVG polygons into SQLite, linking each path to a '
        'Profitbase internal-id from Redis (by apartment order on the floor).'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--section',
            action='append',
            dest='sections',
            help='Seed only these sections (e.g. --section 1). Default: all with paths.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print mappings without writing to the database.',
        )

    def handle(self, *args, **options):
        target_sections = options['sections']
        dry_run = options['dry_run']

        sections = target_sections or [
            s for s, paths in SECTION_POLYGON_PATHS.items() if paths
        ]

        if not sections:
            self.stdout.write(self.style.WARNING('No sections to seed (all path lists are empty).'))
            return

        total_created = 0
        total_updated = 0
        total_skipped = 0

        for section in sections:
            paths = SECTION_POLYGON_PATHS.get(section)
            if not paths:
                self.stdout.write(self.style.WARNING(f'Section {section}: no paths defined, skipped.'))
                continue

            floors_total = _floors_total_for_section(section)
            if not floors_total:
                self.stderr.write(self.style.ERROR(
                    f'Section {section}: no data in Redis (run Celery parse first).',
                ))
                continue

            self.stdout.write(
                f'Section {section}: floors {FIRST_FLOOR}-{floors_total}, '
                f'{len(paths)} polygon(s) per floor',
            )

            for floor in range(FIRST_FLOOR, floors_total + 1):
                flats = _flats_on_floor(section, floor)
                if not flats:
                    self.stdout.write(self.style.WARNING(f'  floor {floor}: no flats in Redis, skipped'))
                    continue

                if len(flats) < len(paths):
                    self.stdout.write(self.style.WARNING(
                        f'  floor {floor}: only {len(flats)} flat(s) for {len(paths)} polygon(s)',
                    ))

                for idx, path_d in enumerate(paths):
                    if idx >= len(flats):
                        total_skipped += 1
                        continue

                    flat = flats[idx]
                    flat_id = flat['id']
                    flat_number = flat.get('number', '?')

                    if dry_run:
                        self.stdout.write(
                            f'  [dry-run] floor {floor}: polygon {idx + 1} -> '
                            f'id={flat_id} (no.{flat_number})',
                        )
                        continue

                    _, created = FlatPolygon.objects.update_or_create(
                        section=section,
                        floor=floor,
                        flat_id=flat_id,
                        defaults={'path_d': path_d},
                    )
                    if created:
                        total_created += 1
                    else:
                        total_updated += 1

        if dry_run:
            self.stdout.write(self.style.SUCCESS('Dry run complete.'))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Done: {total_created} created, {total_updated} updated, '
                f'{total_skipped} polygon slot(s) without a flat.',
            ))
