<template>
    <div ref="container" class="container" :style="`height: ${this.$vssHeight - 130}px;`">
        <transition
                enter-active-class="animated slideInRight anim-fast"
                leave-active-class="animated slideOutLeft anim-fast"
                v-if="isActive"
        >
            <transition-group
                    v-if="!this.$store.state.messages[this.store].refreshing"
                    ref="messages"
                    enter-active-class="animated slideInLeft anim-fast"
                    leave-active-class="animated slideOutRight anim-fast" tag="div">
                <div v-for="row in this.$store.state.messages[this.store].messages" v-bind:key="row.offset">
                    <MessageRow :row="row"/>
                </div>
            </transition-group>

            <div ref="messagesPlaceholder" v-else>
                <div v-for="i in  Array(20).fill().map((x,i)=>i)" v-bind:key="i.toString()">
                    <MessageRowPlaceholder/>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import MessageRow from "./MessageRow";
    import MessageRowPlaceholder from "./MessageRowPlaceholder";

    export default {
        computed: {
            isActive: function () {
                return this.$store.state.messages[this.store].isActive;
            },
            topic: function () {
                return this.$store.state.messages[this.store].topic;
            },
            search: function () {
                return this.$store.state.messages[this.store].search;
            }
        },
        watch: {
            isActive: {
                immediate: true,
                handler: function (val) {
                    if (!!val && !!!this.$store.state.messages[this.store].topic) {
                        this.$notify.info({
                            title: 'Topic selection',
                            message: "Please, select a topic",
                            position: this.$store.state.messages[this.store].notificationPosition,
                        })
                    }

                    this.start();
                }
            },
            topic: {
                immediate: true,
                handler: function () {
                    this.start();
                }
            },
            search: {
                immediate: true,
                handler: function () {
                    this.start();
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
        methods: {
            start: function () {
                if (!!!this.isActive || !!!this.topic) {
                    return
                }

                let self = this;

                self.$store.commit(`messages/stopSubConn`, {store: this.store});
                self.$store.commit(`messages/setRefreshing`, {store: this.store, refreshing: true});

                let limit = 50;

                return self.$sub('messages', `topic=${this.topic}&search=${this.search}`,
                    () => {
                        self.$store.commit(`messages/truncateMsgs`, {store: this.store});
                        self.$store.commit(`messages/setRefreshing`, {store: this.store, refreshing: false});
                    },
                    (msg) => {
                        self.$store.commit(`messages/addMsg`, {store: this.store, msg: msg});

                        if (self.$store.state.messages[this.store].messages.length === limit + 1) {
                            self.$store.commit(`messages/popMsg`, {store: this.store});
                        }
                    },
                    (err) => self.$notify.error({
                        title: 'Error',
                        message: err
                    }))
                    .then(conn => {
                            if (!!conn) {
                                self.$store.commit(`messages/setSubConn`, {store: this.store, subConn: conn})
                            }
                        }
                    );
            }
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
        animation-duration: 250ms;
    }
</style>