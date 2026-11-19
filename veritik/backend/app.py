"""
Backend de Veritik. Expone el contrato que espera la app:  GET /profiles/{username}
  200 -> JSON del perfil   404 -> no existe   403 -> privada   503 -> bloqueo/captcha/no disponible

Ejecutar (SIN --reload en Windows):   uvicorn app:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import asyncio
import logging
import os
import re
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query

from mapper import PrivateProfile, ProfileNotFound, ProfileUnavailable, map_profile
from scraper import fetch_raw

logger = logging.getLogger("veritik")

CAPTCHA_WAIT = int(os.getenv("VERITIK_CAPTCHA_WAIT", "90"))
# Por defecto FUERA del proyecto (carpeta del usuario): así Metro/Expo no vigila los miles de archivos de Chrome.
PROFILE_DIR = os.getenv("VERITIK_PROFILE_DIR", str(Path.home() / ".veritik" / "perfil_navegador"))
HEADLESS = os.getenv("VERITIK_HEADLESS", "false").lower() == "true"
_USERNAME = re.compile(r"^[a-z0-9_.]{2,24}$")

app = FastAPI(title="Veritik backend", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/profiles/{username}")
async def get_profile(username: str, videos: int = Query(6, ge=1, le=12)) -> dict:
    handle = username.strip().lstrip("@").lower()
    if not _USERNAME.fullmatch(handle) or handle.endswith("."):
        raise HTTPException(status_code=400, detail="Usuario inválido")

    try:
        # Playwright (API síncrona) corre en un hilo aparte para no bloquear el servidor.
        raw = await asyncio.to_thread(fetch_raw, handle, videos, CAPTCHA_WAIT, HEADLESS, PROFILE_DIR)
        return map_profile(raw, handle, max_videos=videos)
    except ProfileNotFound as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except PrivateProfile as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    except ProfileUnavailable as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:  # Chrome no instalado, fallo de Playwright, etc.
        logger.exception("Error inesperado al analizar @%s", handle)
        raise HTTPException(status_code=503, detail="No se pudo consultar TikTok en este momento") from error
