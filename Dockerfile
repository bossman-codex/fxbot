FROM node:16-slim
WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile
COPY . /usr/src/app
CMD ["yarn", "start"]