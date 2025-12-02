# Nexus Virtual Office - Guía de Configuración de Firebase

Esta aplicación utiliza **Firebase Cloud Firestore** para persistir el estado del mundo virtual (mapa, chats y salas). Sigue estos pasos para conectar tu propia base de datos.

## 1. Crear Proyecto en Firebase

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Haz clic en **"Agregar proyecto"**.
3.  Ponle un nombre (ej: `nexus-office`) y continúa.
4.  Desactiva Google Analytics (opcional, no es necesario para este proyecto) y finaliza la creación.

## 2. Registrar la Aplicación Web

1.  En la vista general del proyecto, busca el icono de **Web** (`</>`) para agregar una app.
2.  Registra la app con un nombre (ej: `Nexus Client`).
3.  **No** marques "Firebase Hosting".
4.  Haz clic en "Registrar app".
5.  Verás un objeto `const firebaseConfig`. **Mantén esta pestaña abierta** o copia los valores, los necesitarás en el paso 4.

## 3. Habilitar Cloud Firestore (Base de Datos)

1.  En el menú lateral izquierdo de la consola, ve a **Compilación** -> **Firestore Database**.
2.  Haz clic en **"Crear base de datos"**.
3.  Selecciona una ubicación geográfica (ej: `nam5 (us-central)`).
4.  En la configuración de reglas de seguridad, selecciona **"Comenzar en modo de prueba"** (Start in test mode).
    *   *Nota: Esto permite que cualquiera lea/escriba durante 30 días. Ideal para desarrollo rápido.*
5.  Haz clic en **"Crear"**.

## 4. Configurar Variables de Entorno

En tu entorno de desarrollo (local o Vercel/Netlify), crea las variables de entorno usando los valores obtenidos en el Paso 2 (`firebaseConfig`).

Si estás en local, crea un archivo `.env` en la raíz del proyecto:

```env
FIREBASE_API_KEY=tu_api_key_aqui
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-id-de-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=1234567890
FIREBASE_APP_ID=1:1234567890:web:abcdef...
```

## 5. Estructura de la Base de Datos (Schema)

La aplicación está programada para buscar una colección específica y tres documentos clave. Aunque el código intentará crearlos si tienes permisos, se recomienda crear esta estructura manualmente la primera vez para asegurar un funcionamiento perfecto.
Colección Raíz: virtual_office
Crea una colección con el ID: virtual_office.
Dentro de esta colección, crea los siguientes 3 Documentos:

- A. Documento del Mapa
  - Document ID: main_map_v1
  - Campos:
    - furniture (Array): Deja este array vacío o añade un objeto dummy si la consola lo requiere.
    - lastUpdated (Number): 0
    - json: ejemplo
      ```json
      {
        "tipos_validos":["WALL", "FLOOR", "DESK", "CHAIR", "PLANT", "COFFEE_MAKER", "SCREEN", "TOILET", "SINK", "FOOD", "TABLE_ROUND", "RUG", "BOOKSHELF",
         "COUCH", "WHITEBOARD", "PRINTER", "LAMP"]
      },
              {
          "id": "desk-17100023",
          "type": "DESK",          // Ver lista de Tipos Válidos abajo
          "position": {
            "x": 15,               // Coordenada Grid X
            "y": 10                // Coordenada Grid Y
          },
          "rotation": 0,           // 0, 90, 180, 270
          "variant": 0             // 0 (Default), 1 (Alt), 2...
        }
      ```
- B. Documento del Chat Global
  - Document ID: global_chat_v1
  - Campos:
    - messages (Array): Vacío.
    - lastUpdated (Number): 0
    - json ejemplo
    ```json
          {
        "id": "msg-123456789",
        "roomId": "global",      // 'global' o el ID de una sala privada
        "senderId": "user-abc",
        "senderName": "Juan",
        "text": "Hola a todos",
        "timestamp": 1710000000,
        "isPrivate": false
      }
    ```
- C. Documento de Salas Privadas
  - Document ID: chat_rooms_v1
  - Campos:
    - rooms (Array): Vacío.
    - lastUpdated (Number): 0
    - json ejemplo :
     ```json
            {
          "id": "room-17150000",
          "name": "Proyecto X",
          "type": "PRIVATE",       // 'GLOBAL' o 'PRIVATE'
          "createdBy": "user-abc",
          "participants": [        // IDs de usuarios permitidos
            "user-abc",
            "user-xyz"
          ]
        }
  ```

