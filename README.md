# 🛡️ Veritik

**Analiza perfiles públicos de TikTok y descubre si su audiencia y su interacción se ven auténticas, en menos de un minuto.**

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Arquitectura](https://img.shields.io/badge/Arquitectura-DDD_%2B_Hexagonal-7C5CFF)
![Pruebas](https://img.shields.io/badge/Pruebas-63_con_Vitest-6E9F18?logo=vitest&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-Demo_acad%C3%A9mica-FFB020)
![Modelo](https://img.shields.io/badge/Modelo-Freemium-2EE6A6)

---
## 👥 Integrantes del equipo


| Integrante 
|---|
| Erick Bonilla |
| Diego Lema |
| Damián Quezada  |
| Carolina Vasco| 

## 📖 Descripción

**Veritik** es una aplicación móvil freemium pensada para dueños de pequeños negocios y community managers que contratan creadores de contenido y quieren saber si la audiencia de una cuenta es coherente antes de pagar.

La persona escribe un `@usuario` y la app calcula un **puntaje de autenticidad de 0 a 100** a partir de seis señales públicas, con el detalle de cada una y una explicación de cómo se calcula.

> ⚠️ Veritik entrega **estimaciones, no acusaciones**. Nunca afirma que una cuenta "es falsa": habla de señales y de niveles de autenticidad.

### ✨ Funciones

| Función | Descripción |
|---|---|
| 🔍 **Análisis de cuentas** | Puntaje de 0 a 100 con nivel alto, medio o bajo. |
| 📊 **Detalle de señales** | Seis señales con su valor, su estado (Bien, Atención, Riesgo) y una hoja explicativa de "¿Cómo se calcula?". |
| ⚖️ **Comparador** | Dos análisis lado a lado, también útil para ver la evolución de una misma cuenta. |
| 🕘 **Historial** | Los últimos 50 análisis guardados en el dispositivo. |
| 🎯 **Medidor animado** | Medidor circular y bottom sheet animados (respetan "reducir movimiento"). |
| 👋 **Onboarding** | Introducción de 3 pasos, solo la primera vez. |
| 💎 **Freemium** | 3 análisis gratis al mes; el plan premium se simula con un interruptor de pruebas en la pestaña Perfil. |

**Las seis señales:** engagement real, vistas frente a seguidores, calidad de comentarios, relación seguidores/seguidos, frecuencia de publicación y saltos de seguidores.

---

## 🏗️ Metodología y arquitectura

Veritik se construyó de forma **iterativa e incremental**, con una separación estricta de responsabilidades.

### Domain-Driven Design (DDD)
El núcleo del negocio vive en `domain/`, sin dependencias de React ni de librerías externas:

- **Entidades:** `Profile`, `VideoStats`, `Signal`, `AnalysisResult`.
- **Value objects:** `Username`, `AuthenticityScore`, `SignalStatus`, `CommentSample`.
- **Servicio de dominio:** `compareAnalyses`.
- **Contratos de repositorios:** interfaces puras.
- **Errores tipados:** cada uno con un `code` estable que la interfaz traduce a un mensaje.

### Arquitectura hexagonal (puertos y adaptadores)
Las dependencias apuntan siempre hacia adentro:

```
presentation  →  application  →  domain
      ↓               ↓
infrastructure ───────┘   (implementa los contratos del dominio y los puertos de aplicación)
```

| Capa | Responsabilidad | ¿Usa React Native? |
|---|---|---|
| `domain/` | Reglas de negocio, entidades, contratos. | ❌ No |
| `application/` | Casos de uso, calculador de señales, política freemium, DTOs y puertos (`Clock`, `IdGenerator`). | ❌ No |
| `infrastructure/` | Adaptadores: AsyncStorage, cliente HTTP, repositorios de datos de ejemplo y de datos guardados, reloj, generador de ids. | Solo `AsyncStorageAdapter` |
| `presentation/` | Pantallas, componentes, navegación, tema y estado. | ✅ Sí |

**Casos de uso:** analizar perfil, consultar historial, ver detalle de un análisis, consultar la cuota gratuita, comparar análisis y gestionar el estado de la bienvenida.

### Inyección de dependencias
Los casos de uso reciben sus repositorios y puertos por constructor. El ensamblado se hace a mano en una raíz de composición (`infrastructure/di/container.ts`), que no conoce React Native; por eso toda la lógica se puede probar en Node. La configuración real de la app (`appContainer.ts`) elige entre el repositorio de ejemplo y el cliente HTTP según la variable `EXPO_PUBLIC_API_URL`.

### Diseño atómico y tokens de diseño
Los componentes se organizan en `atoms/` (`Button`, `Card`, `Chip`, `Screen`) y `molecules/` (`ScoreGauge`, `BottomSheet`, `BackHeader`, `HistoryPickerSheet`). Colores, tipografía, espaciado, radios y duraciones de animación están centralizados en `presentation/theme/`.

### Calidad
- 🧪 **63 pruebas automatizadas con Vitest** (más de 50): unitarias y de integración, con repositorios falsos en memoria. Cubren dominio, casos de uso, persistencia, cliente HTTP, datos de ejemplo y reales, y el contenedor de dependencias (detalle en el manual, sección 7).
- 🐍 **7 pruebas del backend** con `unittest` (mapeo de datos de TikTok al contrato de la app).
- 🔒 **TypeScript estricto**: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals` y `noUnusedParameters`.
- ♿ **Accesibilidad**: contraste WCAG AA, áreas táctiles de 44 pt o más, estados que no dependen solo del color y etiquetas para lectores de pantalla.
- 🔐 **Privacidad desde el diseño**: solo datos públicos; de los comentarios se guardan únicamente conteos, sin texto ni nombres de usuario.

### Estructura del proyecto

```
veritik/
├─ App.tsx
├─ .env.example
├─ metro.config.js           Evita que Expo vigile la carpeta backend/
├─ backend/                  Servidor OPCIONAL (FastAPI + Playwright) que sirve datos reales
├─ scripts/                  Laboratorio para probar el calculador con datos reales
└─ src/
   ├─ domain/                Entidades, value objects, servicios y contratos
   ├─ application/           Casos de uso, calculador de señales, políticas, puertos
   ├─ infrastructure/        Persistencia, cliente HTTP, datos de ejemplo y guardados, DI
   └─ presentation/
      ├─ components/         atoms/ · molecules/
      ├─ screens/            Onboarding, Inicio, Análisis, Resultado, Detalle, Comparar, Historial, Perfil
      ├─ navigation/         Pila principal y pestañas
      ├─ theme/              Tokens de diseño
      ├─ content/            Textos y formatos
      ├─ hooks/ · store/
      └─ composition.ts      Único punto donde la UI toca la infraestructura
```

---

## 🧰 Stack tecnológico

### 📱 Frontend móvil (esta aplicación)

| Tecnología | Uso |
|---|---|
| **React Native** | Interfaz móvil multiplataforma. |
| **Expo** (SDK, Expo Go) | Entorno de desarrollo y ejecución en el celular. |
| **React** | Hooks para estado local y efectos. |
| **TypeScript** | Lenguaje de todo el proyecto, en modo estricto. |
| **React Navigation** (`native`, `native-stack`, `bottom-tabs`) | Pila principal y 4 pestañas inferiores. |
| `react-native-screens`, `react-native-safe-area-context` | Dependencias de la navegación y manejo de zonas seguras. |
| **React Native Reanimated** | Medidor circular y bottom sheet animados. |
| **react-native-svg** | Dibujo del arco del medidor. |
| **Zustand** | Estado de sesión (plan premium de prueba). |
| `@react-native-async-storage/async-storage` | Historial, contador mensual y bandera de bienvenida. |
| `expo-font` + `@expo-google-fonts/inter` | Tipografía Inter. |
| `expo-status-bar` | Barra de estado. |
| `@expo/vector-icons` (Ionicons) | Íconos de pestañas y botones. |
| `react-native-gesture-handler` | Instalada; sin uso directo en el código actual. |
| **Vitest** | Ejecución de las pruebas. |
| `tsx`, `@types/node` | Script de laboratorio en `scripts/`. |

### 🐍 Backend opcional y análisis de contenido (Python)

> Estas herramientas **no forman parte de la app móvil** ni son necesarias para ejecutarla. El backend (`backend/`) es opcional; los modelos de NLP viven en un script de Python aparte.

| Tecnología | Uso |
|---|---|
| **FastAPI** + **Uvicorn** | Servidor opcional (`backend/`) que expone `GET /profiles/{usuario}` a la app. |
| **Playwright** (con Google Chrome) | Navegación y captura de datos públicos de TikTok. |
| **BeautifulSoup4** y **requests** | Versión híbrida y versión comparativa (esta última, bloqueada por TikTok). |
| **yt-dlp** (+ `curl-cffi`) y **ffmpeg** | Descarga y procesamiento de audio. |
| **Hugging Face Transformers** + **PyTorch** | Ejecución de los modelos. |
| `openai/whisper-small` | Transcripción de audio en español. |
| `Helsinki-NLP/opus-mt-es-en` | Traducción español-inglés. |
| `Minej/bert-base-personality` | Estimación exploratoria de Big Five. |
| `pysentimiento` (RoBERTuito) | Sentimiento y emociones en español. |
| `sentencepiece`, `sacremoses` | Soporte de tokenización. |

---

## ⚠️ Aclaraciones importantes (lo que NO incluye)

- 🔌 **El backend es opcional y no viene activado.** Por defecto la app funciona con **datos de ejemplo** generados por `MockProfileRepository` (perfiles inventados, estables para cada usuario) y con los **datos guardados de una cuenta pública** (`calla.nomas`) exportados con el scraper, para mostrar un caso real. En `backend/` hay un servidor (FastAPI + Playwright) que, al ejecutarlo en tu PC y definir `EXPO_PUBLIC_API_URL`, sirve datos reales de TikTok. **No está desplegado en internet, no tiene autenticación, no recolecta comentarios** y puede dejar de funcionar si TikTok cambia su estructura.
- 🚫 **No usa SQLite.** Toda la persistencia local es con **AsyncStorage**.
- 🚫 **Los modelos de NLP no están en la app.** Whisper, la traducción, el sentimiento y el Big Five forman parte de un **script de Python separado**. El Big Five se excluyó del producto por no ser fiable con textos cortos.
- 🚫 **Los pesos y umbrales del puntaje son hipótesis** sin calibrar con cuentas reales. Las cifras son orientativas.
- 🚫 **El plan premium es una simulación** (interruptor en Perfil); no hay pagos ni pantalla de suscripción.
- ⚖️ Los términos de uso de TikTok restringen el scraping automatizado. Este proyecto es **académico**; un producto real debería usar APIs oficiales o datos de un proveedor autorizado y revisar la normativa de protección de datos personales aplicable.

---

## 🚀 Manual de configuración local

Sigue estos pasos en orden. No necesitas cuentas ni claves.

### 1️⃣ Prerrequisitos

| Qué | Cómo comprobarlo |
|---|---|
| **Node.js 22 o superior** | Abre una terminal y ejecuta `node -v`. Debe mostrar `v22` o un número mayor; con Node 20 ni Expo ni las pruebas arrancan. Si no, instala la versión LTS desde [nodejs.org](https://nodejs.org). |
| **Git** | Ejecuta `git --version`. Si no, instálalo desde [git-scm.com](https://git-scm.com). |
| **Expo Go** en tu celular | Descárgala gratis desde App Store (iPhone) o Google Play (Android). |
| **Misma red Wi-Fi** | El celular y el computador deben estar conectados a la misma red. |
| **Python 3.11+ y Google Chrome** | *Solo si usas el backend opcional* (ver el final de este manual). |

### 2️⃣ Clonar el repositorio

```bash
git clone https://github.com/Sliver9425/Veritik.git
cd Veritik/veritik
```

> El repositorio se clona en la carpeta `Veritik` y la app está dentro, en `veritik/`. Todos los comandos siguientes se ejecutan desde `Veritik/veritik`.

### 3️⃣ Instalar dependencias

El proyecto ya incluye su `package.json`, así que basta con:

```bash
npm install
```

Espera a que termine y vuelva a aparecer la línea de comandos. Puede tardar unos minutos.

### 4️⃣ Levantar el servidor de desarrollo

```bash
npx expo start
```

Aparecerá un **código QR** en la terminal.

### 5️⃣ Abrir la app

- 📱 **Android:** abre Expo Go y toca *Scan QR code*.
- 📱 **iPhone:** abre la cámara y apunta al código QR; te llevará a Expo Go.
- 💻 **Navegador:** presiona `w` en la terminal o inicia directamente con `npx expo start --web`. En pantallas grandes la app se muestra con el ancho de un teléfono, centrada, y en la vista móvil del navegador (Inspeccionar → modo dispositivo) se ve igual que en el celular.
- 🤖 Presiona `a` / `i` si tienes un emulador de Android o iOS.

La primera carga tarda un poco mientras se compila el código.

### 6️⃣ Qué probar

La app usa datos de ejemplo. Según el nombre de usuario que escribas obtendrás distintos resultados:

| Escribe | Resultado |
|---|---|
| `calla.nomas` | **Datos reales guardados** de una cuenta pública (puntaje alto). |
| `creadora.demo` (o cualquier otro nombre) | Puntaje **alto** (datos inventados). |
| `medio.demo` o un nombre con `mixta` | Puntaje **medio**. |
| `fake.demo` o un nombre con `falsa` o `inflad` | Puntaje **bajo**. |
| `cuenta.privada` | Error de cuenta privada. |
| `noexiste.uno` | Error de cuenta no encontrada. |
| `cuenta.bloqueada` | Error de cuenta no disponible. |

Recorrido sugerido: analiza dos cuentas distintas, toca cada señal del detalle, luego ve a **Comparar** y elige ambas. En la pestaña **Perfil** puedes activar el plan premium de prueba o reiniciar el historial y el contador.

### 7️⃣ Ejecutar las pruebas (opcional)

Las pruebas usan **Vitest** y **no necesitan celular, emulador ni internet**.

```bash
npx vitest run
```

Deben pasar las **63 pruebas**. También puedes comprobar los tipos de TypeScript, que deben terminar sin errores:

```bash
npm run typecheck
```

#### 🔧 Comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm test` | Atajo de `npx vitest run`. |
| `npm run typecheck` | Comprueba los tipos con `tsc --noEmit` (debe terminar sin errores). |
| `npx vitest run` | Ejecuta todas las pruebas una vez. |
| `npx vitest` | Modo observador: vuelve a ejecutar las pruebas cada vez que guardas un archivo. |
| `npx vitest run --reporter=verbose` | Muestra el nombre de cada prueba y si pasó. |
| `npx vitest run src/domain` | Solo una capa (`src/domain`, `src/application` o `src/infrastructure`). |
| `npx vitest run src/infrastructure/__tests__/fixtures.test.ts` | Un archivo concreto. |
| `npx vitest run -t "cuota"` | Solo las pruebas cuyo nombre contiene ese texto. |

#### 🧪 Qué se prueba

Las pruebas verifican **reglas y flujos**, no pantallas. Se ejecutan con repositorios falsos en memoria, un reloj fijo y un generador de ids predecible, así que dan siempre el mismo resultado.

| Capa | Pruebas | Qué verifican (en general) |
|---|---|---|
| **Dominio** | 18 | Validación del usuario de TikTok, rechazo de métricas inválidas, métricas derivadas del perfil, puntaje ponderado (se recalcula cuando falta una señal), niveles alto/medio/bajo y comparación justa entre dos cuentas. |
| **Aplicación** | 16 | Flujo completo de analizar una cuenta (validar, revisar cuota, obtener, calcular, guardar), cuota gratuita y plan premium, que un error no gaste cuota, historial, detalle, comparación y estado de la bienvenida. |
| **Infraestructura** | 29 | Persistencia (guardar y leer, orden, límite, registros dañados, contador por mes), cliente HTTP (URL, códigos de error, sin conexión, respuesta inválida), datos de ejemplo y reales guardados, y el contenedor de dependencias funcionando de punta a punta. |

**Lo que no cubren:** las pantallas, la navegación, las animaciones y el scraping contra TikTok real. Eso se prueba ejecutando la app en Expo Go.

El backend opcional tiene sus propias pruebas (Python, 7 pruebas del mapeo de datos):

```bash
cd backend
python -m unittest -v test_mapper
```

### 🛠️ Solución de problemas

| Problema | Solución |
|---|---|
| El celular no conecta con el servidor | Comprueba que ambos estén en la misma red Wi-Fi, o usa `npx expo start --tunnel`. |
| Error de caché o de un módulo que "no se encuentra" | Detén el servidor con `Ctrl + C` y ejecuta `npx expo start -c`. |
| `Unable to resolve "<paquete>"` | Ejecuta `npm install` otra vez. Si persiste, instálalo con `npx expo install <paquete>`. |
| Pantalla en blanco unos segundos | Es normal: se está cargando la fuente Inter. |
| Quiero ver la bienvenida otra vez | Pestaña **Perfil**, botón *Ver la introducción otra vez*. |
| Quiero repetir las pruebas de cuota | Pestaña **Perfil**, botón *Reiniciar historial y contador*. |

### 🔌 Opcional: usar datos reales con el backend

> Solo si quieres datos reales de TikTok. **No es necesario** para ejecutar ni evaluar la app.

Requisitos adicionales: **Python 3.11 o superior** y **Google Chrome** instalado.

1. En una **segunda terminal**, desde la raíz del proyecto:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate          # Windows (en macOS/Linux: source venv/bin/activate)
   pip install -r requirements.txt
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```
   > En Windows **no uses `--reload`**: rompe Playwright.
2. Comprueba que funciona abriendo `http://localhost:8000/health` en el navegador del computador.
3. Averigua la IP de tu computador en la red Wi-Fi (`ipconfig`, línea "Dirección IPv4"). Si Windows pregunta por el firewall, permite el acceso en redes privadas.
4. En la raíz del proyecto, copia `.env.example` como `.env`, descomenta la línea `EXPO_PUBLIC_API_URL` y escribe tu IP, por ejemplo `http://192.168.1.10:8000` (en el celular no sirve `localhost`).
5. Reinicia la app con `npx expo start -c`. En la pestaña **Perfil** debe decir *servidor de análisis*.

Cada análisis abre una ventana de Chrome en el computador y tarda entre 15 y 40 segundos. Si aparece un **captcha**, resuélvelo en esa ventana (el servidor espera hasta 90 segundos). El archivo `metro.config.js` evita que Expo vigile la carpeta `backend/`. Más detalles en `backend/README.md`.

---

## 📄 Licencia y uso

Proyecto académico de la asignatura de Dispositivos Móviles. Úsalo solo con cuentas públicas, no hagas consultas masivas y no publiques análisis sobre personas identificables.
