FROM node:24-alpine

WORKDIR /app
COPY package.json ./
COPY src ./src
COPY extensions ./extensions
COPY shopify.app.toml ./

ENV NODE_ENV=production
ENV PORT=3456
ENV DATABASE_PATH=/app/data/organikkal-notify.sqlite

EXPOSE 3456

CMD ["node", "--no-warnings", "src/server.js"]
