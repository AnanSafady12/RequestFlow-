FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port 3000
EXPOSE 3000

# Run migrations, seed admin, and start the server
CMD sh -c "npx prisma migrate deploy && node prisma/seedAdmin.js && npm start"
