<template>
    <div>
        <el-table
                size="mini"
                :max-height="tableHeight"
                :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
                style="width: 100%">
            <el-table-column type="expand">
                <template slot-scope="props">
                    <el-row>
                        <el-col :offset="1" :span="11">
                            <el-card>
                                <div slot="header">
                                    <span>Payload:</span>
                                </div>
                                <JsonViewer height="400px"
                                            :value="JSON.parse(props.row.payload)"></JsonViewer>
                            </el-card>
                        </el-col>
                        <el-col :offset="1" :span="11">
                            <el-card>
                                <div slot="header">
                                    <span>Metadata:</span>
                                </div>
                                <JsonViewer height="400px"
                                            :value="JSON.parse(props.row.metadata)"></JsonViewer>

                            </el-card>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>

            <el-table-column
                    label="Date"
                    prop="date">
            </el-table-column>
            <el-table-column
                    label="Name"
                    prop="name">
            </el-table-column>
            <el-table-column align="right">
                <template slot="header" slot-scope="scope">
                    <el-input
                            v-model="search"
                            size="mini"
                            placeholder="Type to search"/>
                </template>
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-s-promotion">Publish Copy</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import JsonViewer from "@/components/JsonViewer";

    export default {
        components: {
            JsonViewer
        },
        props: {
            tableHeight: Number,
            showSendDialog: false,
        },
        data() {
            return {
                tableData: Array(20).fill({
                    date: '2016-05-03',
                    name: 'Tom',
                    address: 'No. 189, Grove St, Los Angeles',
                    payload: `{"status":200,"error":"","data":[{"news_id":51184,"title":"iPhone X Review: Innovative future with real black technology","source":"Netease phone"},{"news_id":51183,"title":"Traffic paradise: How to design streets for people and unmanned vehicles in the future?","source":"Netease smart"},{"news_id":51182,"title":"Teslamask's American Business Relations: The government does not pay billions to build factories","source":"AI Finance","members":["Daniel","Mike","John"]}]}`,
                    metadata: `{"key":"value"}`,
                }),
                search: '',
            }
        },
        methods: {},
    }
</script>
