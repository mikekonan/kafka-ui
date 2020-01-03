<template>
    <el-card class="vld-parent background" style="margin: 5px; width: 100%;">
        <div slot="header">
            <el-row>
                <el-col :span="12">
                    <span>Topics:</span>
                </el-col>
                <el-col :span="12">
                    <el-button icon="el-icon-refresh-right" @click="refresh" :loading="refreshing"
                               style="float: right;margin-top: -5px;"
                               round size="mini">
                        Refresh
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <el-input
                style="width: 100%;"
                placeholder="Topic name"
                v-model="topicSearchInput"
                clearable
                size="mini"
        >
        </el-input>
        <loading
                loader="bars"
                :active.sync="topicsLoading"
                :is-full-page="false"
                size="25px"
                color="#008489"/>
        <el-divider class="straight-secondary"/>
        <TopicsTable :selectedTopic="selectedTopic"/>
    </el-card>
</template>

<script>
    import TopicsTable from '@/components/TopicsTable';

    export default {
        watch: {
            topicSearchInput: function (val) {
                this.$store.commit('topics/setSearch', val)
            }
        },
        beforeMount: function () {
            this.$store.commit('topics/setTopics', ['topic1', 'topic2', 'topic3'])
        },
        props: {
            selectedTopic: String
        },
        components: {TopicsTable},
        mounted: function () {
            this.load();
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
                self.topicsLoading = true;
                setTimeout(() => {
                    self.topicsLoading = false
                    cb()
                }, 5000)
            },
        },
        data() {
            return {
                refreshing: false,
                topicsLoading: false,
                topicSearchInput: "",
            }
        }
    };
</script>