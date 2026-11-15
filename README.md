# 🛡️ Veritik

**Analiza perfiles públicos de TikTok y descubre si su audiencia y su interacción se ven auténticas, en menos de un minuto.**

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Arquitectura](https://img.shields.io/badge/Arquitectura-DDD_%2B_Hexagonal-7C5CFF)
![Pruebas](https://img.shields.io/badge/Pruebas-54_con_Vitest-6E9F18?logo=vitest&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-Demo_acad%C3%A9mica-FFB020)
![Modelo](https://img.shields.io/badge/Modelo-Freemium-2EE6A6)

---

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
| `infrastructure/` | Adaptadores: AsyncStorage, cliente HTTP, repositorio de ejemplo, reloj, generador de ids. | Solo `AsyncStorageAdapter` |
| `presentation/` | Pantallas, componentes, navegación, tema y estado. | ✅ Sí |

**Casos de uso:** analizar perfil, consultar historial, ver detalle de un análisis, consultar la cuota gratuita, comparar análisis y gestionar el estado de la bienvenida.

### Inyección de dependencias
Los casos de uso reciben sus repositorios y puertos por constructor. El ensamblado se hace a mano en una raíz de composición (`infrastructure/di/container.ts`), que no conoce React Native; por eso toda la lógica se puede probar en Node. La configuración real de la app (`appContainer.ts`) elige entre el repositorio de ejemplo y el cliente HTTP según la variable `EXPO_PUBLIC_API_URL`.

### Diseño atómico y tokens de diseño
Los componentes se organizan en `atoms/` (`Button`, `Card`, `Chip`, `Screen`) y `molecules/` (`ScoreGauge`, `BottomSheet`, `BackHeader`, `HistoryPickerSheet`). Colores, tipografía, espaciado, radios y duraciones de animación están centralizados en `presentation/theme/`.

### Calidad
- 🧪 **54 pruebas automatizadas con Vitest** (más de 50): unitarias y de integración, con repositorios falsos en memoria. Cubren dominio, casos de uso, persistencia, cliente HTTP y el contenedor de dependencias.
- 🔒 **TypeScript estricto**: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals` y `noUnusedParameters`.
- ♿ **Accesibilidad**: contraste WCAG AA, áreas táctiles de 44 pt o más, estados que no dependen solo del color y etiquetas para lectores de pantalla.
- 🔐 **Privacidad desde el diseño**: solo datos públicos; de los comentarios se guardan únicamente conteos, sin texto ni nombres de usuario.

### Estructura del proyecto

```
veritik/
├─ App.tsx
├─ .env.example
├─ scripts/                  Laboratorio para probar el calculador con datos reales
└─ src/
   ├─ domain/                Entidades, value objects, servicios y contratos
   ├─ application/           Casos de uso, calculador de señales, políticas, puertos
   ├─ infrastructure/        Persistencia, cliente HTTP, repositorio de ejemplo, DI
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

### 🐍 Scraping y análisis (Python, proyecto separado)

> Estas herramientas **no forman parte de la app** ni son necesarias para ejecutarla.

| Tecnología | Uso |
|---|---|
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

- 🚫 **No hay backend conectado.** La app funciona con **datos de ejemplo** generados por `MockProfileRepository`: perfiles inventados, estables para cada usuario. El cliente HTTP (`HttpProfileRepository`) y su contrato con el servidor están implementados y probados, pero el servidor no se construyó.
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
| **Node.js** (versión LTS) | Abre una terminal y ejecuta `node -v`. Debe mostrar un número de versión. Si no, instálalo desde [nodejs.org](https://nodejs.org). |
| **Git** | Ejecuta `git --version`. Si no, instálalo desde [git-scm.com](https://git-scm.com). |
| **Expo Go** en tu celular | Descárgala gratis desde App Store (iPhone) o Google Play (Android). |
| **Misma red Wi-Fi** | El celular y el computador deben estar conectados a la misma red. |

### 2️⃣ Clonar el repositorio

```bash
git clone https://github.com/Sliver9425/Veritik.git
cd veritik
```

> Reemplaza `TU_USUARIO/veritik` por la dirección real del repositorio.

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
- 💻 También puedes presionar `w` en la terminal para verla en el navegador, o `a` / `i` si tienes un emulador de Android o iOS.

La primera carga tarda un poco mientras se compila el código.

### 6️⃣ Qué probar

La app usa datos de ejemplo. Según el nombre de usuario que escribas obtendrás distintos resultados:

| Escribe | Resultado |
|---|---|
| `creadora.demo` (o cualquier otro nombre) | Puntaje **alto**. |
| `medio.demo` o un nombre con `mixta` | Puntaje **medio**. |
| `fake.demo` o un nombre con `falsa` o `inflad` | Puntaje **bajo**. |
| `cuenta.privada` | Error de cuenta privada. |
| `noexiste.uno` | Error de cuenta no encontrada. |
| `cuenta.bloqueada` | Error de cuenta no disponible. |

Recorrido sugerido: analiza dos cuentas distintas, toca cada señal del detalle, luego ve a **Comparar** y elige ambas. En la pestaña **Perfil** puedes activar el plan premium de prueba o reiniciar el historial y el contador.

### 7️⃣ Ejecutar las pruebas (opcional)

```bash
npx vitest run
```

Deben pasar las **54 pruebas**.

### 🛠️ Solución de problemas

| Problema | Solución |
|---|---|
| El celular no conecta con el servidor | Comprueba que ambos estén en la misma red Wi-Fi, o usa `npx expo start --tunnel`. |
| Error de caché o de un módulo que "no se encuentra" | Detén el servidor con `Ctrl + C` y ejecuta `npx expo start -c`. |
| `Unable to resolve "<paquete>"` | Ejecuta `npm install` otra vez. Si persiste, instálalo con `npx expo install <paquete>`. |
| Pantalla en blanco unos segundos | Es normal: se está cargando la fuente Inter. |
| Quiero ver la bienvenida otra vez | Pestaña **Perfil**, botón *Ver la introducción otra vez*. |
| Quiero repetir las pruebas de cuota | Pestaña **Perfil**, botón *Reiniciar historial y contador*. |

### 🔌 Opcional: conectar un backend propio

Si algún día existe un servidor que cumpla el contrato descrito en `HttpProfileRepository.ts`, copia `.env.example` como `.env`, descomenta la línea `EXPO_PUBLIC_API_URL` y escribe la dirección de tu servidor (en el celular no sirve `localhost`: usa la IP de tu computador en la red). Reinicia con `npx expo start -c`. Sin esa variable, la app usa los datos de ejemplo.

---

## 📄 Licencia y uso

Proyecto académico de la asignatura de Dispositivos Móviles. Úsalo solo con cuentas públicas, no hagas consultas masivas y no publiques análisis sobre personas identificables.
