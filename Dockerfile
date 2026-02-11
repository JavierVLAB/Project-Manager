# --- STAGE 1: Instalar dependencias ---
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

# Solo copiamos los archivos de configuración de paquetes
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalamos las librerías. Esto genera la carpeta node_modules.
RUN npm install
# Generamos el cliente de Prisma para que sea compatible con este Linux
RUN npx prisma generate

# --- STAGE 2: Construir la aplicación ---
FROM node:20-slim AS builder
WORKDIR /app

# Aquí es donde ocurre la "magia": en lugar de volver a descargar todo,
# simplemente COPIAMOS los node_modules que ya descargamos en el paso anterior.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construimos Next.js (ahora sin el error de turbopack)
RUN npm run build

# --- STAGE 3: Imagen final para correr ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Instalamos openssl que Prisma necesita para funcionar
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiamos solo lo estrictamente necesario para que la web funcione
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
