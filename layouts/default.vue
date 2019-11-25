<template>
    <el-card style="height: 98vh; margin: 5px;">
        <el-row>
            <el-col :span="4">
                <TopicsView style="height: 94vh;"></TopicsView>
            </el-col>
            <el-col :offset="1" :span="19">
                <nuxt/>
            </el-col>
        </el-row>
    </el-card>
</template>

<script>

    import TopicsView from "@/views/TopicsView";

    export default {
        components: {
            TopicsView,
        },
        data() {
            return {}
        }
    };

</script>