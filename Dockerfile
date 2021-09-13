# Build stage
FROM node:fermium-alpine AS build
WORKDIR /build
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Run stage
FROM node:fermium-alpine AS server
USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --from=build --chown=node:node ./build/node_modules ./node_modules
COPY --from=build --chown=node:node ./build/dist ./dist
ENV NODE_ENV=production
ENV PORT=3000
ENV MONGO_USER=mongo
ENV MONGO_PASSWORD=mongo
CMD ["node", "dist/bin/www.js"]

# Test build run locally
# docker \
  # run --network=modern-todomvc_default \
  # -e "MONGO_HOST=mongo" \
  # -p 3000:3000 \
  # --init \
  # --rm \
  # modern-todomvc \

# $ docker run \
#   -e "NODE_ENV=production" \
#   -u "node" \
#   -m "300M" --memory-swap "1G" \
#   -w "/home/node/app" \
#   --name "my-nodejs-app" \
#   node [script]
