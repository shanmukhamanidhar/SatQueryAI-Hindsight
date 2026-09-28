#!/usr/bin/env python3
"""
SatQuery AI — Supabase Database Migration & Schema Provisioner
Applies schema.sql to the configured Supabase PostgreSQL database.
Supports both direct DATABASE_URL connection string and Supabase Client verification.
"""

import os
import sys
import logging
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("migration")

def get_schema_sql() -> str:
    schema_path = Path(__file__).resolve().parent / "schema.sql"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found at {schema_path}")
    return schema_path.read_text(encoding="utf-8")

def apply_via_postgres_connection(db_url: str):
    logger.info(f"Connecting to PostgreSQL database at {db_url.split('@')[-1] if '@' in db_url else 'specified host'}...")
    try:
        import psycopg2
    except ImportError:
        try:
            import psycopg
            psycopg2 = psycopg
        except ImportError:
            logger.error("Neither 'psycopg2' nor 'psycopg' is installed. Please install psycopg2-binary: pip install psycopg2-binary")
            return False

    schema_sql = get_schema_sql()
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        logger.info("Executing schema.sql DDL statements...")
        cursor.execute(schema_sql)
        cursor.close()
        conn.close()
        logger.info("Successfully applied schema migrations to Supabase database!")
        return True
    except Exception as e:
        logger.error(f"Error applying migrations via PostgreSQL connection: {e}")
        return False

def verify_tables_via_client():
    from services.supabase_service import supabase_service
    status = supabase_service.check_connection()
    logger.info(f"Supabase connection status: {status}")
    if status.get("connected"):
        logger.info("Supabase client is connected and ready to persist data.")
        return True
    else:
        logger.info("Supabase credentials not yet active or pointing to placeholder.")
        return False

def main():
    print("=" * 70)
    print(" SatQuery AI — Supabase Database Migration Provisioner")
    print("=" * 70)

    db_url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    if db_url:
        success = apply_via_postgres_connection(db_url)
        if success:
            print("\nDatabase migration completed successfully.")
            return 0
        else:
            print("\nMigration failed via direct PostgreSQL connection.")
            return 1
    else:
        print("\n[NOTE] No DATABASE_URL or SUPABASE_DB_URL environment variable provided.")
        print("To apply migrations automatically:")
        print("  1. Copy your database connection string from Supabase Dashboard > Project Settings > Database")
        print("  2. Run: python backend/database/apply_migrations.py (with DATABASE_URL in environment)")
        print("\nOr apply directly in Supabase Dashboard:")
        print("  1. Open your Supabase Dashboard -> SQL Editor")
        print("  2. Paste the contents of backend/database/schema.sql")
        print("  3. Click 'Run'")
        print("\nVerifying current Supabase REST connectivity:")
        verify_tables_via_client()
        return 0

if __name__ == "__main__":
    sys.exit(main())
