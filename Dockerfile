FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
WORKDIR /app/server

# Install dependencies
RUN npm install

# Copy server source
COPY server/ .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
