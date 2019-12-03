<template>
    <MessagesView style="height: 94vh;" :name="topicName"></MessagesView>
</template>

<script>
    import MessagesView from "@/views/MessagesView";

    export default {
        computed: {
            topicName: function () {
                return this.$nuxt.$route.path.replace('/topic/', '');
            }
        },
        components: {
            MessagesView,
        },
        data() {
            return {}
        }
    }

</script>