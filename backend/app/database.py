from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=not SQLALCHEMY_DATABASE_URL.startswith("sqlite"),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    from . import models
    models.Base.metadata.create_all(bind=engine)
    _ensure_schema()


def _ensure_schema():
    inspector = inspect(engine)
    if "todos" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("todos")}
    if "attachments" not in columns:
        with engine.begin() as connection:
            try:
                connection.execute(text("ALTER TABLE todos ADD COLUMN attachments JSON"))
                print("[INFO] Added 'attachments' column to todos table")
            except Exception:
                connection.execute(text("ALTER TABLE todos ADD COLUMN attachments TEXT"))
                print("[INFO] Added 'attachments' column to todos table as TEXT")
