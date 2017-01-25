FROM node:alpine

RUN mkdir -p /usr/src/app
ADD artifacts/nodejsapp.tar /usr/src/app
WORKDIR /usr/src/app/ins_proxy/src

RUN npm install


EXPOSE 8080

CMD [ "npm", "start" ]
