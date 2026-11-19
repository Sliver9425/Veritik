"""
Obtiene los datos crudos de un perfil público de TikTok con Playwright + Google Chrome.
Usa la API síncrona (la misma técnica que ya funcionó en los scripts anteriores): se ejecuta en un hilo aparte
desde FastAPI. Un candado asegura que solo corra un análisis a la vez, porque el perfil de Chrome no se puede abrir dos veces.
"""
from __future__ import annotations

import json
import re
import threading
import time
from typing import Any

from playwright.sync_api import sync_playwright

from mapper import ProfileUnavailable

_LOCK = threading.Lock()
_SCRIPT_RE = re.compile(r'<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', re.S)


def _read_scope(page: Any) -> dict[str, Any] | None:
    """Lee el JSON incrustado en la página; None si aún no está completo o si hay un captcha."""
    try:
        match = _SCRIPT_RE.search(page.content())
        if match is None:
            return None
        return json.loads(match.group(1))["__DEFAULT_SCOPE__"]
    except Exception:  # página navegando, JSON cortado, etc.: se reintenta
        return None


def _wait_for_profile(page: Any, wait_seconds: int) -> dict[str, Any]:
    """Espera hasta que aparezcan los datos del perfil. Si sale un captcha, da tiempo a resolverlo en la ventana de Chrome."""
    deadline = time.monotonic() + wait_seconds
    while time.monotonic() < deadline:
        scope = _read_scope(page)
        if scope is not None and "webapp.user-detail" in scope:
            return scope
        time.sleep(1)
    raise ProfileUnavailable(
        "TikTok no mostró el perfil a tiempo (posible captcha). Resuélvelo en la ventana de Chrome y vuelve a intentar."
    )


def _collect_videos(page: Any, items: dict[str, dict[str, Any]], max_videos: int) -> None:
    time.sleep(2)
    for _ in range(6):
        if len(items) >= max_videos:
            return
        page.mouse.wheel(0, 3000)
        time.sleep(2.5)


def fetch_raw(username: str, max_videos: int, captcha_wait: int = 90, headless: bool = False,
              profile_dir: str = "perfil_navegador") -> dict[str, Any]:
    with _LOCK, sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir, channel="chrome", headless=headless, locale="es-ES",
        )
        try:
            page = context.pages[0] if context.pages else context.new_page()
            items: dict[str, dict[str, Any]] = {}

            def on_response(resp: Any) -> None:
                # La propia página pide la lista de videos con sus estadísticas; solo escuchamos esa respuesta.
                if "/api/post/item_list" not in resp.url or resp.status != 200:
                    return
                try:
                    for item in resp.json().get("itemList") or []:
                        items[str(item["id"])] = item
                except Exception:
                    pass

            page.on("response", on_response)
            page.goto(f"https://www.tiktok.com/@{username}", wait_until="domcontentloaded")

            detail = _wait_for_profile(page, captcha_wait)["webapp.user-detail"]
            user = (detail.get("userInfo") or {}).get("user") or {}
            if user and not user.get("privateAccount"):
                _collect_videos(page, items, max_videos)

            return {"user_detail": detail, "items": list(items.values())}
        finally:
            context.close()
