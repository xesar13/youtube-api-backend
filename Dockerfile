# Usar una imagen base de Node.js
FROM node:18.20

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Instalar yt-dlp
RUN apt-get update && apt-get install -y python3-pip && pip3 install yt-dlp

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]