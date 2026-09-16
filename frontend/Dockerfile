# SkillGreen — React frontend
# Multi-stage build: compile with Node, then serve the static
# output with a lightweight nginx image. The final image contains
# no Node.js or node_modules, only the built HTML/CSS/JS.

# ---- Stage 1: build ----
FROM node:20-slim AS build

WORKDIR /app

# Install dependencies first, separately from source code,
# so this layer is cached and skipped unless package.json changes.
COPY package.json package-lock.json ./
RUN npm ci

# Now copy the rest of the frontend source and build it
COPY . .
RUN npm run build

# ---- Stage 2: serve ----
FROM nginx:alpine

# Vite's build output goes to /dist by default
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config so client-side routing (React Router style
# refreshes) doesn't 404 on non-root paths.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
