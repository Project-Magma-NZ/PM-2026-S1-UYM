import os
import logging
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Dict, Optional, Any
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    Filter,
    FilterExpression,
    FilterExpressionList,
    OrderBy,
    RunReportRequest
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GA4AnalyticsClient:
    """
    A client class for interacting with Google Analytics 4 Reporting API.

    This class provides methods to establish connection, create requests,
    run paginated queries, and convert responses to pandas DataFrames.
    """

    MAX_ROWS_PER_REQUEST = 250000

    def __init__(
            self,
            credentials_path: Optional[str] = None,
            property_id: Optional[str] = None
    ):
        """
        Initialize the GA4 Analytics Client.

        Args:
            credentials_path: Path to service account credentials JSON file
            property_id: GA4 property ID
        """
        self.credentials_path = credentials_path or os.getenv('GA4_CREDENTIALS_PATH')
        self.property_id = property_id or os.getenv('GA4_PROPERTY_ID')
        self._client: Optional[BetaAnalyticsDataClient] = None

    @property
    def client(self) -> BetaAnalyticsDataClient:
        """
        Lazy initialization of the GA4 client.

        Returns:
            BetaAnalyticsDataClient: Authenticated client instance
        """
        if self._client is None:
            self._client = self._establish_connection()
        return self._client

    def _establish_connection(self) -> BetaAnalyticsDataClient:
        """
        Establish connection to GA4 API using service account credentials.

        Returns:
            BetaAnalyticsDataClient: Authenticated client

        Raises:
            RuntimeError: If connection establishment fails
        """
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path
            )
            client = BetaAnalyticsDataClient(credentials=credentials)
            logger.info("Successfully established connection to GA4 API")
            return client
        except Exception as e:
            logger.error(f"Failed to establish connection: {e}")
            raise RuntimeError(f"Failed to establish GA4 API connection: {e}")

    def _create_filter_expressions(self, dimensions_filter: Dict[str, Any]) -> List[FilterExpression]:
        """
        Create filter expressions based on dimension filters.

        Args:
            dimensions_filter: Dictionary mapping dimension names to filter values

        Returns:
            List of FilterExpression objects
        """
        filter_expressions = []

        for dimension, values in dimensions_filter.items():
            if isinstance(values, list):
                # Use "in list" filter for multiple values
                filter_expressions.append(
                    FilterExpression(
                        filter=Filter(
                            field_name=dimension,
                            in_list_filter=Filter.InListFilter(values=values)
                        )
                    )
                )
            elif isinstance(values, str):
                # Use "contains" filter for single string value
                filter_expressions.append(
                    FilterExpression(
                        filter=Filter(
                            field_name=dimension,
                            string_filter=Filter.StringFilter(
                                match_type=Filter.StringFilter.MatchType.CONTAINS,
                                value=values
                            )
                        )
                    )
                )

        return filter_expressions

    def _create_request(
            self,
            start_date: str,
            end_date: str,
            dimensions: Optional[List[str]] = None,
            metrics: Optional[List[str]] = None,
            dimensions_filter: Optional[Dict[str, Any]] = None,
            order_bys: Optional[List[str]] = None,
            offset: int = 0,
            limit: int = None
    ) -> RunReportRequest:
        """
        Create a RunReportRequest object.

        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format or 'today'
            dimensions: List of dimension names
            metrics: List of metric names
            dimensions_filter: Dictionary of dimension filters
            order_bys: List of dimensions/metrics to order by
            offset: Starting row offset
            limit: Maximum rows to return

        Returns:
            RunReportRequest object
        """
        dimensions = dimensions or []
        metrics = metrics or []
        limit = limit or self.MAX_ROWS_PER_REQUEST

        request_dict = {
            "property": f"properties/{self.property_id}",
            "date_ranges": [{"start_date": start_date, "end_date": end_date}],
            "dimensions": [{"name": dim} for dim in dimensions],
            "metrics": [{"name": metric} for metric in metrics],
            "keep_empty_rows": True,
            "offset": offset,
            "limit": limit
        }

        # Apply dimension filters if provided
        if dimensions_filter:
            request_dict["dimension_filter"] = FilterExpression(
                or_group=FilterExpressionList(
                    expressions=self._create_filter_expressions(dimensions_filter)
                )
            )

        # Apply ordering
        if not order_bys and dimensions:
            order_bys = dimensions  # Default to ordering by dimensions

        if order_bys:
            request_dict["order_bys"] = [
                OrderBy(dimension={"dimension_name": order_by})
                for order_by in order_bys
            ]

        return RunReportRequest(**request_dict)

    def _run_paginated_request(
            self,
            start_date: str,
            end_date: str,
            dimensions: Optional[List[str]] = None,
            metrics: Optional[List[str]] = None,
            dimensions_filter: Optional[Dict[str, Any]] = None,
            order_bys: Optional[List[str]] = None
    ) -> List[Any]:
        """
        Execute paginated requests to fetch all data.

        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format or 'today'
            dimensions: List of dimension names
            metrics: List of metric names
            dimensions_filter: Dictionary of dimension filters
            order_bys: List of dimensions/metrics to order by

        Returns:
            List of all rows from paginated requests
        """
        all_rows = []
        offset = 0

        logger.info(f"Starting paginated request for date range: {start_date} to {end_date}")

        while True:
            request = self._create_request(
                start_date=start_date,
                end_date=end_date,
                dimensions=dimensions,
                metrics=metrics,
                dimensions_filter=dimensions_filter,
                order_bys=order_bys,
                offset=offset,
                limit=self.MAX_ROWS_PER_REQUEST
            )

            try:
                response = self.client.run_report(request)

                if not response.rows:
                    logger.info(f"No more rows to fetch. Total rows collected: {len(all_rows)}")
                    break

                batch_size = len(response.rows)
                all_rows.extend(response.rows)
                offset += self.MAX_ROWS_PER_REQUEST

                logger.info(f"Fetched {batch_size} rows (offset: {offset - self.MAX_ROWS_PER_REQUEST})")

            except Exception as e:
                logger.error(f"Failed to run request at offset {offset}: {e}")
                raise RuntimeError(f"API request failed at offset {offset}: {e}")

        return all_rows

    def _convert_to_dataframe(
            self,
            all_data: List[Any],
            dimensions: List[str],
            metrics: List[str]
    ) -> pd.DataFrame:
        """
        Convert API response data to pandas DataFrame.

        Args:
            all_data: List of row data from API response
            dimensions: List of dimension names
            metrics: List of metric names

        Returns:
            pandas DataFrame with the data
        """
        try:
            data = []
            for row in all_data:
                row_dict = {}

                # Add dimension values
                for i, dimension in enumerate(dimensions):
                    row_dict[dimension] = row.dimension_values[i].value

                # Add metric values
                for i, metric in enumerate(metrics):
                    row_dict[metric] = row.metric_values[i].value

                data.append(row_dict)

            df = pd.DataFrame(data)
            logger.info(f"Successfully converted {len(df)} rows to DataFrame")
            return df

        except Exception as e:
            logger.error(f"Failed to convert response to DataFrame: {e}")
            raise RuntimeError(f"DataFrame conversion failed: {e}")

    def get_report(
            self,
            start_date: str,
            end_date: str,
            dimensions: Optional[List[str]] = None,
            metrics: Optional[List[str]] = None,
            dimensions_filter: Optional[Dict[str, Any]] = None,
            order_bys: Optional[List[str]] = None,
            convert_date_columns: bool = True
    ) -> pd.DataFrame:
        """
        Get a complete GA4 report as a pandas DataFrame.

        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format or 'today'
            dimensions: List of dimension names
            metrics: List of metric names
            dimensions_filter: Dictionary of dimension filters
            order_bys: List of dimensions/metrics to order by
            convert_date_columns: Whether to convert date columns to datetime

        Returns:
            pandas DataFrame with the report data
        """
        dimensions = dimensions or []
        metrics = metrics or []

        logger.info(f"Generating report with {len(dimensions)} dimensions and {len(metrics)} metrics")

        # Fetch all data using pagination
        all_data = self._run_paginated_request(
            start_date=start_date,
            end_date=end_date,
            dimensions=dimensions,
            metrics=metrics,
            dimensions_filter=dimensions_filter,
            order_bys=order_bys
        )

        # Convert to DataFrame
        df = self._convert_to_dataframe(all_data, dimensions, metrics)

        # Convert date columns if requested
        if convert_date_columns and 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], format='%Y%m%d')
            logger.info("Converted 'date' column to datetime format")

        return df

    def export_report(
            self,
            output_path: str,
            start_date: str,
            end_date: str,
            dimensions: Optional[List[str]] = None,
            metrics: Optional[List[str]] = None,
            dimensions_filter: Optional[Dict[str, Any]] = None,
            order_bys: Optional[List[str]] = None,
            convert_date_columns: bool = True
    ) -> None:
        """
        Generate and export a GA4 report to CSV.

        Args:
            output_path: Path where to save the CSV file
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format or 'today'
            dimensions: List of dimension names
            metrics: List of metric names
            dimensions_filter: Dictionary of dimension filters
            order_bys: List of dimensions/metrics to order by
            convert_date_columns: Whether to convert date columns to datetime
        """
        # Ensure output directory exists
        output_dir = Path(output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)

        # Get the report
        df = self.get_report(
            start_date=start_date,
            end_date=end_date,
            dimensions=dimensions,
            metrics=metrics,
            dimensions_filter=dimensions_filter,
            order_bys=order_bys,
            convert_date_columns=convert_date_columns
        )

        # Export to CSV
        df.to_csv(output_path, index=False)
        logger.info(f"Report exported to: {output_path}")


def main():
    try:
        # Initialize client
        client = GA4AnalyticsClient()

        # Define report parameters
        start_date = "2025-06-01"
        end_date = "yesterday"
        dimensions = ["date", "deviceCategory", "userGender"]
        metrics = ["sessions", "averageSessionDuration"]
        dimensions_filter = {}

        # Generate timestamp for output file
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        output_path = f"exports/{timestamp}/ga4_report.csv"

        # Export report
        client.export_report(
            output_path=output_path,
            start_date=start_date,
            end_date=end_date,
            dimensions=dimensions,
            metrics=metrics,
            dimensions_filter=dimensions_filter
        )

        logger.info("Report generation completed successfully")

    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise


if __name__ == "__main__":
    main()