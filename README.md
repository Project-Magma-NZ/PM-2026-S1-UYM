# PM-2026-S1-UYM

## Project Overview

Creating a web-based analytics dashboard for social media and website performance data for Upside Youth Mentoring.

## Tech Stack

Frontend:
- React 19 with TypeScript
- Vite (dev server and build tool)
- Tailwind CSS v4
- Recharts (bar, area, pie charts)
- react-simple-maps (NZ and world maps)
- Motion (animations)

Backend:
- Python
- Google Analytics Data API
- FastAPI

## Features (MVP)

Dashboard which shows:
- Google Analytics metrics
- Meta Business Suite metrics
- Monthly summary tab
- Yearly summary tab
- Clean, simple UX/UI with statistics displayed and basic charts

## Members

- Kavya Thangella (Team Lead)
- Thisumi Goonawardana
- Niklaus Li
- Ben Nguyen
- Wentao Yan
- Alex Xue

## How to Run This Project
In root folder, run: 
```uv run --with fastapi --with uvicorn --with pandas uvicorn api.main:app --reload```

In frontend/dashboard, run: 
```npm run dev```

Note: if normal npm install is not working try 
```npm install --legacy-peer-deps```

