FROM python:3.13-slim

RUN mkdir /app

WORKDIR /app

# prevents Python from writing pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# tool for chroma-hnswlib (C++11/C++14)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
 
RUN pip install --upgrade pip 
 
COPY requirements.txt /app/
 
RUN pip install --no-cache-dir -r requirements.txt
 
COPY . /app/
 
EXPOSE 8000
 
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]