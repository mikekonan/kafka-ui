<template>
    <div class="collapse">
        <el-tooltip class="button" effect="dark" content="Copy to buffer" placement="left">
            <div
                    @mouseover="copyMouseover" @mouseleave="copyMouseleave" @click="copyJson"
                    ref="copyButton"
                    style="border-color:#008489; color: white;background-color: #008489; float: right;"
                    class="button ">
                <i style="margin-left: 3px; font-size: 14px;" class="el-icon-copy-document"/>
            </div>
        </el-tooltip>

        <div @mouseover="expandMouseover" @mouseleave="expandMouseleave" ref="button" @click="onExpandClick"
             class="button">
            <i style="margin-left: 3px; font-size: 14px;" class="el-icon-right"/>
        </div>


        <div style="display: none" ref="formatted">
            <prism language="json" :code="JSON.stringify(obj, null, 4)"/>
        </div>
        <div ref="nonformatted" class="inline-text">
            {{JSON.stringify(obj)}}
        </div>
    </div>
</template>

<script>
    import Velocity from 'velocity-animate'
    import Prism from 'vue-prismjs'
    import '~/assets/prism.css'

    export default {
        components: {
            Prism
        },
        data() {
            return {
                isActive: false
            }
        },
        props: {
            obj: Object,
        },
        mounted() {
        },
        methods: {
            copyJson: function () {
                this.$copyText(JSON.stringify(this.obj, null, 4)).catch(e => console.log(e));
            },
            copyMouseover: function () {
                return Velocity(this.$refs.copyButton, {scale: 1.2}, {duration: 50})
            },
            copyMouseleave: function () {
                return Velocity(this.$refs.copyButton, {scale: 1.0}, {duration: 50})
            },
            expandMouseover: function () {
                return Velocity(this.$refs.button, {scale: 1.2}, {duration: 50})
            },
            expandMouseleave: function () {
                return Velocity(this.$refs.button, {scale: 1.0}, {duration: 50})
            },
            onExpandClick: function () {
                this.isActive = !this.isActive;
                let emit = () => this.$emit('isActive', this.isActive);

                if (this.isActive) {
                    return Promise.all([
                        Velocity(this.$refs.button, {rotateZ: '90deg'}, {duration: 200}),
                        Velocity(this.$refs.formatted, "slideDown", {
                            delay: 100,
                            duration: 100
                        }),
                        Velocity(this.$refs.nonformatted, "slideUp", {duration: 100})
                    ])
                        .then(() => emit());
                }

                return Promise.all([
                    Velocity(this.$refs.button, {rotateZ: '0deg',}, {duration: 200}),
                    Velocity(this.$refs.formatted, "slideUp", {duration: 100}),
                    Velocity(this.$refs.nonformatted, "slideDown", {display: "inline"}, {delay: 100, duration: 100})
                ]).then(() => emit());
            },
        },
    }
</script>

<style scoped>
    .inline-text {
        margin-left: 5px;
        display: inline;
    }

    .collapse {
        color: #D8F3FF;
        padding-bottom: 5px;
    }

    .button {
        display: inline-block;
        margin: 5px 5px 0;
        font-size: 16px;
        border-radius: 50%;
        color: white;
        background-color: #E09F20;
        width: 20px;
        height: 20px;
    }
</style>