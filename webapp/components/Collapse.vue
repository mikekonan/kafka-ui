<template>
    <div class="colored">
        <div @mouseover="mouseover" @mouseleave="mouseleave" ref="button" @click="onClick"
             class="button el-icon-right"/>

        <div style="display: none" ref="formatted" class="inline-text">
            <prism language="json" :code="JSON.stringify(text, null, 2)"/>
        </div>
        <div ref="nonformatted" class="inline-text">
            {{text}}
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
            text: String,
        },
        mounted() {
        },
        methods: {
            mouseover: function () {
                Velocity(this.$refs.button, {scale: 1.2}, {duration: 50})
            },
            mouseleave: function () {
                Velocity(this.$refs.button, {scale: 1.1}, {duration: 50})
            },
            onClick: function () {
                this.isActive = !this.isActive;
                let emit = () => this.$emit('isActive', this.isActive);

                if (this.isActive) {
                    return Promise.all([
                        Velocity(this.$refs.button, {rotateZ: '90deg'}, {duration: 300}),
                        Velocity(this.$refs.formatted, "slideDown", {
                            delay: 150,
                            duration: 150
                        }),
                        Velocity(this.$refs.nonformatted, "slideUp", {duration: 150})
                    ])
                        .then(() => emit());
                }

                return Promise.all([
                    Velocity(this.$refs.button, {rotateZ: '0deg',}, {duration: 300}),
                    Velocity(this.$refs.formatted, "slideUp", {duration: 150}),
                    Velocity(this.$refs.nonformatted, "slideDown", {display: "inline"}, {delay: 150, duration: 150})
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

    .colored {
        color: #D8F3FF;
    }

    .button {
        display: inline-block;
        margin: 5px 0 0 5px;
        font-size: 16px;
        border-radius: 50%;
        color: white;
        background-color: #BD861F;
        transform: scale(1.1);
    }
</style>