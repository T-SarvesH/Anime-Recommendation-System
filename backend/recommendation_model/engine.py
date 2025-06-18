import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL_FOR_SYNC_ENGINE = os.getenv('SYNC_DATABASE_URL')

if not DATABASE_URL_FOR_SYNC_ENGINE:
    raise ValueError(f"Sync database url is not set")

sync_engine = create_engine(

    DATABASE_URL_FOR_SYNC_ENGINE, echo=True
)