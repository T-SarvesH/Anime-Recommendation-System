#Database connection setup using SQLAlchemy (Status: ToDo)

import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

load_dotenv()

DATABASE_URL_for_async_engine = os.getenv("DATABASE_URL_FOR_FASTAPI")
DATABASE_URL_for_sync_engine = os.getenv("SYNC_DATABASE_URL")

if not DATABASE_URL_for_async_engine:
    raise ValueError("DATABASE_URL for async engineis not set")


postgres_engine = create_async_engine(

    DATABASE_URL_for_async_engine,
    echo=True,
    future = True
)


AsyncSessionLocal = async_sessionmaker(

    autocommit = False,
    autoflush=False,
    bind = postgres_engine,
    expire_on_commit = False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        
        finally:
            await session.close()


#Engine for the model

if not DATABASE_URL_for_sync_engine:
    raise ValueError(f"Database url for sync engine is not set") 

#ECHO logs every sql command sent to DB and also debugs sql interactions with DB
postgres_sync_engine = create_engine(DATABASE_URL_for_sync_engine, echo=True)

