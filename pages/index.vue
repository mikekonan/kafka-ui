<template>
    <el-card style="height: 98vh; margin: 5px;">
        <MessagesView style="height: 94vh;" name="TopicName"></MessagesView>
    </el-card>
</template>


<script>
    import TopicsView from "@/views/TopicsView";
    import MessagesView from "@/views/MessagesView";

    export default {
        components: {
            MessagesView,
            TopicsView,
        },
        data() {
            return {
                messageOffsets: [0, 1321313],
                topicsLoading: true,
                messagesLoading: false,
                topicSearchInput: "",
            }
        }
    };
</script>
