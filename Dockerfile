# Usar una imagen base con Node.js y npm preinstalados
FROM node:20.18 AS base

# Instalar git, wget y Python
RUN apt-get update && apt-get install -y git wget python3 python3-pip python3-venv build-essential

# Descargar el binario de yt-dlp y almacenarlo en /usr/bin/yt-dlp
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/bin/yt-dlp \
    && chmod a+rx /usr/bin/yt-dlp

# Establecer el directorio de trabajo en la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el archivo .env
COPY .env .env

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]