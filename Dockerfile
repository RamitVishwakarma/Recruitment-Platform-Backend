# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
# Using --omit=dev if you have devDependencies you don't want in production
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Make port available to the world outside this container
# Assuming your app in index.js listens on process.env.PORT or defaults to 8080
ENV PORT 8080
EXPOSE 8080

# Define environment variables (e.g., from .env)
# DATABASE_URL will be injected by docker-compose or the environment on EC2
# ENV DATABASE_URL=your_database_url_here

# Command to run the application
CMD [ "node", "index.js" ]
