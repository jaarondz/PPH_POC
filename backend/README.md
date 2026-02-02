# Backend (Django)

Asset Inventory POC backend API.

## Requirements

- Python 3.10+ recommended
- A virtual environment tool (venv, conda, etc.)

## Setup

1. Create and activate a virtual environment.
2. Install dependencies.

```
pip install -r requirements.txt
```

## Run locally

From the backend directory:

```
python manage.py migrate
python manage.py runserver
```

The API will be available at http://127.0.0.1:8000.

## Environment

Configuration is located in backend/config/settings.py. This project uses token auth.

## Project apps

- assets
- projects
- documents
- reports
- outcomes
- users
- core

## Useful commands

```
python manage.py createsuperuser
python manage.py makemigrations
python manage.py migrate
```

## Notes

The frontend expects the API base URL to be http://127.0.0.1:8000 unless overridden.# Asset Inventory POC - Backend

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
