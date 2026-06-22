from django.contrib import admin
from .models import FlatPolygon


@admin.register(FlatPolygon)
class FlatPolygonAdmin(admin.ModelAdmin):
    list_display = ('flat_id', 'section', 'floor', 'path_preview')
    list_filter = ('section', 'floor')
    search_fields = ('flat_id',)

    @admin.display(description='Координаты (превью)')
    def path_preview(self, obj):
        d = obj.path_d or ''
        return d[:60] + '…' if len(d) > 60 else d
