# Stage: base image
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine as base

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

WORKDIR /app

# Cache breaking and ensure required build / git args defined
RUN test -n "$BUILD_NUMBER" || (echo "BUILD_NUMBER not set" && false)
RUN test -n "$GIT_REF" || (echo "GIT_REF not set" && false)
RUN test -n "$GIT_BRANCH" || (echo "GIT_BRANCH not set" && false)

# Define env variables for runtime health / info
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV GIT_REF=${GIT_REF}
ENV GIT_BRANCH=${GIT_BRANCH}

RUN apk update && \
        apk upgrade && \
        rm -rf /var/cache/apk/*

# Stage: build assets
FROM base as build

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

RUN npm install -g npm@12.0.2
COPY package*.json .npmrc ./
RUN NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false CYPRESS_INSTALL_BINARY=0 npm run setup
ENV NODE_ENV='production'

COPY . .
RUN --mount=type=secret,id=sentry SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry) npm run build

RUN npm prune --no-audit --no-fund --omit=dev --omit=optional

# Stage: copy production assets and dependencies
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine-runtime

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

RUN rm -rf /usr/local/lib/node_modules/npm \
        /usr/local/bin/npm \
        /usr/local/bin/npx

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        ./

COPY --from=build --chown=appuser:appgroup \
        /app/dist ./dist

COPY --from=build --chown=appuser:appgroup \
        /app/node_modules ./node_modules

EXPOSE 3000
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV GIT_REF=${GIT_REF}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV NODE_ENV='production'
USER 2000

CMD [ "node", "dist/server.js" ]
