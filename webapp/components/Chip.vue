<template>
    <div class="chip">
        <div @click="copyName" :style="`background-color: ${colors[color]}`" class="key">{{name}}</div>
        <span @click="copyValue">
              {{value}}
        </span>
        <div class="trash-stub"></div>
        <div @click="ignore" class="trash el-icon-delete"></div>
    </div>
</template>

<script>
    export default {
        methods: {
            ignore: function () {
                this.$store.commit('message-prop/ignoreProp', this.name);
                // console.log(this.$store.state['message-prop']['ignoredProps']);

                // alert(this.name)
            },
            copyName: function () {
                this.$copyText(this.name).catch(e => console.log(e));
            },
            copyValue: function () {
                this.$copyText(this.value).catch(e => console.log(e));
            }
        },
        components: {},
        props: {
            name: String,
            value: String,
            color: String,
        },
        data() {
            return {
                colors: {blue: '#409EFF', red: '#F56C6C', green: '#67C23A', orange: '#E6A23C'}
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
        background-color: #f5454a;
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
        margin: 5px 5px 5px 5px;
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