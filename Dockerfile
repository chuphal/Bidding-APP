FROM node:18.7.0

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .


CMD [ "node", "./backend/server.js" ]