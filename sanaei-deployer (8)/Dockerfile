FROM node:20-alpine

WORKDIR /app

# نصب وابستگی‌ها
COPY package*.json ./
RUN npm install --omit=dev

# کپی سورس (فقط دو فایل — فرانت‌اند داخل server.js جاسازی شده)
COPY server.js sanaei.js ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
