const express = require('express');
const proxy = require('http-proxy-middleware');

const port = process.env.PROXY_PORT || 3005;

const app = express();

const providerProxy = proxy({
    target: !!process.env.PROVIDER_PORT ? `http://127.0.0.1:${process.env.PROVIDER_PORT}/` : 'http://127.0.0.1:3001/',
    changeOrigin: true,
    logLevel: 'debug'
});

const webappProxy = proxy({
    target: !!process.env.NUXT_PORT ? `http://127.0.0.1:${process.env.NUXT_PORT}` : 'http://127.0.0.1:3000/',
    changeOrigin: true,
    logLevel: 'debug'
});

app.use('/topics', providerProxy);
app.use('/messages', providerProxy);
app.use('/', webappProxy);


app.listen(port, () => `Proxy listening on :${port}`);