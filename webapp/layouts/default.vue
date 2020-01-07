<template>
    <nuxt/>
</template>

<script>
    import "~/assets/global.css"

    export default {
        components: {},
        mounted() {
            document.querySelector('body').className = "background"
        }
    };
</script>