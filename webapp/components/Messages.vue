<template>
    <div ref="container" class="background container" :style="`height: ${this.$vssHeight - 130}px;`">
        <!--        <el-button @click='addTestData'>add</el-button>-->
        <!--        <el-button @click='removeTestData'>remove</el-button>-->
        <transition-group
                ref="messages"
                enter-active-class="animated slideInLeft anim-fast"
                leave-active-class="animated slideOutRight anim-fast" tag="div">
            <div v-for="row in rows" v-bind:key="row.toString()">
                <MessageRow :row="row"/>
            </div>
        </transition-group>
    </div>
</template>

<script>
    import Velocity from "velocity-animate";
    import MessageRow from "./MessageRow";

    export default {
        components: {
            MessageRow,
        },
        props: {
            showSendDialog: false,
        },
        data() {
            return {
                rows: Array(0)
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
                this.rows.unshift({
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
                                "adsa": {"das": ['dsada'], "zzz": {"zzz": "aaa", "bbb": "qqqq"}},
                                "adsaa": {"das": ['dsada'], "zzz": {"zzz": "aaa", "bbb": "qqqq"}}
                            }
                        }
                    },
                    "size": 86,
                    "timestamp": 1577007355930,
                    "topic": "choreographer.update-merchant"
                });
            },
            removeTestData: function () {
                this.rows.pop();
            },
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