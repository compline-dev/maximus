from django.contrib import admin
from django.utils.html import format_html

from .models import FlatPolygon


@admin.register(FlatPolygon)
class FlatPolygonAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'section', 'floor', 'path_preview', 'svg_thumb')
    list_display_links = ('display_name',)
    list_filter = ('section', 'floor')
    list_per_page = 50
    search_fields = ('flat_id', 'section')
    ordering = ('section', 'floor', 'flat_id')

    fieldsets = (
        (None, {
            'fields': ('section', 'floor', 'flat_id'),
        }),
        ('SVG', {
            'fields': ('path_d', 'svg_preview_large'),
        }),
    )
    readonly_fields = ('svg_preview_large',)

    @admin.display(description='Квартира')
    def display_name(self, obj):
        return f'Кв. {obj.flat_id}'

    @admin.display(description='Path (превью)')
    def path_preview(self, obj):
        d = obj.path_d or ''
        return d[:80] + '...' if len(d) > 80 else d

    @admin.display(description='Контур')
    def svg_thumb(self, obj):
        if not obj.path_d:
            return '-'
        return format_html(
            '<svg viewBox="0 0 4000 2000" '
            'style="width:120px;height:60px;border:1px solid #ddd;background:#fafafa">'
            '<path d="{}" fill="rgba(31,58,44,0.25)" stroke="#1F3A2C" stroke-width="20"/>'
            '</svg>',
            obj.path_d,
        )

    @admin.display(description='Превью контура')
    def svg_preview_large(self, obj):
        if not obj.path_d:
            return '-'
        return format_html(
            '<svg viewBox="0 0 4000 2000" '
            'style="width:400px;height:200px;border:1px solid #ccc;background:#f5f5f5">'
            '<path d="{}" fill="rgba(31,58,44,0.3)" stroke="#1F3A2C" stroke-width="12"/>'
            '</svg>',
            obj.path_d,
        )
