# --- Build da versão web do app Expo ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npx expo export --platform web --output-dir dist

# --- Servir o estático com Nginx ---
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/web-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
