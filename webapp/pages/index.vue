<template>
    <div>
        <SendDialog :closedFunc="()=>{this.showSendDialog=false}" :show="showSendDialog"/>
        <SettingsDialog :splitMode="this.splitMode"
                        :closedFunc="()=>{this.showSettingsDialog=false}"
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
                <el-col ref="first"
                        :span="this.splitMode ? 12: 24">
                    <MessagesContainer store="store1"/>
                </el-col>
            </transition>

            <transition enter-active-class="animated slideInRight"
                        leave-active-class="animated slideOutRight">
                <el-col ref="second" v-show="this.splitMode" :span="12">
                    <MessagesContainer store="store2"/>
                </el-col>
            </transition>
        </el-row>
    </div>
</template>

<script>
    import MessagesContainer from "../components/message/MessagesContainer";
    import SendDialog from '../components/dialog/SendDialog.vue';
    import SettingsDialog from "../components/dialog/SettingsDialog";

    export default {
        computed: {
            splitMode: function () {
                return !!this.$store.state.messages['store1'].isActive && !!this.$store.state.messages['store2'].isActive;
            }
        },
        components: {
            SettingsDialog,
            MessagesContainer,
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
            this.$sub(
                'topics',
                null,
                () => this.$store.commit(`topics/truncate`),
                (msg) => this.$store.commit(`topics/add`, msg),
                (err) => this.$notify.error({
                    title: 'Error',
                    message: err
                })
            )
        },
        data() {
            return {
                showSendDialog: false,
                showSettingsDialog: false,
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