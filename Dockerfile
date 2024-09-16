FROM node:18.18.0-alpine AS builder

# Install Python and other necessary dependencies
RUN apk add --no-cache python3 py3-pip make g++

# Symlink python3 to python to avoid 'python not found' issues
RUN ln -sf python3 /usr/bin/python

WORKDIR /app

COPY . ./

RUN npm install

RUN npm run db:generate
RUN npm run build

CMD [ "npm", "run", "preview", "--", "--host" ]

