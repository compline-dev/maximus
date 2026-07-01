#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

# ponytail: auto-create superuser on first run, noop if exists
python manage.py createsuperuser --noinput 2>/dev/null || true

exec "$@"
