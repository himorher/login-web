FROM node:18-alpine

#Create a app directory
WORKDIR /webapp

#Install app dependencies
COPY package*.json ./

#Run npm install
RUN npm install

#Bundle app souce
COPY . .

EXPOSE 3000

CMD [ "node", "login.js" ]