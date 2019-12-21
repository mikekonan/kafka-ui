<template>
    <div>

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
