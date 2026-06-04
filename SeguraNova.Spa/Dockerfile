FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration development

FROM nginx:1.27-alpine AS runtime
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /tmp/dist
RUN set -eux; \
    browser_dir="$(find /tmp/dist -maxdepth 3 -type d -name browser | head -n 1)"; \
    test -n "$browser_dir"; \
    cp -r "$browser_dir"/. /usr/share/nginx/html/; \
    rm -rf /tmp/dist

EXPOSE 80
