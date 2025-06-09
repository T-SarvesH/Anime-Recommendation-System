from django.shortcuts import render
from django.http import HttpResponse
from fastapi import FastAPI
from models import UserBasicCreate
#Testing if application is working

app = FastAPI()

@app.get("/userInfo/{userId}")
def getuserInfo(userId: str):
    pass

@app.post('/addUser')
def addUser():
    user = UserBasicCreate(user_id='1234', email='a@gmail.com', password='aaaaaaaaa', location=['Mumbai'])
    return user