<template>
    <el-row>
        <SendDialog :closedFunc="()=>{this.showSendDialog=false}" :show="showSendDialog"></SendDialog>
        <el-button v-if="isSingle" circle style="right: 20px; bottom:55px; z-index: 10; position: absolute;"
                   @click="isSingle = false"
                   icon="el-icon-circle-plus-outline"/>
        <el-button v-else circle style="right: 20px; bottom:55px; z-index: 10; position: absolute;"
                   @click="isSingle = true"
                   icon="el-icon-remove-outline"/>
        <el-button circle style="right: 20px; bottom:10px; z-index: 10; position: absolute;"
                   @click="showSendDialog = true"
                   type="primary"
                   icon="el-icon-s-promotion"/>
        <template style="position: relative;">
            <el-col :span="isSingle ? 24  : 12">
                <MessagesView style="height: 98vh;"></MessagesView>
            </el-col>
            <el-col :span="isSingle ? 0  : 12">
                <MessagesView style="height: 98vh;"></MessagesView>
            </el-col>
        </template>
    </el-row>
</template>

<script>
    import TopicsView from "@/views/TopicsView";
    import MessagesView from "@/views/MessagesView";
    import SendDialog from '@/components/SendDialog.vue';

    export default {
        components: {
            MessagesView,
            TopicsView,
            SendDialog
        },
        data() {
            return {
                isSingle: true,
                showSendDialog: false,
                messageOffsets: [0, 1321313],
                topicsLoading: true,
                messagesLoading: false,
                topicSearchInput: "",
            }
        }
    };
</script>
