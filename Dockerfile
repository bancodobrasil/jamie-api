FROM node:18-alpine 

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build

EXPOSE 5000

CMD [ "node", "dist/src/main.js" ]