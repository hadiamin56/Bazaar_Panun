# Used when the hosting service builds the site with Docker (e.g. a Render "Docker" web service).
FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

# The database is only reachable at run time: create/update the tables, load the starting
# products if the database is empty, then start the site.
CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && npm start"]
