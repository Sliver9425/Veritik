import unittest
from datetime import datetime, timezone

from mapper import PrivateProfile, ProfileNotFound, ProfileUnavailable, map_profile

NOW = datetime(2026, 11, 15, 12, 0, 0, tzinfo=timezone.utc)


def user_detail(**overrides):
    info = {
        "user": {"uniqueId": "creadora.demo", "privateAccount": False},
        "stats": {"followerCount": 48200, "followingCount": 300, "heartCount": 900000, "videoCount": 120},
    }
    info.update(overrides)
    return {"userInfo": info}


def item(video_id, create_time, views=1000, likes=50, comments=5, shares=2):
    return {"id": video_id, "createTime": create_time,
            "stats": {"playCount": views, "diggCount": likes, "commentCount": comments, "shareCount": shares}}


class MapProfileTests(unittest.TestCase):
    def test_mapea_el_perfil_al_contrato(self):
        raw = {"user_detail": user_detail(), "items": [item("1", 1762940000)]}
        out = map_profile(raw, "creadora.demo", now=NOW)
        self.assertEqual(out["followers"], 48200)
        self.assertEqual(out["following"], 300)
        self.assertEqual(out["total_likes"], 900000)
        self.assertEqual(out["video_count"], 120)
        self.assertIsNone(out["comment_sample"])
        self.assertEqual(out["fetched_at"], "2026-11-15T12:00:00Z")
        self.assertEqual(out["videos"][0], {
            "id": "1", "url": "https://www.tiktok.com/@creadora.demo/video/1",
            "published_at": "2025-11-12T09:33:20Z", "views": 1000, "likes": 50, "comments": 5, "shares": 2,
        })

    def test_ordena_por_fecha_ignorando_fijados_y_respeta_el_limite(self):
        raw = {"user_detail": user_detail(), "items": [
            item("fijado-viejo", 1000), item("nuevo", 3000), item("medio", 2000), item("otro", 1500)]}
        out = map_profile(raw, "creadora.demo", max_videos=2, now=NOW)
        self.assertEqual([v["id"] for v in out["videos"]], ["nuevo", "medio"])

    def test_omite_videos_incompletos(self):
        raw = {"user_detail": user_detail(), "items": [{"id": "sin-fecha"}, {"createTime": 5}, item("ok", 10)]}
        out = map_profile(raw, "creadora.demo", now=NOW)
        self.assertEqual([v["id"] for v in out["videos"]], ["ok"])

    def test_cuenta_sin_videos_es_valida(self):
        out = map_profile({"user_detail": user_detail(), "items": []}, "creadora.demo", now=NOW)
        self.assertEqual(out["videos"], [])

    def test_usuario_inexistente(self):
        for raw in ({}, {"user_detail": {}}, {"user_detail": {"userInfo": {}}}):
            with self.assertRaises(ProfileNotFound):
                map_profile(raw, "nadie")

    def test_cuenta_privada(self):
        detail = user_detail(user={"uniqueId": "x", "privateAccount": True})
        with self.assertRaises(PrivateProfile):
            map_profile({"user_detail": detail, "items": []}, "x")

    def test_estadisticas_ausentes_o_invalidas(self):
        with self.assertRaises(ProfileUnavailable):
            map_profile({"user_detail": user_detail(stats=None)}, "x")
        with self.assertRaises(ProfileUnavailable):
            map_profile({"user_detail": user_detail(stats={"followerCount": "muchos"})}, "x")
        with self.assertRaises(ProfileUnavailable):
            map_profile({"user_detail": user_detail(stats={"followerCount": -1, "followingCount": 0, "heartCount": 0, "videoCount": 0})}, "x")


if __name__ == "__main__":
    unittest.main()
