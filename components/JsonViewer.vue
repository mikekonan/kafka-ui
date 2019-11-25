<template>
    <div>
        <v-jsoneditor v-model="value" :options="getOptions()" :height="height"></v-jsoneditor>
    </div>
</template>

<script>
    export default {
        components: {},
        props: {
            value: Object,
            height: String,
        },
        methods: {
            getOptions: function () {
                let self = this;
                return {
                    onEditable: () => false,
                    mode: "code",
                    mainMenuBar: false,
                }
            },
        },
    }
</script>