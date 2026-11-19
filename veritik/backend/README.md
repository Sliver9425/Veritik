# Backend de Veritik (FastAPI + Playwright)

Servidor local que cumple el contrato que espera la app:

```
GET /profiles/{username}?videos=6
  200 → { followers, following, total_likes, video_count, videos[], comment_sample, fetched_at }
  404 → la cuenta no existe     403 → la cuenta es privada
  503 → captcha, bloqueo o TikTok no disponible     400 → usuario inválido
GET /health → { "status": "ok" }
```

## Requisitos
Python 3.11 o superior y **Google Chrome** instalado.

## Instalación
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Ejecutar
```powershell
uvicorn app:app --host 0.0.0.0 --port 8000
```
> En Windows **no uses `--reload`**: rompe Playwright.

Prueba rápida en el navegador del PC: `http://localhost:8000/health` y `http://localhost:8000/docs`.

## Dónde va esta carpeta
Dentro del proyecto de la app, en la raíz, al lado de `package.json`:
```
veritik/
├─ backend/        ← esta carpeta
├─ metro.config.js ← evita que Expo vigile backend/ (incluye venv/)
├─ package.json
└─ src/
```

## Conectar la app
1. Averigua la IP de tu PC en la red Wi-Fi (`ipconfig`, línea "Dirección IPv4").
2. En el proyecto de la app, copia `.env.example` como `.env` y escribe:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
   ```
   (usa tu IP; en el celular `localhost` no funciona).
3. Reinicia la app con `npx expo start -c`. En la pestaña **Perfil** debe decir "servidor de análisis".
4. Si Windows pregunta por el firewall al iniciar el servidor, permite el acceso en redes privadas.

## Cómo funciona
- Cada análisis abre una ventana de **Chrome** en el PC (con un perfil persistente guardado en tu carpeta de usuario, en `.veritik/`), lee los datos del perfil y escucha la lista de videos que la propia página pide.
- Si aparece un **captcha**, resuélvelo en esa ventana: el servidor espera hasta 90 s (`VERITIK_CAPTCHA_WAIT`). Una vez resuelto, TikTok suele recordarlo.
- Atiende **un análisis a la vez** (el perfil de Chrome no se puede abrir dos veces); los demás esperan.
- Un análisis tarda entre 15 y 40 segundos.

## Variables de entorno (opcionales)
| Variable | Valor por defecto | Para qué |
|---|---|---|
| `VERITIK_CAPTCHA_WAIT` | `90` | Segundos de espera para el captcha. |
| `VERITIK_PROFILE_DIR` | `~/.veritik/perfil_navegador` | Carpeta del perfil de Chrome (fuera del proyecto, a propósito). |
| `VERITIK_HEADLESS` | `false` | `true` oculta la ventana (TikTok bloquea más). |

## Pruebas
```powershell
python -m unittest -v test_mapper
```

## Limitaciones
- **No recolecta comentarios**: `comment_sample` va en `null` y la app calcula el puntaje con las demás señales.
- Depende de la estructura interna de TikTok, que cambia: si deja de funcionar, hay que revisar `scraper.py` y `mapper.py`.
- El scraping automatizado va contra los términos de uso de TikTok: úsalo solo con cuentas públicas, pocas consultas y fines académicos.
- Es un servidor para **desarrollo en tu PC**, sin autenticación: no lo expongas a internet.
