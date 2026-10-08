import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured")
