FROM node:18.18.0-alpine AS builder

WORKDIR /app

COPY . ./

RUN npm install

RUN npm run db:generate
RUN npm run build

CMD [ "npm", "run", "preview", "--", "--host" ]

