FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/content/package*.json ./packages/content/
COPY packages/engine/package*.json ./packages/engine/
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npx", "--workspace=@boxbox/web", "vite", "--host", "0.0.0.0"]
