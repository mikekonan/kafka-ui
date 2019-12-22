<template>
    <div style="margin-top: -20px;">
        <!--        <el-button @click='addTestData'>add</el-button>-->
        <!--        <el-button @click='removeTestData'>remove</el-button>-->

        <transition-group
                enter-active-class="animated slideInLeft anim-fast"
                leave-active-class="animated slideOutRight anim-fast" tag="div">
            <div v-for="item in data" v-bind:key="item" class="card">
                <div style="margin-top: 5px; margin-bottom: 5px;">
                    <template v-for="name in ['at', 'offset', 'id', 'partition', 'size', 'timestamp','topic']">
                        <Chip color="blue" :name="name" :value="item[name]"></Chip>
                    </template>

                    <template v-for="header in item.headers">
                        <template v-for="name in Object.keys(header)">
                            <Chip color="green" :name="`${name}`" :value="header[name]"></Chip>
                        </template>
                    </template>

                    <template v-for="(propVal,propName) in extractPropValues(item.payload)">
                        <Chip color="orange" :name="propName" :value="propVal"></Chip>
                    </template>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script>
    import Chip from "./Chip";

    export default {
        components: {
            Chip
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
    .anim-fast {
        animation-duration: 250ms;
    }

    .card {
        margin: 0 10px 0 10px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3);
        transition: 0.25s;
        border-radius: 5px; /* 5px rounded corners */
    }

    .card:hover {
        -webkit-transform: scale(1.01);
        -ms-transform: scale(1.01);
        transform: scale(1.01);
        background-color: #F2F6FC;
    }
</style>