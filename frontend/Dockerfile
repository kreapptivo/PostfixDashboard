# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy root package files (workspace root)
COPY package.json package-lock.json ./

# Copy all frontend application files and directories
COPY frontend/ ./frontend/

# Install dependencies (includes dev deps for build) using workspace (ignore lifecycle scripts as they're not needed in container)
RUN npm ci --workspace=frontend --ignore-scripts

# Build application without relying on executable bits
RUN npm run build --workspace=frontend

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

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
