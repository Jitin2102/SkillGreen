# SkillGreen — FastAPI backend

FROM python:3.13-slim

WORKDIR /app

# Install dependencies first, separately from app code,
# so Docker can cache this layer and skip reinstalling
# every time only your source files change.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of the application code
COPY . .

# Render (and most platforms) inject $PORT at runtime.
# Default to 8000 for local `docker run` without that variable set.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
