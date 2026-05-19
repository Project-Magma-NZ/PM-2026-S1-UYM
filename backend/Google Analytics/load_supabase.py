"""Load transformed GA4 CSV data into Supabase.

1. Run the SQL statements below in the Supabase SQL editor to create the tables.
2. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.
3. Run this script from the project root.
"""

import os
from typing import Iterable

import pandas as pd
from dotenv import load_dotenv
from postgrest import APIError
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit(
        "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file."
    )

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

CSV_TABLE_MAP = {
    "outputs/transform/ga4_users_demographic.csv": "ga4_users_demographic",
    "outputs/transform/ga4_users_location.csv": "ga4_users_location",
}

def chunked(iterable: Iterable[dict], size: int):
    chunk = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def load_csv_to_supabase(csv_path: str, table_name: str, batch_size: int = 500):
    print(f"Loading {csv_path} into {table_name}...")
    df = pd.read_csv(csv_path)
    records = df.where(pd.notnull(df), None).to_dict(orient="records")

    for batch in chunked(records, batch_size):
        try:
            supabase.table(table_name).insert(batch).execute()
        except APIError as exc:
            raise RuntimeError(
                f"Supabase insert failed for {table_name}: {exc}"
            ) from exc
    print(f"Loaded {len(records)} rows into {table_name}.")


if __name__ == "__main__":
    print("Supabase loading script")
    for csv_path, table_name in CSV_TABLE_MAP.items():
        load_csv_to_supabase(csv_path, table_name)

    print("Done.")
