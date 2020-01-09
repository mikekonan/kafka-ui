const retryMsg = 'failed communicating with server, reconnecting in 10 seconds';

let connect = function (url, cfg) {
    const config = Object.assign(
        {},
        {
            withCredentials: false,
            format: 'plain',
        },
        cfg,
    );

    const formatters = {
        plain: e => e.data,
        json: e => JSON.parse(e.data),
    };

    const source = new EventSource(url, {
        withCredentials: config.withCredentials,
    });

    return new Promise((resolve, reject) => {
        source.onerror = reject;

        source.onopen = () => {
            source.onerror = null;

            const subscribers = {};

            resolve({
                getSource() {
                    return source;
                },
                onError(handler) {
                    source.onerror = handler;

                    return this;
                },
                subscribe(event, handler) {
                    const listener = (e) => {
                        let data;

                        try {
                            data = formatters[config.format](e);
                        } catch (err) {
                            if (typeof source.onerror === 'function') {
                                source.onerror(err);
                            }
                        }

                        handler(data);
                    };

                    if (!subscribers[event]) {
                        subscribers[event] = [];
                    }

                    subscribers[event].push(listener);

                    if (event === '') { // Catches messages without any event specified
                        source.onmessage = listener;
                    } else {
                        source.addEventListener(event, listener);
                    }

                    return this;
                },
                unsubscribe(event) {
                    if (event === '') {
                        source.onmessage = null;

                        return this;
                    }

                    // Check if there are any subscribers for this event
                    if (!subscribers[event]) {
                        return this;
                    }

                    subscribers[event].forEach((listener) => {
                        source.removeEventListener(event, listener);
                    });

                    subscribers[event] = [];

                    return this;
                },
                close() {
                    source.close();

                    // Make sure listeners are cleared (nobody likes mem leaks, right?)
                    Object.keys(subscribers).forEach((event) => {
                        subscribers[event] = [];
                    });
                },
            });
        };
    });
};

let sub = function (subj, query, onStart, onMsg, onErr) {
    let self = {};
    self.conn = null;
    self.closed = false;
    self.connect = () =>
        connect(`/${subj}${!!query ? `?q=${query}` : ''}`, {format: 'json'})
            .then(conn => {
                if (self.closed) {
                    return Promise.resolve(null)
                }

                self.conn = conn;

                if (!!onStart) {
                    onStart()
                }

                self.conn.onError(e => {
                    self.conn.close();
                    self.conn == null;
                    self.errHandler(e)
                });

                self.conn.subscribe('', (msg) => {
                    if (!!msg.ping) {
                        return
                    }

                    onMsg(msg)
                });

                return Promise.resolve(self);
            }).catch(e => self.errHandler(e));

    self.close = () => {
        if (!!self.conn) {
            self.conn.close();
        }

        self.conn = null;
    };

    self.stop = () => {
        self.closed = true;
        self.close();
    };

    self.errHandler = (err) => {
        let errMsg = `${subj}: ${retryMsg}`;
        console.error(errMsg, err);
        onErr(errMsg);
        self.close();
        setTimeout(() => self.connect(subj, query, onStart, onMsg, onErr), 10000);
    };

    return self.connect()
};

export default ({app}, inject) => {
    inject('sub', sub);
}