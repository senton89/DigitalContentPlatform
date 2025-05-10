# Этап сборки
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап продакшн
FROM nginx:alpine
# Копируем собранные файлы из этапа сборки
COPY --from=build /app/build /usr/share/nginx/html
# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]