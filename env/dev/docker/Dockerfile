FROM node:18-alpine

WORKDIR /app

# Копируем все файлы проекта и устанавливаем зависимости
COPY . .

# Устанавливаем serve глобально, если это требуется
RUN npm install -g serve

# Устанавливаем зависимости проекта
RUN npm install

# Устанавливаем NODE_OPTIONS при необходимости
ENV NODE_OPTIONS=--max_old_space_size=4096

# Собираем проект
RUN npm run build

# Экспонируем порт 3000
EXPOSE 3000

# Запускаем приложение с помощью serve
CMD ["serve", "-n", "-s", "build"]

