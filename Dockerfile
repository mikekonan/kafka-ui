FROM node:14-alpine as web-builder
COPY webapp /app/webapp
RUN cd /app/webapp \
    && npm install \
    && npm run build

FROM golang:1.16.2-alpine3.13 as backend-builder
COPY backend /app/backend
RUN cd /app/backend \
    && apk add --no-cache make gcc musl-dev librdkafka-dev \
    && go get github.com/abice/go-enum \
    && make build-alpine

FROM nginx:1.19.8-alpine
COPY --from=web-builder /app/webapp/dist /etc/nginx/html
COPY --from=backend-builder /app/backend/kafka-backend /app/kafka-backend
COPY nginx.conf /etc/nginx/nginx.conf

RUN cd /tmp \
    && wget http://dl-cdn.alpinelinux.org/alpine/v3.11/main/x86_64/libprotobuf-3.11.2-r1.apk \
    && wget http://dl-cdn.alpinelinux.org/alpine/v3.11/community/x86_64/rethinkdb-2.3.6-r15.apk \
    && apk add libprotobuf-3.11.2-r1.apk rethinkdb-2.3.6-r15.apk \
    && rm /tmp/*

COPY entrypoint.sh /app/entrypoint.sh

EXPOSE 80 9002
CMD ["/bin/sh", "/app/entrypoint.sh"]