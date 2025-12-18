# 1. Base image
FROM node:18-alpine AS base
WORKDIR /app

# 2. Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# 3. Build Next.js
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy project files
COPY . .



# Build the project
RUN npm run build

# 4. Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Tell Next.js to listen on port 80
ENV PORT=80

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port 80 for ECS ALB
EXPOSE 80

# Start Next.js on port 80
CMD ["npx", "next", "start", "-p", "80"]
