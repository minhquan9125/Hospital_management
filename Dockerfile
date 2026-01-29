FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy all server files
COPY server/ .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
