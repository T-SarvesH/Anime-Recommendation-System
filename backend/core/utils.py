#Utilities to be used in the core app

""" Utility 1: Password hasher using argon2 hash algorithm and passlib """
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated='auto')

def argon2_pwd_hasher(password: str) -> str:
    return pwd_context.hash(password)

def password_verifier(passwordEntered:str, hashed_password: str) -> bool:
    return pwd_context.verify(passwordEntered, hashed_password)