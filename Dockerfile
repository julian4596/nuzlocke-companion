# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code and build it
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine-slim
# Copy custom nginx config to listen on both ports
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built assets from the build stage to nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose ports
EXPOSE 80 5173

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
