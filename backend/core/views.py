from django.shortcuts import render
from django.http import HttpResponse
from fastapi import FastAPI
from core.models import UserCreate

#Testing if application is working

app = FastAPI()

@app.get("/userInfo")
def getuserInfo():
    return {"message": "Hellow World"}