# Usa una imagen base de Node.js
FROM node:22

# Establece el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci --production

# Copia todo el código fuente
ADD ./src ./src

# Expone el puerto en el que la app escuchará
EXPOSE 5000

USER node

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]
