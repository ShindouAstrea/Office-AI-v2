# Nexus Virtual Office - Guía de Configuración

Esta aplicación simula una oficina virtual colaborativa. Para habilitar la persistencia de datos (guardar cambios en el mapa, historial de chat y salas privadas), es necesario conectar la aplicación con **Firebase Cloud Firestore**.

Si no se configura Firebase, la aplicación funcionará en **Modo Offline** (los datos se perderán al recargar la página).

## 1. Crear Proyecto en Firebase

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Haz clic en **"Agregar proyecto"** y sigue los pasos (ponle un nombre, ej: `nexus-office`).
3.  Desactiva Google Analytics si es solo para pruebas (opcional).
4.  Haz clic en **"Crear proyecto"**.

## 2. Registrar la Aplicación Web

1.  En la vista general del proyecto, haz clic en el icono de **Web** (`</>`).
2.  Registra la app con un apodo (ej: `Nexus Web`).
3.  **No** es necesario configurar Firebase Hosting por ahora.
4.  Haz clic en "Registrar app".
5.  Aparecerá un bloque de código con `const firebaseConfig = { ... }`. **Copia estos valores**, los necesitarás para las variables de entorno.

## 3. Habilitar Cloud Firestore (Base de Datos)

1.  En el menú lateral izquierdo, ve a **Compilación** -> **Firestore Database**.
2.  Haz clic en **"Crear base de datos"**.
3.  Selecciona la ubicación (ej: `nam5 (us-central)` o la más cercana a ti).
4.  En las reglas de seguridad, selecciona **"Comenzar en modo de prueba"** (Start in test mode).
    *   *Nota: Esto permite leer/escribir a cualquiera durante 30 días. Para producción, debes configurar reglas más estrictas.*
5.  Haz clic en **"Crear"**.

## 4. Configurar Variables de Entorno

Crea un archivo llamado `.env` en la raíz de tu proyecto (al mismo nivel que `package.json`). Copia el siguiente formato y reemplaza los valores con los que obtuviste en el Paso 2:

```env
FIREBASE_API_KEY=tu_api_key_aqui
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-id-de-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=1234567890
FIREBASE_APP_ID=1:1234567890:web:abcdef123456
