<template>
    <el-card class="vld-parent background straight-secondary-border">
        <loading
                loader="bars"
                :active.sync="messagesLoading"
                :is-full-page="false"
                size="25px"
                color="#8ED97E"
        />

        <el-row :gutter="20">
            <el-col :span="6">
                <el-select @change="refresh" size="small" style="width: 100%; margin-top: 5px;" v-model="selectedTopic"
                           filterable
                           placeholder="Select a topic">
                    <el-option v-for="item in topics"
                               :key="item"
                               :label="item"
                               :value="item">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="9">
                <el-row :gutter="5">
                    <div class="separated straight-secondary"></div>
                    <el-col :span="4">
                        <el-switch @change="refresh" style="left: 5px; margin-top: 8px;" v-model="offsetEnabled"/>
                    </el-col>
                    <el-col :span="20">
                        <el-slider :disabled="!offsetEnabled" @change="refresh" :min="minOffsetVal" :max="maxOffsetVal"
                                   v-model="messageOffsets" range>
                        </el-slider>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="9">
                <el-row>
                    <div class="separated straight-secondary"></div>
                    <el-input
                            @change="refresh"
                            size="small"
                            placeholder="Search"
                            v-model="search"
                            clearable>
                    </el-input>
                </el-row>

            </el-col>
        </el-row>
        <el-divider class="straight-secondary"></el-divider>
        <el-row>
            <el-button size="small" circle style="right: 15px; top:-10px; z-index: 10; position: absolute;"
                       @click="showSendDialog = true"
                       icon="el-icon-setting"/>
            <MessagesStack @search-change="refresh"></MessagesStack>
        </el-row>
    </el-card>
</template>

<script>
    import MessagesStack from '@/components/MessagesStack.vue';

    export default {
        computed: {},
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
                    self.messagesLoading = false;
                    cb()
                }, 1000)
            },
        },
        mounted: function () {
            this.load()
        },
        components: {
            MessagesStack,
        },
        data() {
            return {
                topics: ["a1", "a2"],
                selectedTopic: "",
                search: "",
                refreshing: false,
                minOffsetVal: 0,
                maxOffsetVal: 200,
                offsetEnabled: false,
                messageOffsets: [50, 150],
                messagesLoading: false,
            }
        }
    };
</script>

<style scoped>
    .separated {
        left: -8px;
        margin-top: -15px;
        position: absolute;
        border-left: 1px solid;
        height: 67px;
    }
</style>