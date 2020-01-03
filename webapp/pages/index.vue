<template>
    <div>
        <SendDialog :closedFunc="()=>{this.showSendDialog=false}" :show="showSendDialog"/>
        <SettingsDialog :splitMode="splitMode" :closedFunc="()=>{this.showSettingsDialog=false}"
                        :show="showSettingsDialog"/>

        <div class="buttons secondary-background">
            <el-tooltip class="button" effect="dark" content="Send message" placement="right">
                <el-button @click="openSendDialog" class="primary-button" size="mini"
                           circle
                           icon="el-icon-s-promotion"/>
            </el-tooltip>
            <el-tooltip class="button" effect="dark" content="Open settings" placement="right">
                <el-button @click="openSettingsDialog" class="secondary-button" size="mini"
                           circle
                           icon="el-icon-s-tools"/>
            </el-tooltip>
        </div>

        <el-row :gutter="10">
            <transition enter-active-class="animated slideInRight"
                        leave-active-class="animated slideOutRight">
                <el-col ref="first" :span="!!!this.$store.state['split-view']['splitMode'] ? 24: 12">
                    <MessagesView/>
                </el-col>
            </transition>

            <transition enter-active-class="animated slideInRight"
                        leave-active-class="animated slideOutRight">
                <el-col ref="second" v-show="!!this.$store.state['split-view']['splitMode']" :span="12">
                    <MessagesView/>
                </el-col>
            </transition>
        </el-row>
    </div>
</template>

<script>
    import TopicsView from "@/views/TopicsView";
    import MessagesView from "@/views/MessagesView";
    import SendDialog from '@/components/SendDialog.vue';
    import SettingsDialog from "@/components/SettingsDialog";

    export default {
        components: {
            SettingsDialog,
            MessagesView,
            TopicsView,
            SendDialog
        },
        methods: {
            openSendDialog() {
                this.showSendDialog = true;
            },
            openSettingsDialog() {
                this.showSettingsDialog = true;
            }
        },
        mounted: function () {
        },
        data() {
            return {
                showSendDialog: false,
                showSettingsDialog: false,
                messageOffsets: [0, 1321313],
                topicsLoading: true,
                messagesLoading: false,
                topicSearchInput: "",
            }
        }
    };
</script>

<style scoped>
    .button {
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin: 5px 5px 5px 2px;
        z-index: 10;
    }

    .buttons {
        border-radius: 6px;
        margin-left: -8px;
        top: 112px;
        height: 70px;
        width: 32px;
        position: absolute;
        z-index: 2000;
    }
</style>