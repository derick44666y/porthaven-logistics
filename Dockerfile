# Use Node.js with Python for invoice generation
FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY server/requirements.txt ./server/

# Install Node.js dependencies
RUN npm install
RUN cd server && npm install

# Install Python dependencies
RUN cd server && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the server
WORKDIR /app/server
CMD ["npm", "start"]