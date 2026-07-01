from django.http import JsonResponse
from .models import (
    HeroSection, EditorialSection, VideoBlock,
    AccordionSection, GallerySection, ApplySection, FooterSection,
)


def _media_url(field):
    return field.url if field else ''


def home_content(request):
    hero = HeroSection.load()
    editorial = EditorialSection.load()
    accordion = AccordionSection.load()
    gallery = GallerySection.load()
    apply_sec = ApplySection.load()
    footer = FooterSection.load()

    data = {
        'hero': {
            'eyebrow': hero.eyebrow,
            'title': hero.title,
            'subtitle': hero.subtitle,
            'backgroundImage': _media_url(hero.background_image),
        },
        'editorial': {
            'title': editorial.title,
            'ctaText': editorial.cta_text,
            'ctaLink': editorial.cta_link,
            'features': list(editorial.features.values_list('text', flat=True)),
            'photos': [
                {
                    'src': _media_url(p.image),
                    'num': p.number,
                    'title': p.title,
                    'desc': p.description,
                }
                for p in editorial.photos.all()
            ],
        },
        'videoBlocks': [
            {
                'slug': v.slug,
                'video': _media_url(v.video),
                'eyebrow': v.eyebrow,
                'title': v.title,
                'ctaText': v.cta_text,
                'items': list(v.items.values_list('text', flat=True)),
            }
            for v in VideoBlock.objects.filter(is_active=True)
        ],
        'accordion': {
            'kicker': accordion.kicker,
            'title': accordion.title,
            'titleAccent': accordion.title_accent,
            'panels': [
                {
                    'label': p.label,
                    'title': p.title,
                    'desc': p.description,
                    'image': _media_url(p.image),
                    'video': _media_url(p.video),
                }
                for p in accordion.panels.all()
            ],
        },
        'gallery': {
            'kicker': gallery.kicker,
            'slides': [
                {
                    'label': s.label,
                    'title': s.title,
                    'desc': s.description,
                    'image': _media_url(s.image),
                }
                for s in gallery.slides.all()
            ],
        },
        'apply': {
            'kicker': apply_sec.kicker,
            'title': apply_sec.title,
            'titleAccent': apply_sec.title_accent,
            'subtitle': apply_sec.subtitle,
            'successTitle': apply_sec.success_title,
            'successText': apply_sec.success_text,
        },
        'footer': {
            'tagline': footer.tagline,
            'officeAddress': footer.office_address,
            'workHours': footer.work_hours,
            'phone': footer.phone,
            'mapAddress': footer.map_address,
            'mapUrl': footer.map_url,
            'copyright': footer.copyright_text,
            'vkUrl': footer.vk_url,
            'telegramUrl': footer.telegram_url,
        },
    }

    return JsonResponse(data)
