from django.core.management.base import BaseCommand
from content.models import (
    HeroSection, EditorialSection, EditorialFeature, EditorialPhoto,
    VideoBlock, VideoBlockItem,
    AccordionSection, AccordionPanel,
    GallerySection, GallerySlide,
    ApplySection, FooterSection,
)


class Command(BaseCommand):
    help = 'Seed homepage content from current hardcoded values'

    def handle(self, *args, **options):
        self._hero()
        self._editorial()
        self._video_blocks()
        self._accordion()
        self._gallery()
        ApplySection.load()
        FooterSection.load()
        self.stdout.write(self.style.SUCCESS('Homepage content seeded.'))

    def _hero(self):
        HeroSection.load()

    def _editorial(self):
        sec = EditorialSection.load()
        if not sec.features.exists():
            for i, text in enumerate([
                'Арки как ключевой архитектурный элемент',
                'Неоклассика в современном прочтении',
                'Выразительный силуэт здания',
            ]):
                EditorialFeature.objects.create(section=sec, text=text, order=i)

    def _video_blocks(self):
        v1, _ = VideoBlock.objects.get_or_create(slug='passages', defaults={
            'eyebrow': 'Природное окружение · Городской комфорт',
            'title': 'В гармонии с вашим ритмом жизни',
            'order': 0,
        })
        if not v1.items.exists():
            for i, t in enumerate([
                'Отличная экология',
                '15 минут до центра Уфы',
                'Прямой выезд на улицу Менделеева',
                'Рядом: школы, парки, спорткомплексы',
            ]):
                VideoBlockItem.objects.create(block=v1, text=t, order=i)

        v2, _ = VideoBlock.objects.get_or_create(slug='architecture', defaults={
            'eyebrow': 'Архитектура вне времени',
            'title': 'Неоклассика в современном прочтении',
            'cta_text': 'Оставить заявку',
            'order': 1,
        })
        if not v2.items.exists():
            for i, t in enumerate([
                'Арки как ключевой архитектурный элемент',
                'Выразительный силуэт здания',
                'Благородные материалы и пропорции',
            ]):
                VideoBlockItem.objects.create(block=v2, text=t, order=i)

    def _accordion(self):
        sec = AccordionSection.load()
        if not sec.panels.exists():
            panels = [
                ('Обзор', 'Внутри комплекса', 'Премиальные общественные пространства и продуманная среда.'),
                ('Фитнес', 'Спорт у дома', 'Современный тренажёрный зал с панорамным остеклением — в шаге от квартиры.'),
                ('Резиденции', 'Личное пространство', 'Панорамное остекление и продуманные планировки.'),
                ('Интерьеры', 'Тишина внутри города', 'Натуральные материалы и продуманная фактура.'),
                ('Детали', 'Отделка премиум-класса', 'Каждый элемент интерьера выдержан в единой эстетике.'),
                ('Атмосфера', 'Свет и комфорт', 'Свет, который меняет настроение в течение дня.'),
                ('Пространство', 'Жизнь в МАКСИМУС', 'Инфраструктура, созданная для комфорта каждый день.'),
            ]
            for i, (label, title, desc) in enumerate(panels):
                AccordionPanel.objects.create(section=sec, label=label, title=title, description=desc, order=i)

    def _gallery(self):
        sec = GallerySection.load()
        if not sec.slides.exists():
            slides = [
                ('Двор', 'Зелёный двор', 'Приватная территория без машин — только пешеходные маршруты и деревья.'),
                ('Жизнь', 'В своём ритме', 'Пространство, в котором приятно проводить каждый день.'),
            ]
            for i, (label, title, desc) in enumerate(slides):
                GallerySlide.objects.create(section=sec, label=label, title=title, description=desc, order=i)
