<template>
        <el-card class="vld-parent" style="width: 99%;">
            <loading
                    loader="bars"
                    :active.sync="messagesLoading"
                    :is-full-page="false"
                    size="25px"
                    color="#409EFF"
            />

            <el-row>
                <el-col :span="5">
                    <el-select @change="refresh" size="small" style="width: 100%;" v-model="selectedTopic" filterable
                               placeholder="Select a topic">
                        <el-option v-for="item in topics"
                                   :key="item"
                                   :label="item"
                                   :value="item">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :offset="1" :span="8">
                    <el-slider @change="refresh" :min="minOffsetVal" :max="maxOffsetVal" v-model="messageOffsets" range>
                    </el-slider>
                </el-col>
                <el-col :offset="1" :span="9">
                    <el-input
                            @change="refresh"
                            size="small"
                            placeholder="Search"
                            v-model="search"
                            clearable>
                    </el-input>
                </el-col>
            </el-row>
            <el-divider></el-divider>
            <el-row>
                <MessagesTable @search-change="refresh" :tableHeight="tableHeight"></MessagesTable>
            </el-row>
        </el-card>
</template>

<script>
    import MessagesTable from '@/components/MessagesStack.vue';

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
                    self.messagesLoading = false;
                    cb()
                }, 1000)
            },
        },
        mounted: function () {
            this.load()
        },
        components: {
            MessagesTable,
        },
        data() {
            return {
                topics: ["a1", "a2"],
                selectedTopic: "",
                search: "",
                refreshing: false,
                minOffsetVal: 0,
                maxOffsetVal: 200,
                messageOffsets: [50, 150],
                messagesLoading: false,
            }
        }
    };
</script>