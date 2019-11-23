module.exports = {
    head: {
        title: 'kafka-ui',
        meta: [
            {charset: 'utf-8'},
            {name: 'viewport', content: 'width=device-width, initial-scale=1'},
            {hid: 'description', name: 'description', content: 'kafka-ui'}
        ],
        link: [
            {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
        ]
    },
    plugins: [
        '@/plugins/server/element-ui',
        '@/plugins/server/spinner',
        {src: '@/plugins/client/screen-size', mode: 'client'},
        {src: '@/plugins/client/json-pretty', mode: 'client'},
    ],
    css: [
        'element-ui/lib/theme-chalk/reset.css',
        'element-ui/lib/theme-chalk/index.css'
    ],
    modules: [],
    loading: {color: '#3B8070'},
    build: {
        extend(config, {isDev, isClient}) {
            config.devtool = isClient ? 'eval-source-map' : 'inline-source-map';

            if (isDev && isClient) {
                config.module.rules.push()
            }
        }
    }
}

