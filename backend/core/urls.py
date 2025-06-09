from django.urls import path, include
from . import views

urlpatterns = [

    path('test/', view=views.test, name='test')
]