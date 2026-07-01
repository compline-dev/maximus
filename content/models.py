from django.db import models


class SingletonModel(models.Model):
    # ponytail: singleton without django-solo — just pk=1 + admin locks
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


# ── Hero ─────────────────────────────────────────────────────────────

class HeroSection(SingletonModel):
    eyebrow = models.CharField('Надпись сверху', max_length=120, default='Жилой комплекс · I очередь')
    title = models.CharField('Заголовок', max_length=60, default='МАКСИМУС')
    subtitle = models.CharField('Подзаголовок', max_length=200, default='Архитектура премиум-класса на берегу города')
    background_image = models.ImageField('Фоновое изображение', upload_to='hero/', blank=True)

    class Meta:
        verbose_name = 'Hero-секция'
        verbose_name_plural = 'Hero-секция'

    def __str__(self):
        return 'Hero'


# ── Editorial ────────────────────────────────────────────────────────

class EditorialSection(SingletonModel):
    title = models.CharField('Заголовок', max_length=120, default='Архитектура вне времени')
    cta_text = models.CharField('Текст кнопки', max_length=60, default='Выбрать квартиру')
    cta_link = models.CharField('Ссылка кнопки', max_length=200, default='/flats')

    class Meta:
        verbose_name = 'Editorial-секция'
        verbose_name_plural = 'Editorial-секция'

    def __str__(self):
        return 'Editorial'


class EditorialFeature(models.Model):
    section = models.ForeignKey(EditorialSection, on_delete=models.CASCADE, related_name='features')
    text = models.CharField('Текст', max_length=200)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Фича'
        verbose_name_plural = 'Фичи'

    def __str__(self):
        return self.text


class EditorialPhoto(models.Model):
    section = models.ForeignKey(EditorialSection, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField('Фото', upload_to='editorial/')
    number = models.CharField('Номер', max_length=4, default='01')
    title = models.CharField('Заголовок', max_length=60)
    description = models.CharField('Описание', max_length=200)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Фото'
        verbose_name_plural = 'Фото'

    def __str__(self):
        return self.title


# ── Video blocks (2 штуки на главной) ───────────────────────────────

class VideoBlock(models.Model):
    slug = models.SlugField('Идентификатор', unique=True, help_text='Не менять')
    video = models.FileField('Видео', upload_to='video/', blank=True)
    eyebrow = models.CharField('Надпись сверху', max_length=200, blank=True)
    title = models.CharField('Заголовок', max_length=200)
    cta_text = models.CharField('Текст кнопки', max_length=60, blank=True)
    order = models.PositiveSmallIntegerField('Порядок на странице', default=0)
    is_active = models.BooleanField('Показывать', default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Видео-блок'
        verbose_name_plural = 'Видео-блоки'

    def __str__(self):
        return self.title


class VideoBlockItem(models.Model):
    block = models.ForeignKey(VideoBlock, on_delete=models.CASCADE, related_name='items')
    text = models.CharField('Текст', max_length=200)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Пункт'
        verbose_name_plural = 'Пункты'

    def __str__(self):
        return self.text


# ── Accordion ────────────────────────────────────────────────────────

class AccordionSection(SingletonModel):
    kicker = models.CharField('Kicker', max_length=200, default='Внутри проекта · Инфраструктура')
    title = models.CharField('Заголовок', max_length=200, default='Дом, который')
    title_accent = models.CharField('Акцентное слово (курсив)', max_length=60, default='раскрывается')

    class Meta:
        verbose_name = 'Аккордеон-секция'
        verbose_name_plural = 'Аккордеон-секция'

    def __str__(self):
        return 'Аккордеон'


class AccordionPanel(models.Model):
    section = models.ForeignKey(AccordionSection, on_delete=models.CASCADE, related_name='panels')
    label = models.CharField('Метка (таб)', max_length=40)
    title = models.CharField('Заголовок', max_length=120)
    description = models.CharField('Описание', max_length=300, blank=True)
    image = models.ImageField('Изображение', upload_to='accordion/', blank=True)
    video = models.FileField('Видео', upload_to='accordion/', blank=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Панель'
        verbose_name_plural = 'Панели'

    def __str__(self):
        return self.label


# ── Pinned Gallery ───────────────────────────────────────────────────

class GallerySection(SingletonModel):
    kicker = models.CharField('Kicker', max_length=200, default='Архитектура · Горизонт')

    class Meta:
        verbose_name = 'Галерея-секция'
        verbose_name_plural = 'Галерея-секция'

    def __str__(self):
        return 'Галерея'


class GallerySlide(models.Model):
    section = models.ForeignKey(GallerySection, on_delete=models.CASCADE, related_name='slides')
    label = models.CharField('Метка', max_length=40)
    title = models.CharField('Заголовок', max_length=120)
    description = models.CharField('Описание', max_length=300, blank=True)
    image = models.ImageField('Изображение', upload_to='gallery/')
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Слайд'
        verbose_name_plural = 'Слайды'

    def __str__(self):
        return self.title


# ── Apply form ───────────────────────────────────────────────────────

class ApplySection(SingletonModel):
    kicker = models.CharField('Kicker', max_length=60, default='Заявка')
    title = models.CharField('Заголовок', max_length=120, default='Запишитесь на')
    title_accent = models.CharField('Акцентное слово (курсив)', max_length=60, default='приватный показ')
    subtitle = models.TextField('Подзаголовок', default='Оставьте контакты — менеджер свяжется с вами и подберёт удобное время визита в шоурум.')
    success_title = models.CharField('Заголовок успеха', max_length=60, default='Спасибо')
    success_text = models.CharField('Текст успеха', max_length=200, default='Заявка принята. Мы свяжемся с вами в ближайшее время.')

    class Meta:
        verbose_name = 'Форма заявки'
        verbose_name_plural = 'Форма заявки'

    def __str__(self):
        return 'Форма заявки'


# ── Footer ───────────────────────────────────────────────────────────

class FooterSection(SingletonModel):
    tagline = models.CharField('Слоган', max_length=200, default='Жилой комплекс премиум-класса. Архитектура, продуманная для жизни.')
    office_address = models.CharField('Адрес офиса', max_length=200, default='Офис продаж: г. Уфа, ул. Гафури, 77')
    work_hours = models.CharField('Время работы', max_length=100, default='ЕЖЕДНЕВНО с 10:00 до 20:00')
    phone = models.CharField('Телефон', max_length=30, default='+7 (347) 225 70 25')
    map_address = models.CharField('Адрес на карте', max_length=200, default='г. Уфа, ул. Менделеева, 154')
    map_url = models.URLField('Ссылка на карту', max_length=500, default='https://yandex.ru/maps/172/ufa/house/ulitsa_mendeleyeva_154/YU8YdgViT0QCQFtufXtzcXhiZw==/')
    copyright_text = models.CharField('Копирайт', max_length=120, default='© 2026 МАКСИМУС. Все права защищены.')
    vk_url = models.URLField('ВКонтакте', max_length=300, blank=True, default='https://vk.com/gk_stroitek_ufa')
    telegram_url = models.URLField('Telegram', max_length=300, blank=True, default='https://t.me/gk_stroitek_ufa')

    class Meta:
        verbose_name = 'Подвал'
        verbose_name_plural = 'Подвал'

    def __str__(self):
        return 'Подвал'
