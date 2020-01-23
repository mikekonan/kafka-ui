<template>
    <el-card class="vld-parent background straight-secondary-border">
        <el-row :gutter="20">
            <el-col :span="6">
                <el-select @change="onTopicChange" size="small" style="width: 100%; margin-top: 5px;"
                           :value="this.$store.state.messages[this.store].topic"
                           filterable
                           placeholder="Select a topic"
                           :disabled="this.$store.state.messages[this.store].refreshing"
                >
                    <el-option v-for="item in $store.state.topics.topics"
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
                        <el-switch style="left: 5px; margin-top: 8px;" v-model="offsetEnabled"/>
                    </el-col>
                    <el-col :span="20">
                        <el-slider :disabled="!offsetEnabled" :min="minOffsetVal" :max="maxOffsetVal"
                                   v-model="messageOffsets" range>
                        </el-slider>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="9">
                <el-row>
                    <div class="separated straight-secondary"></div>
                    <el-input
                            @change="onSearchChange"
                            size="small"
                            placeholder="Search"
                            v-model="search"
                            clearable>
                    </el-input>
                </el-row>

            </el-col>
        </el-row>
        <el-divider class="straight-secondary"/>
        <el-row>
            <MessagesList :store="store"/>
        </el-row>
    </el-card>
</template>

<script>
    import MessagesList from './MessagesList.vue';

    export default {
        props: {
            store: String,
        },
        methods: {
            onTopicChange: function (val) {
                this.$store.commit(`messages/setTopic`, {store: this.store, topic: val});
            },
            onSearchChange: function (val) {
                this.$store.commit(`messages/setSearch`, {store: this.store, search: val});
            }
        },
        components: {
            MessagesList,
        },
        data() {
            return {
                search: "",
                minOffsetVal: 0,
                maxOffsetVal: 200,
                offsetEnabled: false,
                messageOffsets: [50, 150],
            }
        }
    };
</script>

<style scoped>
    .button {
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin: 5px;
    }

    .separated {
        left: -8px;
        margin-top: -15px;
        position: absolute;
        border-left: 1px solid;
        height: 67px;
    }
</style>