# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files to the working directory
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN yarn build

# Stage 2: Create the production image
FROM node:18-alpine AS production

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/package.json /app/yarn.lock /app/dist/ ./

# Install only production dependencies
RUN yarn install --production

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable to specify the PORT
ENV PORT=3000

# Command to run the application with --require ./instrumentation.js
CMD ["node", "--require", "./tracing.js", "app.js"]
