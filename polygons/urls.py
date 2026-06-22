from django.urls import path
from . import views

urlpatterns = [
    path('polygons/', views.polygons_list),
]
