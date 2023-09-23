FROM node:18.7.0-alpine AS node

# Builder stage

FROM node AS builder

# Use /app as the CWD
WORKDIR /app

# Copy package.json and yarn.lock to /app
COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

# Install all dependencies
RUN yarn install

# Copy the rest of the code
COPY . .


## Invoke the build script to transpile code to js
RUN yarn build
#
## Final stage
#
FROM node AS final
#
## Prepare a destination directory for js files
#RUN mkdir -p /home/node/app/dist && chown -R node:node /home/node/app
#
## Set CWD
WORKDIR /home/node/app
#
## Copy package.json and package-lock.json
COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
#
## Install only production dependencies
RUN npm i --only=production
#
## Copy transpiled js from builder stage into the final image
COPY --chown=node:node --from=builder /app/dist ./dist
#
## Open desired port
EXPOSE 4000
#
## Use js files to run the application

ENTRYPOINT ["node", "./dist/server.js"]

