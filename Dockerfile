# Tahap 1: Build dependensi
FROM node:20-alpine AS builder

WORKDIR /app

# Salin file package
COPY package*.json ./

# Install hanya dependensi production (efisiensi ukuran)
RUN npm ci --omit=dev

# Tahap 2: Image production
FROM node:20-alpine

# Jalankan aplikasi tidak sebagai root untuk keamanan
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production

# Salin dependensi dari builder
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# Salin sisa kode aplikasi
COPY --chown=appuser:appgroup . .

# Gunakan non-root user
USER appuser

# Expose port (opsional, akan tertimpa oleh docker-compose)
EXPOSE 3001

# Jalankan aplikasi
CMD ["npm", "start"]
