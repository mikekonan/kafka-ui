<template>
    <div>
        <nuxt/>
    </div>
</template>

<script>
    import "~/assets/global.css"

    export default {
        components: {},
        mounted() {
            document.querySelector('body').className = "background"
        },
        data() {
            return {}
        }
    };

</script>

<style>

</style>