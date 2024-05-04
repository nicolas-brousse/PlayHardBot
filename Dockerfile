FROM node:20-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci --production

COPY . .

# HEALTHCHECK --interval=60s --timeout=30s --start-period=180s --retries=5 CMD node healthcheck.js
CMD ["node", "app.js"]
