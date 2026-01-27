# Use official Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the source code
COPY . .

# Expose the port your app runs on
EXPOSE 2231

# Start the server
CMD ["node", "Server.js"]
