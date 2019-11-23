<template>
    <el-card style="height: 98vh; margin: 5px;">
        <el-row>
            <el-col :span="4">
                <TopicNav></TopicNav>
            </el-col>
            <el-col :offset="1" :span="19">
                <el-card style="margin: 5px; width: 100%;">
                    <el-row style="margin: 5px;">
                        <el-col :offset="1" :span="18">
                            <el-slider
                                    v-model="messageOffsets"
                                    range>
                            </el-slider>
                        </el-col>
                        <el-col :offset="1" :span="4">
                            <el-button type="primary" icon="el-icon-s-promotion">Publish Message</el-button>
                        </el-col>
                    </el-row>
                    <el-row>
                        <Table :tableHeight="this.$vssHeight"></Table>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
    </el-card>
</template>


<script>
    import Table from '@/components/Table';
    import TopicNav from '@/components/TopicNav';

    export default {
        components: {
            Table,
            TopicNav
        },
        data() {
            return {
                messageOffsets: [0, 1321313],
                topicsLoading: false,
                messagesLoading: false,
                topicSearchInput: "",
            }
        }
    };
</script>
