FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 5001
ENV PORT 5001
ENV NODE_ENV production

CMD ["node", "server.js"]
