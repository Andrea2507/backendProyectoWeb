FROM node:20

RUN apt-get update && apt-get install -y mysql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
