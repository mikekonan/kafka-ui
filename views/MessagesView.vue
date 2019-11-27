<template>
    <el-card class="vld-parent" style="margin: 5px; width: 100%;">
        <SendDialog :closedFunc="this.closeDialog" :show="showSendDialog"></SendDialog>

        <loading
                loader="bars"
                :active.sync="messagesLoading"
                :is-full-page="false"
                size="25px"
                color="#409EFF"
        />

        <el-row>
            <el-col :span="22">
                <h2>Messages for topic '{{name}}':</h2>
            </el-col>
            <el-col :span="2">
                <el-button icon="el-icon-refresh-right" @click="refresh" :loading="refreshing" style="float: right;"
                           round size="small">
                    Refresh
                </el-button>
            </el-col>
        </el-row>

        <el-divider></el-divider>
        <el-row style="margin: 5px;">
            <el-col :offset="1" :span="18">
                <el-slider :min="minOffsetVal" :max="maxOffsetVal" v-model="messageOffsets" range>
                </el-slider>
            </el-col>
            <el-col :offset="1" :span="4">
                <el-button @click="showSendDialog = true" type="primary" icon="el-icon-s-promotion">Publish Message
                </el-button>
            </el-col>
        </el-row>
        <el-row>
            <MessagesTable :tableHeight="tableHeight"></MessagesTable>
        </el-row>
    </el-card>
</template>

<script>
    import MessagesTable from '@/components/MessagesTable.vue';
    import SendDialog from '@/components/SendDialog.vue';

    export default {
        computed: {
            tableHeight: function () {
                return this.$vssHeight - 250;
            }
        },
        methods: {
            refresh: function () {
                let self = this;
                self.refreshing = true;
                self.load(
                    () => {
                        self.refreshing = false
                    }
                );
            },
            load: function (cb) {
                let self = this;
                self.messagesLoading = true;
                setTimeout(() => {
                    self.messagesLoading = false
                    cb()
                }, 5000)
            },
            closeDialog: function () {
                this.showSendDialog = false
            }
        },
        mounted: function () {
            this.load()
        },
        props: {
            name: String
        },
        components: {
            MessagesTable,
            SendDialog
        },
        data() {
            return {
                refreshing: false,
                showSendDialog: false,
                minOffsetVal: 0,
                maxOffsetVal: 200,
                messageOffsets: [50, 150],
                messagesLoading: false,
            }
        }
    };
</script>