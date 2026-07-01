from unfold.admin import ModelAdmin, TabularInline, StackedInline
from django.contrib import admin
from .models import (
    HeroSection,
    EditorialSection, EditorialFeature, EditorialPhoto,
    VideoBlock, VideoBlockItem,
    AccordionSection, AccordionPanel,
    GallerySection, GallerySlide,
    ApplySection,
    FooterSection,
)


class SingletonAdmin(ModelAdmin):
    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


class LockedAdmin(ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


# ── Hero ─────────────────────────────────────────────────────────────

@admin.register(HeroSection)
class HeroSectionAdmin(SingletonAdmin):
    fields = ('eyebrow', 'title', 'subtitle', 'background_image')


# ── Editorial ────────────────────────────────────────────────────────

class EditorialFeatureInline(TabularInline):
    model = EditorialFeature
    extra = 0


class EditorialPhotoInline(StackedInline):
    model = EditorialPhoto
    extra = 0


@admin.register(EditorialSection)
class EditorialSectionAdmin(SingletonAdmin):
    fields = ('title', 'cta_text', 'cta_link')
    inlines = [EditorialFeatureInline, EditorialPhotoInline]


# ── Video blocks ─────────────────────────────────────────────────────

class VideoBlockItemInline(TabularInline):
    model = VideoBlockItem
    extra = 0


@admin.register(VideoBlock)
class VideoBlockAdmin(LockedAdmin):
    list_display = ('title', 'slug', 'is_active', 'order')
    fields = ('slug', 'video', 'eyebrow', 'title', 'cta_text', 'is_active', 'order')
    readonly_fields = ('slug',)
    inlines = [VideoBlockItemInline]


# ── Accordion ────────────────────────────────────────────────────────

class AccordionPanelInline(StackedInline):
    model = AccordionPanel
    extra = 0


@admin.register(AccordionSection)
class AccordionSectionAdmin(SingletonAdmin):
    fields = ('kicker', 'title', 'title_accent')
    inlines = [AccordionPanelInline]


# ── Gallery ──────────────────────────────────────────────────────────

class GallerySlideInline(StackedInline):
    model = GallerySlide
    extra = 0


@admin.register(GallerySection)
class GallerySectionAdmin(SingletonAdmin):
    fields = ('kicker',)
    inlines = [GallerySlideInline]


# ── Apply ────────────────────────────────────────────────────────────

@admin.register(ApplySection)
class ApplySectionAdmin(SingletonAdmin):
    fields = ('kicker', 'title', 'title_accent', 'subtitle', 'success_title', 'success_text')


# ── Footer ───────────────────────────────────────────────────────────

@admin.register(FooterSection)
class FooterSectionAdmin(SingletonAdmin):
    fieldsets = (
        ('Основное', {'fields': ('tagline', 'copyright_text')}),
        ('Контакты', {'fields': ('office_address', 'work_hours', 'phone')}),
        ('Карта', {'fields': ('map_address', 'map_url')}),
        ('Соцсети', {'fields': ('vk_url', 'telegram_url')}),
    )
