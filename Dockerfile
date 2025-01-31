# Usar una imagen base con Node.js y npm preinstalados
FROM node:20.18 AS base

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Usar la imagen jauderho/yt-dlp como base para yt-dlp
FROM jauderho/yt-dlp:latest AS yt-dlp

# Copiar las dependencias instaladas y el código de la aplicación desde la imagen base
COPY --from=base /node_modules /node_modules
COPY --from=base /package*.json ./
COPY . .

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]