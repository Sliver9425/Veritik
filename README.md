# 🛡️ Veritik

**Analiza perfiles públicos de TikTok y descubre si su audiencia y su interacción se ven auténticas, en menos de un minuto.**

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Arquitectura](https://img.shields.io/badge/Arquitectura-DDD_%2B_Hexagonal-7C5CFF)
![Pruebas](https://img.shields.io/badge/Pruebas-54_con_Vitest-6E9F18?logo=vitest&logoColor=white)
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

**Universidad Central del Ecuador**

**Periodo académico:** 2026-2027


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

### Flujo de análisis con `@tienda_demo`

1. **Presentación.** En `HomeScreen.tsx` escribes `@tienda_demo` y pulsas **Analizar cuenta**. La pantalla valida el nombre y abre `AnalysisScreen.tsx`, que llama al caso de uso.
2. **Aplicación.** `AnalyzeProfileUseCase.ts` comprueba la cuota, pide el perfil mediante el contrato `ProfileRepository` y busca un análisis anterior de la misma cuenta. Luego usa `SignalCalculator.ts` para calcular las señales disponibles.
3. **Dominio.** `Profile` y `Signal` representan el perfil y sus señales. Al crear el `AnalysisResult`, `AuthenticityScore` calcula el promedio ponderado de las señales disponibles y determina el nivel. En el primer análisis, la señal de saltos de seguidores queda sin datos porque todavía no hay un perfil anterior.
4. **Infraestructura.** En modo demo, el contenedor conecta el caso de uso con `MockProfileRepository`, que genera las métricas del perfil y seis videos simulados a partir del nombre. Cuando el caso de uso termina el cálculo, `StorageAnalysisHistoryRepository` guarda el resultado en el dispositivo mediante AsyncStorage.

En una primera consulta simulada, `@tienda_demo` obtiene **98/100 (nivel alto)**. `ResultScreen.tsx` recupera el análisis guardado por su identificador y muestra ese puntaje en el medidor.

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

La demo usa perfiles simulados. Para probarla en un iPhone físico con Expo Go, inicia sesión con la misma cuenta de Expo en el iPhone y en la terminal del computador.

### 1️⃣ Prerrequisitos

| Qué | Cómo comprobarlo |
|---|---|
| **Node.js y npm** | Se recomienda Node.js 24 LTS. Comprueba la instalación con `node -v` y `npm -v`. [Descargar Node.js](https://nodejs.org) |
| **Git** | Ejecuta `git --version`. Si no, instálalo desde [git-scm.com](https://git-scm.com). |
| **Expo Go compatible** | Veritik usa **Expo SDK 58**. Comprueba que puedas instalar una edición de Expo Go compatible con ese SDK para tu dispositivo. [Versiones de Expo Go](https://expo.dev/go) |
| **Misma red Wi-Fi** | Para conectarte por red local, conecta el celular y el computador a la misma red. |

### 2️⃣ Clonar el repositorio

```bash
git clone https://github.com/Sliver9425/Veritik.git
cd Veritik/veritik
```

Ejecuta los siguientes comandos desde esa subcarpeta, donde están `package.json` y `package-lock.json`.

### 3️⃣ Instalar dependencias

Instala las versiones fijadas en `package-lock.json`:

```bash
npm ci
```

En PowerShell, si Windows bloquea los scripts `.ps1` de npm, usa `npm.cmd ci` y `npx.cmd` en lugar de `npx` en los comandos de esta guía.

### 4️⃣ Levantar el servidor de desarrollo

```bash
npx expo start
```

Deja abierta la terminal. Expo mostrará un **código QR** para abrir el proyecto en Expo Go.

### 5️⃣ Abrir la app

**iPhone físico**

1. Usa una edición de Expo Go compatible con el SDK 58. Si la edición de App Store usa otro SDK, Expo documenta una alternativa con TestFlight para equipos del Apple Developer Program. [Compatibilidad de Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
2. Ejecuta `npx expo login` en otra terminal del computador. En Expo Go, toca el icono de cuenta e inicia sesión con **la misma cuenta**. Puedes comprobar la sesión de la terminal con `npx expo whoami`. [Inicio de sesión en Expo Go](https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/)
3. Con ambos dispositivos en la misma red Wi-Fi, abre **Cámara** en el iPhone, apunta al QR de la terminal y toca **Abrir en Expo Go**. Si ya estabas en la pantalla del aviso de cuenta, toca **Try Again**.

- 📱 **Android:** abre Expo Go y toca *Scan QR code*.
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
| El celular no conecta con el servidor | Comprueba que estén en la misma red Wi-Fi y que Expo siga corriendo. Si la red impide la comunicación entre dispositivos, detén Expo con `Ctrl + C`, ejecuta `npx expo start --tunnel` y escanea el nuevo QR. |
| Expo Go pide iniciar sesión | Ejecuta `npx expo login` en el computador e inicia sesión con la misma cuenta en el iPhone. Luego toca **Try Again**. |
| Expo Go indica que el proyecto es incompatible | Comprueba que la edición instalada admita Expo SDK 58. [Opciones para instalar una edición compatible](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/) |
| Error de caché o de un módulo que "no se encuentra" | Detén el servidor con `Ctrl + C` y ejecuta `npx expo start -c`. |
| `Unable to resolve "<paquete>"` | Comprueba que estás en `Veritik/veritik`, reinstala con `npm ci` y vuelve a iniciar Expo con `npx expo start -c`. |
| Pantalla en blanco unos segundos | Es normal: se está cargando la fuente Inter. |
| Quiero ver la bienvenida otra vez | Pestaña **Perfil**, botón *Ver la introducción otra vez*. |
| Quiero repetir las pruebas de cuota | Pestaña **Perfil**, botón *Reiniciar historial y contador*. |

### 🔌 Opcional: conectar un backend propio

Si algún día existe un servidor que cumpla el contrato descrito en `HttpProfileRepository.ts`, copia `.env.example` como `.env`, descomenta la línea `EXPO_PUBLIC_API_URL` y escribe la dirección de tu servidor (en el celular no sirve `localhost`: usa la IP de tu computador en la red). Reinicia con `npx expo start -c`. Sin esa variable, la app usa los datos de ejemplo.

---

## 📄 Licencia y uso

Proyecto académico de la asignatura de Dispositivos Móviles. Úsalo solo con cuentas públicas, no hagas consultas masivas y no publiques análisis sobre personas identificables.
