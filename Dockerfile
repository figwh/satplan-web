FROM node:12.21.0-slim AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN yarn run build

FROM nginx:1.17.0-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD sed -i "s+BASE_URL+"${BASE_URL}"+" /etc/nginx/nginx.conf \
  && nginx -g 'daemon off;'