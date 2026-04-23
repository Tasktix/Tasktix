FROM node:lts-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat=1.1.0-r4
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# For development, just copy the source over
FROM base AS app
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./tailwind.config.ts ./postcss.config.cjs ./tsconfig.json ./next.config.mjs ./
COPY ./package.json ./package.json
COPY ./public ./public
COPY ./prisma ./prisma
COPY ./app ./app
COPY ./components ./components
COPY ./lib ./lib

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run prisma:generate

# Rebuild the source code only when needed
FROM app AS builder

RUN npm run local:build && npm prune --omit=dev

# Production image, copy all the files and run next
FROM base AS runner
LABEL org.opencontainers.image.source=https://github.com/Tasktix/Tasktix
LABEL org.opencontainers.image.description="A powerful and flexible task-tracking tool for all."
LABEL org.opencontainers.image.licenses=AGPL-3.0-or-later
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set permissions for prerender cache
RUN mkdir .next .next/cache && \
    chown nextjs:nodejs .next/cache

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
