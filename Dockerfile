FROM node:5.6

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

WORKDIR /app

COPY package.json /app/package.json
RUN npm install

COPY . /app

CMD ["npm", "start"]
