#Database connection setup using SQLAlchemy (Status: ToDo)

import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

DATABASE_URL_for_async_engine = os.getenv("DATABASE_URL_FOR_FASTAPI")

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


