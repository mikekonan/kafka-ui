<template>
    <div class="chip">
        <div @click="copyName" :style="`background-color: ${colors[color]}`" class="key">{{name}}</div>
        <span style="color: #51422E;" v-if="!!value" @click="copyValue">
              {{value}}
        </span>
        <div class="trash-stub"></div>
        <div style="color: #51422E;" @click="onTrash" class="trash el-icon-delete"></div>
    </div>
</template>

<script>
    export default {
        methods: {
            copyName: function () {
                if (!!this.copy) {
                    this.$copyText(this.name).catch(e => console.log(e));
                }
            },
            copyValue: function () {
                if (!!this.copy) {
                    this.$copyText(this.value).catch(e => console.log(e));
                }
            }
        },
        components: {},
        props: {
            onTrash: Function,
            filterOnTrash: Boolean,
            copy: Boolean,
            name: String,
            value: String,
            color: String,
        },
        data() {
            return {
                colors: {blue: '#0099FA', red: '#F56C6C', green: '#008489', orange: '#BD861F'}
            }
        },
    }
</script>

<style>
    .trash-stub {
        width: 12px;
        padding: 0 5px;
        margin-right: -10px;
        height: 12px;
        line-height: 20px;
        border-radius: 10px;
        display: inline-block;
    }

    .trash {
        padding: 0 5px;
        margin-right: -10px;
        height: 20px;
        line-height: 20px;
        border-radius: 10px;
        background-color: red;
        display: none;
    }

    .trash:hover {
        -webkit-transform: scale(1.1);
        -ms-transform: scale(1.1);
        transform: scale(1.1);
    }

    .key {
        display: inline-block;
        padding: 0 10px;
        margin-left: -10px;
        height: 20px;
        line-height: 20px;
        border-radius: 10px;
        color: white;
    }

    .chip {
        margin: 5px 0 0 5px;
        background-color: rgb(224, 224, 224);
        display: inline-block;
        padding: 0 10px;
        height: 20px;
        font-size: 13px;
        line-height: 20px;
        border-radius: 10px;
    }

    .chip:hover .trash {
        display: inline-block;
    }

    .chip:hover .trash-stub {
        display: none;
    }

    .chip:hover {
        -webkit-transform: scale(1.01);
        -ms-transform: scale(1.01);
        transform: scale(1.01);
        background-color: rgb(200, 200, 200);
    }
</style>