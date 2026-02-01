# Asset Inventory POC - Backend

Django REST API for managing assets, projects, outcomes, and users. The API is served under `/api/` and uses token authentication.

## Tech Stack
- Django + Django REST Framework
- PostgreSQL
- django-cors-headers
- drf-spectacular
- python-dotenv

## Prerequisites
- Python 3.10+
- PostgreSQL (or Docker)

## Environment Variables
Create a `.env` file in this folder (backend/) with:

- `DB_NAME` (default: `portfolio_poc`)
- `DB_USER` (default: `portfolio_user`)
- `DB_PASSWORD` (default: `portfolio_pass`)
- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `5432`)
- `CORS_ALLOWED_ORIGINS` (comma-separated, e.g. `http://localhost:5173`)

## Quick Start
1) Start Postgres (optional):
- `docker-compose up -d`

2) Create and activate a virtual environment, then install dependencies:
- `pip install Django djangorestframework django-cors-headers drf-spectacular python-dotenv psycopg2-binary`

3) Run migrations:
- `python manage.py migrate`

4) (Optional) Create a superuser:
- `python manage.py createsuperuser`

5) Run the server:
- `python manage.py runserver`

## Key Endpoints
- Base API: `http://127.0.0.1:8000/api/`
- Login: `POST /api/auth/login/`
- Current user: `GET /api/auth/me/`

## Auth
Use token auth by sending:

`Authorization: Token <token>`
