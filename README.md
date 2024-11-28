# YouTube API Backend

Este proyecto es una aplicación backend construida en Node.js que consume la API de YouTube para obtener información sobre videos, canales y listas de reproducción.

## Estructura del Proyecto

```
youtube-api-backend
├── src
│   ├── app.js                # Archivo principal de la aplicación
│   ├── controllers           # Controladores para manejar la lógica de negocio
│   │   └── youtubeController.js # Controlador para la API de YouTube
│   ├── routes                # Rutas de la aplicación
│   │   └── youtubeRoutes.js  # Rutas para la API de YouTube
│   └── services              # Servicios para interactuar con la API de YouTube
│       └── youtubeService.js # Servicio para manejar las solicitudes a la API de YouTube
├── package.json              # Dependencias y scripts del proyecto
├── .env                      # Variables de entorno
├── .gitignore                # Archivos y carpetas a ignorar por Git
└── README.md                 # Documentación del proyecto
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega al directorio del proyecto:
   ```
   cd youtube-api-backend
   ```
3. Instala las dependencias:
   ```
   npm install
   ```
4. Configura las variables de entorno en el archivo `.env`:
   ```
   YOUTUBE_API_KEY=tu_clave_de_api
   GOOGLE_CLIENT_ID=google_client_id
   GOOGLE_CLIENT_SECRET=google_client_secret
   ```

## Uso

Para iniciar la aplicación, ejecuta el siguiente comando:
```
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.
