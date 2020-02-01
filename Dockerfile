FROM node:10-stretch

RUN apt-get update && apt-get install -y lsb-release apt-transport-https \
    && echo "deb https://download.rethinkdb.com/apt `lsb_release -cs` main" | tee /etc/apt/sources.list.d/rethinkdb.list \
    && wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | apt-key add - \
    && apt-get update \
    && apt-get install -y rethinkdb \
    && rm -rf /var/lib/apt/lists/* \
    && npm i -g concurrently

COPY backend/piper /app/piper
COPY backend/provider /app/provider
COPY proxy /app/proxy
COPY webapp /app/webapp

ENV NUXT_HOST=127.0.0.1
ENV NUXT_PORT=3000

RUN \
    cd /app/piper && npm install \
    && cd ../provider && npm install \
    && cd ../proxy && npm install \
    && cd ../webapp && npm install && npm run build

COPY entrypoint.sh /app/entrypoint.sh

CMD ["/bin/bash", "/app/entrypoint.sh"]