from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import os, sys, asyncio
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

load_dotenv()

from database import postgres_engine, Base
from models import Location, User, Rating, Anime, Genre, Season

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    # ... (no change here) ...
    url = os.getenv("DATABASE_URL")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = postgres_engine
    print("DEBUG: Starting run_migrations_online.")

    async def process_migrations_online():
        print("DEBUG: Inside process_migrations_online.")
        async with connectable.connect() as connection:
            print("DEBUG: Database connection established.")
            trans = await connection.begin()
            print("DEBUG: Transaction started.")
            try:
                await connection.run_sync(
                    lambda sync_connection: context.configure(
                        connection=sync_connection,
                        target_metadata=target_metadata,
                        transactional_ddl=False,
                    )
                )
                print("DEBUG: Alembic context configured.")

                await connection.run_sync(
                    lambda sync_connection: context.run_migrations()
                )
                print("DEBUG: Migrations attempted to run.")

                await trans.commit()
                print("DEBUG: Transaction committed!") # This line should print if successful
            except Exception as e:
                print(f"ERROR: An exception occurred: {e}")
                await trans.rollback()
                print("DEBUG: Transaction rolled back!")
                raise # Re-raise the exception to show it on the console

    try:
        asyncio.run(process_migrations_online())
        print("DEBUG: Async process completed.") # This should print if asyncio.run succeeds
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to run async migrations: {e}")
        # This will catch any error re-raised by process_migrations_online
        # and print it more clearly.
        sys.exit(1) # Exit with an error code

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()