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

This project uses a `pyproject.toml` file to manage dependencies. You can use `uv` to set up the environment. Please, remember to install `uv` if you haven't already. [Link](https://docs.astral.sh/uv/#highlights) 

1. **Install UV**
For Mac and Linux:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

For Windows:
```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Afterward, you can verify the installation by running uv version:

```bash
uv version
```

2. **Clone the repository:**

```bash
git clone https://github.com/ProjectMagmaNZ/PM-2026-S1-UYM.git
cd PM-2026-S1-UYM
```

2. **Create a virtual environment using `pyproject.toml`:**

```bash
uv sync
```

_(Which will create its own .venv/, activate it, and install the dependencies in the `pyproject.toml` file.)_

Alternatively, activate the virtual environment

```bash
source .venv/bin/activate
```

3. **Create .env file:**

```bash
touch .env
```

Add these variables to `.env` before running the demographics notebook:

```bash
GA4_PROPERTY_ID=your_ga4_property_id
GA4_CREDENTIALS_PATH=/absolute/path/to/service-account.json
```

Running [demographics.ipynb](demographics.ipynb) writes separate CSV files into the `outputs/` folder. Each file is a tidy table with one row per GA4 result and columns for the selected dimensions, metrics, and date range.

## Demographic Dimensions Used In Export

The notebook exports one CSV per demographic dimension.

| API dimension name | Meaning in GA4 |
| --- | --- |
| `userAgeBracket` | User age bracket (for example: 18-24, 25-34, 35-44, 45-54, 55-64, 65+, or unknown). |
| `userGender` | User gender category (for example: female, male, or unknown). |
| `language` | Browser or device language used by the visitor (for example: English). |
| `city` | City where user activity originated (derived from IP/location signals). |
| `country` | Country where user activity originated. |
| `region` | Geographic region/state where user activity originated. |

Notes:
- Demographic values can contain `unknown` or `(not set)` when GA4 has limited data.
- Demographic reports may be thresholded for privacy and can return fewer rows than expected.

## Metrics Used In Export

The notebook currently exports these GA4 metrics into each demographics CSV:

| Metric name | Meaning in GA4 |
| --- | --- |
| `activeUsers` | Distinct active users who visited the site/app in the selected date range. |
| `newUsers` | Users who interacted for the first time in the selected date range. |
| `sessions` | Number of sessions started (`session_start` events). |
| `engagedSessions` | Sessions that lasted over 10 seconds, or had a key event, or had at least 2 views. |
| `eventCount` | Total count of events recorded. |
| `userEngagementDuration` | Total user engagement time in seconds while site/app was in foreground. |

Each exported CSV also includes:
- `demographic_dimension`: The GA4 API name of the demographic dimension used for that file.
- `demographic_value`: The value for that demographic bucket in each row.
- `date_range_start` and `date_range_end`: Date range used for the query.

## FastAPI Service (For Frontend)

This project now includes a FastAPI service that reads the CSV files in `outputs/` and exposes them via REST endpoints.

### Run API Locally

1. Install dependencies:

```bash
uv sync
```

2. Start the API:

```bash
uv run python main.py
```

3. Open API docs:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

### Environment Variables

Optional variables for API behavior:

```bash
API_HOST=0.0.0.0
API_PORT=8000
API_PREFIX=/api/v1
OUTPUT_DIR=outputs
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CACHE_TTL_SECONDS=120
```

### API Endpoints

- `GET /health`
	- Health and data readiness.
- `GET /api/v1/demographics`
	- Query params:
		- `dimension` (optional)
		- `year_month` (optional, format `YYYYMM`)
		- `value` (optional substring match on demographic value)
		- `limit` (default `100`, max `1000`)
		- `offset` (default `0`)
		- `sort_by` (`year_month`, `demographic_value`, `activeUsers`, `newUsers`, `sessions`, `engagedSessions`, `eventCount`, `userEngagementDuration`)
		- `sort_order` (`asc` or `desc`)
- `GET /api/v1/demographics/{dimension}`
	- Same filters as above, with path-level dimension.
- `GET /api/v1/metadata/dimensions`
	- Returns available dimensions from current CSV snapshot.
- `GET /api/v1/metadata/months`
	- Returns available `year_month` values from current CSV snapshot.

### Example Requests

```bash
curl "http://localhost:8000/api/v1/demographics?dimension=userGender&year_month=202601&limit=20&offset=0"
```

```bash
curl "http://localhost:8000/api/v1/metadata/dimensions"
```

```bash
curl "http://localhost:8000/health"
```

### Response Shape (List Endpoint)

```json
{
	"total": 123,
	"limit": 20,
	"offset": 0,
	"has_next": true,
	"items": [
		{
			"demographic_dimension": "userGender",
			"year_month": "202601",
			"demographic_value": "female",
			"activeUsers": 31,
			"newUsers": 30,
			"sessions": 51,
			"engagedSessions": 37,
			"eventCount": 416,
			"userEngagementDuration": 6870,
			"date_range_start": "2026-01-01",
			"date_range_end": "yesterday"
		}
	]
}
```
