<template>
    <div class="card secondary-background" ref="message-row" @mouseover="mouseover" @mouseleave="mouseleave"
         style="margin-top: 15px; margin-bottom: 5px;">
        <transition enter-active-class="animated slideInRightCustom animation"
                    leave-active-class="animated slideOutRightCustom animation">
            <div ref="buttons" v-show="hovered" key="copyToTheSendDialog"
                 :style="`float: right;`">
                <el-tooltip class="button" effect="dark" content="Copy message to the send menu" placement="left">
                    <el-button class="primary-button" size="mini"
                               circle
                               icon="el-icon-s-promotion"/>
                </el-tooltip>

                <el-tooltip class="button" effect="dark" content="Send a copy of the message" placement="left">
                    <el-button class="secondary-button" size="mini"
                               circle
                               icon="el-icon-s-promotion"/>
                </el-tooltip>
            </div>
        </transition>
        <div style="min-height: 80px">
            <template v-for="name in
                    ['at', 'offset', 'id', 'partition', 'size', 'timestamp','topic']
                            .filter(e=>!$store.state['message-prop']['ignoredProps'].includes(e))">
                <Chip :filterOnTrash="true" :copy="true" color="blue" :name="name" :value="row[name].toString()"/>
            </template>

            <template v-for="header in row.headers">
                <template
                        v-for="name in Object.keys(header).filter(e=>!$store.state['message-prop']['ignoredProps'].includes(e))">
                    <Chip :filterOnTrash="true" :copy="true" color="green" :name="`${name.toString()}`"
                          :value="header[name].toString()"/>
                </template>
            </template>
        </div>
        <el-divider class="straight-secondary divider"/>
        <Collapse :obj="row.payload"/>
    </div>
</template>

<script>
    import '~/assets/buttonSlide.css'
    import Collapse from "./Collapse";
    import Chip from "./Chip";

    export default {
        data: function () {
            return {
                yButtonPos: 0,
                hovered: false
            }
        },
        components: {
            Collapse,
            Chip
        },
        props: {
            row: Object
        },
        computed: {},
        mounted: function () {
        },
        methods: {
            mouseover: function () {
                this.hovered = true;
            },
            mouseleave: function () {
                this.hovered = false;
            },
        },
    }

</script>

<style scoped>
    .button {
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin: 5px;
        z-index: 10;
    }

    .card {
        margin: 0 10px 0 10px;
        box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.3);
        transition: 0.05s;
        border-radius: 10px; /* 5px rounded corners */
    }

    .divider {
        margin-top: 5px;
        margin-bottom: 0;
    }

    .card:hover {
        -webkit-transform: scale(1.005);
        -ms-transform: scale(1.005);
        transform: scale(1.005);
        background: linear-gradient(90deg, rgba(34, 47, 62, 1) 0%, rgba(16, 88, 108, 1) 50%, rgba(34, 47, 62, 1) 100%);
    }
</style>