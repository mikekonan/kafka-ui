<template>
    <el-table
            @current-change="rowSelected"
            highlight-current-row
            ref="topicsTable"
            size="mini"
            :data="tableData.filter(data => !this.searchVal || data.topic.toLowerCase().includes(this.searchVal.toLowerCase()))"
            :show-header="false">
        <el-table-column
                property="topic"
                label="Topic"
        >
        </el-table-column>
    </el-table>
</template>

<script>
    export default {
        computed: {
            topics: function () {
                return this.$store.state.topics.topicsState.topics;
            },
            searchVal: function () {
                return this.$store.state.topics.search;
            }
        },
        watch: {
            topics: function () {
                this.updateTableData()
            }
        },
        data() {
            return {
                tableData: [],
            }
        },
        props: {
            selectedTopic: String,
        },
        mounted: function () {
            this.updateTableData();
            this.setCurrent(this.selectedTopic);
        },
        methods: {
            updateTableData() {
                this.tableData = this.$store.state.topics.topicsState.topics.map(t => {
                    return {"topic": t}
                })
            },
            setCurrent(topicName) {
                let row = this.tableData.find(r => r.topic === topicName);
                if (!!row) {
                    this.$refs.topicsTable.setCurrentRow(row);
                }
            },
            rowSelected(row) {
                if (!!row) {
                    this.setCurrent(row);
                    this.$nuxt.$router.push(`/topic/${row.topic}`);
                }
            }
        }
    }
</script>