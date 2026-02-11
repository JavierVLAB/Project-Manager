# --- STAGE 1: Dependencies ---
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalamos todo (incluyendo devDeps para el build)
RUN npm install
RUN npx prisma generate

# --- STAGE 2: Builder ---
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivamos telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# --- STAGE 3: Runner ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalamos openssl necesario para el motor de Prisma en runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiamos solo lo necesario para ejecutar la app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
