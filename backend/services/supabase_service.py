import os
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)

def _parse_uuid(uid_str: Optional[str]) -> Optional[str]:
    """Validates and formats UUID strings, returning None for guest/non-UUID strings."""
    if not uid_str:
        return None
    try:
        return str(uuid.UUID(str(uid_str).strip()))
    except (ValueError, TypeError, AttributeError):
        return None

class SupabaseService:
    """
    Official Supabase integration for SatQuery AI.
    Handles persistent application data:
      - Multi-tenant User Authentication verification
      - Structured Analysis Records & History (`analyses` table)
      - Change Polygon vectors & detailed metrics (`analysis_results` table)
      - User Profiles and Application Settings (`profiles` table)
      - Persistent Storage for Satellite Image Uploads (`uploaded_imagery` table)
    
    Provides graceful degradation when Supabase credentials are not configured or offline.
    """

    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = (
            settings.SUPABASE_SECRET_KEY or 
            settings.SUPABASE_SERVICE_ROLE_KEY or 
            settings.SUPABASE_PUBLISHABLE_KEY or 
            settings.SUPABASE_ANON_KEY
        )
        self._client = None
        self._init_client()

    def _init_client(self):
        if not self.supabase_url or not self.supabase_key or "your-project" in self.supabase_url:
            logger.info("Supabase credentials not configured. Running in local persistence fallback mode.")
            self._client = None
            return

        try:
            from supabase import create_client, Client
            self._client: Client = create_client(self.supabase_url, self.supabase_key)
            logger.info(f"Initialized Supabase client targeting {self.supabase_url}")
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}")
            self._client = None

    def check_connection(self) -> Dict[str, Any]:
        """
        Checks connectivity to Supabase.
        """
        if not self._client:
            return {
                "connected": False,
                "configured": bool(self.supabase_url and self.supabase_key),
                "url": self.supabase_url or None,
                "mode": "local_fallback",
                "message": "Supabase credentials not active. System operates with local session storage."
            }

        try:
            # Simple ping by querying analyses table limit 1
            res = self._client.table("analyses").select("id").limit(1).execute()
            return {
                "connected": True,
                "configured": True,
                "url": self.supabase_url,
                "mode": "online",
                "message": "Supabase application database is online and connected."
            }
        except Exception as e:
            err_str = str(e)
            if "PGRST205" in err_str:
                return {
                    "connected": True,
                    "configured": True,
                    "url": self.supabase_url,
                    "mode": "schema_pending",
                    "message": "Supabase credentials valid and connected. Database tables pending: execute backend/database/schema.sql in Supabase SQL Editor."
                }
            return {
                "connected": False,
                "configured": True,
                "url": self.supabase_url,
                "mode": "offline",
                "message": f"Supabase service unreachable: {e}"
            }

    async def save_analysis(
        self,
        analysis_context: Any,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Persists a completed satellite analysis into the Supabase `analyses` and `analysis_results` tables.
        """
        if not self._client:
            return {"status": "local_only", "analysis_id": analysis_context.analysis_id}

        try:
            ctx = analysis_context
            loc = ctx.location
            ai = ctx.ai_summary

            analysis_row = {
                "id": ctx.analysis_id,
                "user_id": _parse_uuid(user_id),
                "query": ctx.query,
                "location_name": loc.name if loc else "Unknown",
                "country": getattr(loc, "country", None),
                "latitude": getattr(loc, "latitude", None),
                "longitude": getattr(loc, "longitude", None),
                "bounding_box": loc.bounding_box if loc else None,
                "start_date": ctx.requested_start_date,
                "end_date": ctx.requested_end_date,
                "actual_before_date": ctx.actual_before_date,
                "actual_after_date": ctx.actual_after_date,
                "total_aoi_ha": ctx.total_aoi_hectares,
                "total_changed_ha": ctx.total_changed_hectares,
                "percent_aoi_changed": ctx.percent_aoi_changed,
                "confidence_score": ctx.confidence.overall_score if ctx.confidence else None,
                "confidence_level": getattr(ctx.confidence, "rating", getattr(ctx.confidence, "confidence_level", None)) if ctx.confidence else None,
                "headline": ai.headline if ai else "",
                "summary_markdown": ai.simple_markdown if ai else "",
                "observed": ai.observed if ai else "",
                "evidence": ai.evidence if ai else "",
                "interpretation": ai.interpretation if ai else "",
                "limitations": ai.limitations if ai else "",
                "created_at": datetime.utcnow().isoformat() + "Z"
            }

            self._client.table("analyses").upsert(analysis_row).execute()

            # Save detailed change polygons & transitions
            results_row = {
                "analysis_id": ctx.analysis_id,
                "land_cover_stats": [s.dict() for s in (ctx.land_cover_stats or [])],
                "transitions": [t.dict() for t in (ctx.transitions or [])],
                "indices_summary": ctx.indices_summary or {},
                "change_regions": [r.dict() for r in (ctx.change_regions or [])],
                "timeline": [item.dict() for item in (ctx.timeline or [])],
                "created_at": datetime.utcnow().isoformat() + "Z"
            }

            self._client.table("analysis_results").insert(results_row).execute()
            logger.info(f"Successfully persisted analysis [{ctx.analysis_id}] to Supabase")
            return {"status": "saved", "analysis_id": ctx.analysis_id}
        except Exception as e:
            logger.warning(f"Failed to persist analysis to Supabase: {e}")
            return {"status": "failed", "error": str(e)}

    async def get_user_history(
        self,
        user_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Retrieves the structured analysis history for a given user from Supabase.
        """
        if not self._client:
            return []

        try:
            query = self._client.table("analyses").select(
                "id, query, location_name, total_aoi_ha, total_changed_ha, percent_aoi_changed, confidence_score, headline, created_at, actual_before_date, actual_after_date"
            ).order("created_at", desc=True).limit(limit)

            parsed_uid = _parse_uuid(user_id)
            if parsed_uid:
                query = query.eq("user_id", parsed_uid)

            res = query.execute()
            return res.data or []
        except Exception as e:
            logger.warning(f"Failed to query user history from Supabase: {e}")
            return []

    async def get_analysis_by_id(
        self,
        analysis_id: str,
        user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Fetches an individual analysis and its corresponding result record.
        """
        if not self._client:
            return None

        try:
            q = self._client.table("analyses").select("*").eq("id", analysis_id)
            parsed_uid = _parse_uuid(user_id)
            if parsed_uid:
                q = q.eq("user_id", parsed_uid)
            res = q.execute()

            if not res.data:
                return None

            analysis_data = res.data[0]
            # Fetch attached results
            res_detail = self._client.table("analysis_results").select("*").eq("analysis_id", analysis_id).execute()
            if res_detail.data:
                analysis_data["results"] = res_detail.data[0]

            return analysis_data
        except Exception as e:
            logger.warning(f"Failed to retrieve analysis from Supabase: {e}")
            return None

    async def save_uploaded_imagery(
        self,
        file_id: str,
        filename: str,
        storage_path: str,
        size_bytes: int,
        mime_type: str,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Tracks uploaded satellite imagery files.
        """
        if not self._client:
            return {"status": "local_only", "file_id": file_id}

        try:
            row = {
                "id": file_id,
                "user_id": _parse_uuid(user_id),
                "filename": filename,
                "storage_path": storage_path,
                "file_size_bytes": size_bytes,
                "mime_type": mime_type,
                "analysis_metadata": metadata or {},
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            # Insert into uploaded_imagery (with fallback to uploaded_files)
            try:
                self._client.table("uploaded_imagery").insert(row).execute()
            except Exception:
                self._client.table("uploaded_files").insert(row).execute()

            return {"status": "saved", "file_id": file_id}
        except Exception as e:
            logger.warning(f"Failed to track uploaded imagery in Supabase: {e}")
            return {"status": "failed", "error": str(e)}

    # Alias for uploaded_files terminology
    save_uploaded_file = save_uploaded_imagery

    async def upload_file_to_storage(
        self,
        bucket_name: str,
        file_path: str,
        file_bytes: bytes,
        content_type: str = "image/png"
    ) -> Dict[str, Any]:
        """
        Uploads raw or processed satellite imagery bytes to Supabase Storage.
        """
        if not self._client:
            return {"status": "local_only", "storage_path": file_path, "url": None}

        try:
            res = self._client.storage.from_(bucket_name).upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            public_url = self.get_file_public_url(bucket_name, file_path)
            return {"status": "uploaded", "storage_path": file_path, "public_url": public_url}
        except Exception as e:
            logger.warning(f"Supabase Storage upload failed: {e}")
            return {"status": "failed", "error": str(e)}

    def get_file_public_url(self, bucket_name: str, file_path: str) -> Optional[str]:
        """
        Generates public URL for an asset stored in a Supabase Storage bucket.
        """
        if not self._client:
            return None
        try:
            return self._client.storage.from_(bucket_name).get_public_url(file_path)
        except Exception as e:
            logger.warning(f"Error getting public URL from Supabase Storage: {e}")
            return None

    def get_file_signed_url(self, bucket_name: str, file_path: str, expires_in: int = 3600) -> Optional[str]:
        """
        Generates time-limited signed URL for private satellite assets.
        """
        if not self._client:
            return None
        try:
            res = self._client.storage.from_(bucket_name).create_signed_url(file_path, expires_in)
            if isinstance(res, dict) and "signedURL" in res:
                return res["signedURL"]
            return getattr(res, "signed_url", None)
        except Exception as e:
            logger.warning(f"Error creating signed URL: {e}")
            return None

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves user profile from Supabase profiles table.
        """
        if not self._client:
            return None
        try:
            res = self._client.table("profiles").select("*").eq("id", user_id).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            logger.warning(f"Error fetching profile for user {user_id}: {e}")
            return None

    async def upsert_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upserts user profile data in Supabase.
        """
        if not self._client:
            return {"status": "local_only", "user_id": user_id}
        try:
            payload = {**profile_data, "id": user_id, "updated_at": datetime.utcnow().isoformat() + "Z"}
            self._client.table("profiles").upsert(payload).execute()
            return {"status": "saved", "user_id": user_id}
        except Exception as e:
            logger.warning(f"Error updating profile for user {user_id}: {e}")
            return {"status": "failed", "error": str(e)}

    async def get_user_settings(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves application settings for a user.
        """
        if not self._client:
            return None
        try:
            res = self._client.table("user_settings").select("*").eq("user_id", user_id).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            logger.warning(f"Error fetching settings for user {user_id}: {e}")
            return None

    async def upsert_user_settings(self, user_id: str, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upserts user settings in Supabase.
        """
        if not self._client:
            return {"status": "local_only", "user_id": user_id}
        try:
            payload = {**settings_data, "user_id": user_id, "updated_at": datetime.utcnow().isoformat() + "Z"}
            self._client.table("user_settings").upsert(payload).execute()
            return {"status": "saved", "user_id": user_id}
        except Exception as e:
            logger.warning(f"Error updating settings for user {user_id}: {e}")
            return {"status": "failed", "error": str(e)}


supabase_service = SupabaseService()

