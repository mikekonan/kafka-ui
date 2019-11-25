<template>
    <el-card class="vld-parent" style="margin: 5px; width: 100%;">
        <div slot="header">
            <span>Topics:</span>
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
                size="25px">
        </loading>

        <el-divider></el-divider>

        <TopicsTable :selectedTopic="selectedTopic"></TopicsTable>
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
        data() {
            return {
                topicsLoading: false,
                topicSearchInput: "",
            }
        }
    };
</script>