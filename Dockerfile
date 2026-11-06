# Dockerfile
# Purpose: build the static site with Node, then serve it with nginx.
# Inputs: the project source (see .dockerignore for what is left out).
# Outputs: a small image that serves the app on port 80.

# ---- Stage 1: build the static site ----
FROM node:24-alpine AS build
WORKDIR /app
# Copy the manifests first so the install layer is cached until dependencies change
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: serve it with nginx ----
FROM nginx:stable-alpine
# Only the built files are copied, so Node and the source stay out of the final image
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
