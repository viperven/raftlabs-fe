# Use Node.js LTS version as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port your backend runs on
EXPOSE 7000

# Start the Node.js application
CMD ["npm", "run", "start"]
