<template>
    <nuxt/>
</template>

<script>
    import TopicsView from "@/views/TopicsView";

    export default {
        components: {
            TopicsView,
        },
        mounted() {
            document.querySelector('body').className = "background"
        },
        data() {
            return {}
        }
    };

</script>