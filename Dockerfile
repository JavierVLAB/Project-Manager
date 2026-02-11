FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies) for build
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Optional: Cleanup devDependencies to reduce image size
RUN npm prune --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
