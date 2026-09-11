FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY apps/api/package.json apps/api/

RUN npm ci

COPY packages/core packages/core
COPY apps/api apps/api

RUN npm run build --workspace=@econav/core
RUN npm run build --workspace=@econav/api

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY apps/api/package.json apps/api/

RUN npm ci --omit=dev --workspace=@econav/api --include-workspace-root

COPY --from=builder /app/packages/core/dist packages/core/dist
COPY --from=builder /app/apps/api/dist apps/api/dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||process.env.API_PORT||3001)+'/api/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "apps/api/dist/server.js"]
