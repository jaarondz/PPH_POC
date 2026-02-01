# Asset Inventory POC - Frontend

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
