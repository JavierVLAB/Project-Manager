FROM ubuntu:22.04

WORKDIR /app

# Install Node.js and required system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    openssl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify build exists
RUN ls -la .next/

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
