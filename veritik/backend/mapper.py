"""
Convierte los datos crudos de TikTok al formato que espera la app (ver HttpProfileRepository.ts).
Es código puro (sin red ni navegador), por eso se puede probar fácilmente.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


class ProfileNotFound(Exception):
    """El usuario no existe -> HTTP 404."""


class PrivateProfile(Exception):
    """La cuenta es privada -> HTTP 403."""


class ProfileUnavailable(Exception):
    """TikTok no respondió bien (captcha, bloqueo, datos incompletos) -> HTTP 503."""


def _non_negative_int(value: Any, field: str) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise ProfileUnavailable(f"Dato inválido o ausente: {field}") from None
    if number < 0:
        raise ProfileUnavailable(f"Dato negativo: {field}")
    return number


def _iso_utc(timestamp: Any) -> str:
    moment = datetime.fromtimestamp(int(timestamp), tz=timezone.utc)
    return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


def _map_video(item: dict[str, Any], username: str) -> dict[str, Any]:
    stats = item.get("stats") or {}
    video_id = str(item["id"])
    return {
        "id": video_id,
        "url": f"https://www.tiktok.com/@{username}/video/{video_id}",
        "published_at": _iso_utc(item["createTime"]),
        "views": _non_negative_int(stats.get("playCount", 0), "playCount"),
        "likes": _non_negative_int(stats.get("diggCount", 0), "diggCount"),
        "comments": _non_negative_int(stats.get("commentCount", 0), "commentCount"),
        "shares": _non_negative_int(stats.get("shareCount", 0), "shareCount"),
    }


def map_profile(raw: dict[str, Any], username: str, max_videos: int = 6, now: datetime | None = None) -> dict[str, Any]:
    """
    raw = {"user_detail": <webapp.user-detail de TikTok>, "items": [<videos de /api/post/item_list>]}
    Devuelve el JSON del contrato:
      followers, following, total_likes, video_count, videos[], comment_sample, fetched_at
    """
    detail = raw.get("user_detail") or {}
    info = detail.get("userInfo") or {}
    user = info.get("user")
    if not user:
        raise ProfileNotFound(f"No existe la cuenta @{username}")
    if user.get("privateAccount") is True:
        raise PrivateProfile(f"La cuenta @{username} es privada")

    stats = info.get("stats")
    if not isinstance(stats, dict):
        raise ProfileUnavailable("TikTok no devolvió las estadísticas del perfil")

    # Videos: los más recientes primero (ignora el orden de los fijados). Los datos incompletos se omiten.
    videos: list[dict[str, Any]] = []
    for item in sorted(raw.get("items") or [], key=lambda i: int(i.get("createTime") or 0), reverse=True):
        try:
            videos.append(_map_video(item, username))
        except (KeyError, TypeError, ValueError, ProfileUnavailable):
            continue
        if len(videos) >= max_videos:
            break

    moment = now or datetime.now(timezone.utc)
    return {
        "followers": _non_negative_int(stats.get("followerCount"), "followerCount"),
        "following": _non_negative_int(stats.get("followingCount"), "followingCount"),
        "total_likes": _non_negative_int(stats.get("heartCount"), "heartCount"),
        "video_count": _non_negative_int(stats.get("videoCount"), "videoCount"),
        "videos": videos,
        # Esta primera versión no recolecta comentarios (TikTok pide iniciar sesión tras un par de videos).
        # La app lo trata como "Sin datos" y recalcula el puntaje con las demás señales.
        "comment_sample": None,
        "fetched_at": moment.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
