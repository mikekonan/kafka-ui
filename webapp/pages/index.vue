<template>
    <div>
        <SendDialog :closedFunc="()=>{this.showSendDialog=false}" :show="showSendDialog"/>
        <el-button v-if="isSingle" circle style="right: 15px; bottom:60px; z-index: 10; position: absolute;"
                   @click="isSingle = false"
                   icon="el-icon-circle-plus-outline"/>
        <el-button v-else circle style="right: 15px; bottom:60px; z-index: 10; position: absolute;"
                   @click="isSingle = true"
                   icon="el-icon-remove-outline"/>
        <el-button circle style="right: 15px; bottom:15px; z-index: 10; position: absolute;"
                   @click="showSendDialog = true"
                   type="primary"
                   icon="el-icon-s-promotion"/>

        <el-row :gutter="10">
            <transition enter-active-class="animated slideInRight"
                        leave-active-class="animated slideOutRight">
                <el-col ref="first" :span="isSingle ? 24: 12">
                    <!--                    <MessagesView style="height: 98vh;"></MessagesView>-->
                    <MessagesView></MessagesView>

                </el-col>
            </transition>

            <transition enter-active-class="animated slideInRight"
                        leave-active-class="animated slideOutRight">
                <el-col ref="second" v-show="!isSingle" :span="12">
                    <MessagesView></MessagesView>
                </el-col>
            </transition>
        </el-row>
    </div>
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
        methods: {},
        mounted: function () {
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
