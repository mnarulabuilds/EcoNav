# CityConnect API + notification worker (monorepo)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY packages/platform/package.json packages/platform/
COPY packages/schemes-engine/package.json packages/schemes-engine/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/

RUN npm ci

COPY packages packages
COPY apps/api apps/api

RUN npm run build --workspace=@econav/core \
 && npm run build --workspace=@econav/platform \
 && npm run build --workspace=@econav/schemes-engine \
 && npm run build --workspace=@econav/db \
 && npm run build --workspace=@econav/api

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/platform/package.json packages/platform/
COPY packages/schemes-engine/package.json packages/schemes-engine/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/

RUN npm ci --omit=dev --workspace=@econav/api --include-workspace-root

COPY --from=builder /app/packages/core/dist packages/core/dist
COPY --from=builder /app/packages/platform/dist packages/platform/dist
COPY --from=builder /app/packages/schemes-engine/dist packages/schemes-engine/dist
COPY --from=builder /app/packages/db/dist packages/db/dist
COPY --from=builder /app/packages/db/drizzle packages/db/drizzle
COPY --from=builder /app/apps/api/dist apps/api/dist

COPY scripts/docker/api-entrypoint.sh scripts/docker/wait-for-postgres.sh scripts/docker/
RUN chmod +x scripts/docker/api-entrypoint.sh scripts/docker/wait-for-postgres.sh

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||process.env.API_PORT||3001)+'/api/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

ENTRYPOINT ["/app/scripts/docker/api-entrypoint.sh"]
CMD ["node", "apps/api/dist/server.js"]
