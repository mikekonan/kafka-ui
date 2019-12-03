FROM node:10.17-alpine
COPY . /app
WORKDIR /app
RUN apk --update add --virtual build-dependencies git && npm install && npm run build && apk del build-dependencies
EXPOSE 8080
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8080
CMD [ "npm", "start" ]