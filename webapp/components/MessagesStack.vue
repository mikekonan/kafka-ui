<template>
    <div ref="container" class="background container" :style="`height: ${this.$vssHeight - 130}px;`">
        <!--        <el-button @click='addTestData'>add</el-button>-->
        <!--        <el-button @click='removeTestData'>remove</el-button>-->
        <transition-group
                ref="messages"
                enter-active-class="animated slideInLeft anim-fast"
                leave-active-class="animated slideOutRight anim-fast" tag="div">
            <div v-for="item in data" v-bind:key="item.toString()" class="card secondary-background">
                <div style="margin-top: 15px; margin-bottom: 5px;">
                    <template v-for="name in
                    ['at', 'offset', 'id', 'partition', 'size', 'timestamp','topic']
                            .filter(e=>!$store.state['message-prop']['ignoredProps'].includes(e))">
                        <Chip color="blue" :name="name" :value="item[name].toString()"/>
                    </template>

                    <template v-for="header in item.headers">
                        <template
                                v-for="name in Object.keys(header).filter(e=>!$store.state['message-prop']['ignoredProps'].includes(e))">
                            <Chip color="green" :name="`${name.toString()}`" :value="header[name].toString()"/>
                        </template>
                    </template>

                    <el-divider class="straight-secondary divider"/>

                    <Collapse :text="item.payload"/>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script>
    import Chip from "./Chip";
    import Collapse from "./Collapse";
    import Velocity from "velocity-animate";

    export default {
        components: {
            Chip,
            Collapse
        },
        props: {
            showSendDialog: false,
        },
        data() {
            return {
                data: Array(0)
            }
        },
        mounted: function () {
            Velocity(this.$refs.messages, "scroll", {container: this.$refs.container});
            for (let i = 0; i < 20; i++) {
                this.addTestData();
            }
        },
        methods: {
            addTestData: function () {
                this.data.unshift({
                    "at": "Sun Dec 22 2019 09:35:55 GMT+00:00",
                    "headers": [
                        {
                            "x-choreographer-event": "ChoreographerStepStarted"
                        },
                        {
                            "x-choreographer-saga-id": "d9ecdf8c-4327-4fa5-8214-0bebc4c40c3f"
                        },
                        {
                            "merchant-id": "7a7dc7ee-6087-46cd-97a2-95d3e7252946"
                        },
                        {
                            "x-choreographer-step-id": "start"
                        },
                        {
                            "x-choreographer-append-context": "id=>merchant.id;title=>merchant.title;"
                        }
                    ],
                    "id": "11151344-916d-40c3-9330-e0d41de1164a",
                    "offset": 1055,
                    "partition": 0,
                    "payload": {
                        "data": {
                            "merchant": {
                                "id": "7a7dc7ee-6087-46cd-97a2-95d3e7252946",
                                "title": "newTitle",
                                "array": ["1", "2"],
                                "adsa": {"das": ['dsada'], "zzz": {"zzz": "aaa", "bbb": "qqqq"}}
                            }
                        }
                    },
                    "size": 86,
                    "timestamp": 1577007355930,
                    "topic": "choreographer.update-merchant"
                });
            },
            removeTestData: function () {
                this.data.pop();
            },
            extractPropValues(obj) {
                let rez = {};
                const isObject = val => typeof val === 'object' && !Array.isArray(val);

                const addDelimiter = (a, b) => a ? `${a}.${b}` : b;

                const putProp = (obj, k, v) => {
                    obj[k] = v;
                    return obj;
                };

                const paths = (obj = {}, head = '') => {
                    return Object.entries(obj)
                        .reduce((rez, [key, value]) => {
                            let fullPath = addDelimiter(head, key);

                            if (isObject(value)) {
                                return paths(value, addDelimiter(head, key))
                            }

                            return putProp(rez, fullPath, value);
                        }, rez);
                };

                return paths(obj);
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

    .divider {
        margin-top: 5px;
        margin-bottom: 0;
    }

    .anim-fast {
        animation-duration: 250ms;
    }

    .card {
        margin: 0 10px 0 10px;
        box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.3);
        transition: 0.05s;
        border-radius: 10px; /* 5px rounded corners */
    }

    .card:hover {
        -webkit-transform: scale(1.0005);
        -ms-transform: scale(1.0005);
        transform: scale(1.0005);
        background: rgb(34, 47, 62);
        background: linear-gradient(90deg, rgba(34, 47, 62, 1) 0%, rgba(16, 88, 108, 1) 50%, rgba(34, 47, 62, 1) 100%);
    }
</style>