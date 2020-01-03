<template>
    <el-dialog width="1500px" @closed="closedFunc" :visible.sync="show">
        <el-row>
            <el-col :offset="1">
                <el-select size="mini"
                           v-model="selectedTopic" filterable placeholder="Select topic">
                    <el-option
                            v-for="item in this.$store.state.topics.topicsState.topics"
                            :key="item"
                            :label="item"
                            :value="item">
                    </el-option>
                </el-select>
            </el-col>
        </el-row>
        <div style="margin: 20px 0;"></div>
        <el-row style="height: 500px;">
            <el-col :offset="1" :span="11">
                <el-card style="height: 500px;">
                    <span slot="header">Payload:</span>
                    <v-jsoneditor v-model="payloadContent" :options="getJsonEditorOptions()"
                                  height="420px"/>
                </el-card>
            </el-col>
            <el-col :offset="1" :span="11">
                <el-card style="height: 500px;">
                    <span slot="header">Metadata:</span>
                    <v-jsoneditor v-model="metadataContent" :options="getJsonEditorOptions()"
                                  height="420px"/>
                </el-card>
            </el-col>
        </el-row>
        <div style="margin: 20px 0;"></div>


        <span slot="footer" class="dialog-footer">
            <el-button type="primary">Publish</el-button>
         </span>
    </el-dialog>
</template>

<script>

    export default {
        components: {},
        props: {
            show: Boolean,
            closedFunc: Function
        },
        methods: {
            getJsonEditorOptions: function () {
                let self = this;
                return {
                    mode: "code",
                    mainMenuBar: false,
                }
            },
        },
        data() {
            return {
                selectedTopic: "",
                payloadContent: {
                    "status": 200,
                    "error": "",
                    "data": [{
                        "news_id": 51184,
                        "title": "iPhone X Review: Innovative future with real black technology",
                        "source": "Netease phone"
                    }, {
                        "news_id": 51183,
                        "title": "Traffic paradise: How to design streets for people and unmanned vehicles in the future?",
                        "source": "Netease smart"
                    }, {
                        "news_id": 51182,
                        "title": "Teslamask's American Business Relations: The government does not pay billions to build factories",
                        "source": "AI Finance",
                        "members": ["Daniel", "Mike", "John"]
                    }]
                },
                metadataContent: {
                    "status": 200,
                    "error": "",
                    "data": [{
                        "news_id": 51184,
                        "title": "iPhone X Review: Innovative future with real black technology",
                        "source": "Netease phone"
                    }, {
                        "news_id": 51183,
                        "title": "Traffic paradise: How to design streets for people and unmanned vehicles in the future?",
                        "source": "Netease smart"
                    }, {
                        "news_id": 51182,
                        "title": "Teslamask's American Business Relations: The government does not pay billions to build factories",
                        "source": "AI Finance",
                        "members": ["Daniel", "Mike", "John"]
                    }]
                },
            };
        }
    };
</script>