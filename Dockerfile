# Stage 1: 
FROM node:20.14-alpine AS sources

RUN apk --no-cache add yarn git
  
WORKDIR /app

ADD ./package.json ./
ADD ./yarn.lock ./

RUN yarn install --production

# Stage 2: 
FROM node:15.12.0-alpine AS production
WORKDIR /app
COPY --from=sources /app/node_modules ./node_modules
COPY --from=sources /app/package.json ./package.json
COPY ./app.js ./app.js
COPY ./index.js ./index.js

EXPOSE 5050

CMD ["node", "index.js"]
