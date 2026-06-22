from django.http import JsonResponse
from .models import FlatPolygon


def polygons_list(request):
    section = request.GET.get('section', '')
    floor = request.GET.get('floor', '')
    if not section or not floor:
        return JsonResponse({})
    qs = FlatPolygon.objects.filter(section=section, floor=floor)
    return JsonResponse({p.flat_id: p.path_d for p in qs})
