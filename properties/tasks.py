import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def parse_feed(self):
    """Celery task: download and parse Profitbase XML feed if changed."""
    try:
        from .parser import fetch_and_parse
        updated = fetch_and_parse()
        return {'updated': updated}
    except Exception as exc:
        logger.exception('Feed parse failed')
        raise self.retry(exc=exc)
