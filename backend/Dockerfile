FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package files (workspace root)
COPY package.json package-lock.json ./

# Copy backend workspace files
COPY backend/ ./backend/

# Install production dependencies using workspace (ignore lifecycle scripts as they're not needed in container)
RUN npm ci --workspace=backend --omit=dev --ignore-scripts

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with pm2
CMD ["npm", "run", "--workspace=backend", "pm2-start"]
