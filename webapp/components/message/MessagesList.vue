<template>
    <div ref="container" class="container" :style="`height: ${this.$vssHeight - 130}px;`">
        <template v-if="this.messages.length === 0">
            <div class="overlay">
                <span class="centered"
                      style="font-size: 24px;">
                    {{!!!this.topic ? `Please, select a topic...` : !!!this.refreshing ? 'No data': ''}}
                </span>
            </div>
            <div v-for="i in  Array(5).fill().map((x,i)=>i)" v-bind:key="i.toString()">
                <MessageRowPlaceholder/>
            </div>
        </template>
        <template v-else>
            <transition
                    enter-active-class="animated slideInRight anim-fast"
                    leave-active-class="animated slideOutLeft anim-fast"
                    v-if="isActive"
            >
                <transition-group
                        v-if="!this.refreshing"
                        ref="messages"
                        enter-active-class="animated slideInLeft anim-fast"
                        leave-active-class="animated slideOutRight anim-fast" tag="div">
                    <div v-for="row in this.messages.sort((m1,m2)=> m2.offset-m1.offset)"
                         v-bind:key="row.offset">
                        <MessageRow :row="row"/>
                    </div>
                </transition-group>

                <div v-else>
                    <div v-for="i in  Array(5).fill().map((x,i)=>i)" v-bind:key="i.toString()">
                        <MessageRowPlaceholder/>
                    </div>
                </div>
            </transition>
        </template>
    </div>
</template>

<script>
    import MessageRow from "./MessageRow";
    import MessageRowPlaceholder from "./MessageRowPlaceholder";

    export default {
        computed: {
            offsetActive: function () {
                return this.$store.state.messages[this.store].offsetActive;
            },
            messages: function () {
                return JSON.parse(JSON.stringify(this.$store.state.messages[this.store].messages));
            },
            isActive: function () {
                return this.$store.state.messages[this.store].isActive;
            },
            topic: function () {
                return this.$store.state.messages[this.store].topic;
            },
            search: function () {
                return this.$store.state.messages[this.store].search;
            },
            minOffset: function () {
                return this.$store.state.messages[this.store].minOffset;
            },
            maxOffset: function () {
                return this.$store.state.messages[this.store].maxOffset;
            },
            refreshing: function () {
                return this.$store.state.messages[this.store].refreshing;
            }
        },
        watch: {
            isActive: {
                immediate: true,
                handler: function (val) {
                    // if (!!val && !!!this.$store.state.messages[this.store].topic) {
                    // this.$notify.info({
                    //     title: 'Topic selection',
                    //     message: "Please, select a topic",
                    //     position: this.$store.state.messages[this.store].notificationPosition,
                    // })
                    // }

                    this.ensureStarted(() => this.start());
                }
            },
            topic: {
                immediate: true,
                handler: function () {
                    this.ensureStarted(() => this.start());
                }
            },
            search: {
                immediate: true,
                handler: function () {
                    this.ensureStarted(() => this.start());
                }
            },
            minOffset: function () {
                this.ensureStarted(() => this.start());
            },
            maxOffset: function () {
                this.ensureStarted(() => this.start());
            },
            offsetActive: function (val) {
                if (!val) {
                    this.ensureStarted(() => this.start());
                }
            }
        },
        components: {
            MessageRow,
            MessageRowPlaceholder
        },
        props: {
            store: String,
        },
        data: function () {
            return {
                subConn: null
            }
        },
        methods: {
            ensureStarted: function (cb) {
                if (!!!this.isActive || !!!this.topic) {
                    return
                }

                this.$store.commit(`messages/setRefreshing`, {store: this.store, refreshing: true});
                if (!!cb) {
                    cb();
                }
            },
            start: _.debounce(function () {
                let self = this;

                if (!!self.subConn) {
                    self.subConn.stop();
                }

                let limit = 50;

                let query = `topic=${this.topic}&limit=${limit}`;
                query += !!this.search ? `&search=${this.search}` : ``;
                query += !!this.offsetActive ? `&minOffset=${this.minOffset}&maxOffset=${this.maxOffset}` : ``;

                return setTimeout(() =>
                    self.$sub('messages', query,
                        () => {
                            self.$store.commit(`messages/truncateMsgs`, {store: self.store});
                            self.$store.commit(`messages/setRefreshing`, {store: self.store, refreshing: false});
                        },
                        (msg) => {
                            self.$store.commit(`messages/addMsg`, {store: self.store, msg: msg});
                            if (self.$store.state.messages[self.store].messages.length === limit + 1) {
                                self.$store.commit(`messages/popMsg`, {store: self.store});
                            }
                        },
                        (err) => self.$notify.error({
                            title: 'Error',
                            message: err
                        }))
                        .then(conn => {
                                if (!!conn) {
                                    self.subConn = conn;
                                }
                            }
                        ), 800);
            }, 1000)
        },
    }
</script>

<style scoped>
    .container {
        margin-top: -20px;
        overflow-y: auto;
        position: relative;
        overflow-x: hidden;
    }

    .anim-fast {
        animation-duration: 400ms;
    }

    .overlay {
        position: absolute; /* Sit on top of the page content */
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5); /* Black background with opacity */
        z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
        cursor: pointer; /* Add a pointer on hover */
        border-radius: 5px;
    }

    .centered {
        -webkit-box-align: center;
        -webkit-box-pack: center;
        display: -webkit-box;

        margin: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
</style>