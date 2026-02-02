# Frontend (Vite + React)

Asset Inventory POC frontend.

## Requirements

- Node.js 18+ recommended
- npm (or pnpm/yarn)

## Setup

From the frontend directory:

```
npm install
```

## Run locally

```
npm run dev
```

The app will be available at the URL printed by Vite (typically http://127.0.0.1:5173).

## API base URL

The frontend uses the following environment variable:

- VITE_API_BASE_URL (defaults to http://127.0.0.1:8000)

Create a .env file in frontend/ if you want to override it:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Build

```
npm run build
```

## Lint

```
npm run lint
```# Asset Inventory POC - Frontend

React UI for the Asset Inventory POC. It talks to the Django API using token auth and defaults to `http://127.0.0.1:8000` if no API base URL is provided.

## Tech Stack
- React 19
- Vite (rolldown)
- MUI + Emotion
- React Router

## Prerequisites
- Node.js 18+

## Setup
1) Install dependencies:
- `npm install`

2) (Optional) Create a `.env` file in this folder (frontend/) and set the API base URL:
- `VITE_API_BASE_URL=http://127.0.0.1:8000`

## Run
- `npm run dev`

## Build
- `npm run build`

## Preview
- `npm run preview`

## Lint
- `npm run lint`
