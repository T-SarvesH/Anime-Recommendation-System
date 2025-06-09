from django.shortcuts import render
from django.http import HttpResponse
#Testing if application is working
def test(request):
    return HttpResponse("Core app is working fine!")
