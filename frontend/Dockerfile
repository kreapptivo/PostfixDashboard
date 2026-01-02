# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies (includes dev deps for build)
RUN npm ci \
 && chmod +x node_modules/.bin/tsc

# Copy all files
COPY . .

# Build application without relying on executable bits
RUN node node_modules/typescript/bin/tsc --pretty false \
 && node node_modules/vite/bin/vite.js build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx || true

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/api/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
