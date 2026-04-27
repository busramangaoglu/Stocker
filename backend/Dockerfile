FROM node:20-alpine

# Set working directory
WORKDIR /app/backend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run development mode with hot reload
CMD ["npm", "run", "dev"]
