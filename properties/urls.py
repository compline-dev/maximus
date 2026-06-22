from django.urls import path
from . import views

urlpatterns = [
    path('properties/', views.properties_list, name='properties-list'),
    path('properties/<str:property_id>/', views.property_detail, name='property-detail'),
    path('filters/', views.filters_view, name='filters'),
    path('sections/', views.sections_view, name='sections'),
    path('parse/', views.parse_now, name='parse-now'),
]
