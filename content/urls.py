from django.urls import path
from . import views

urlpatterns = [
    path('content/home/', views.home_content),
]
