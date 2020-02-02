<template>
    <el-card class="vld-parent background straight-secondary-border">
        <el-row :gutter="20">
            <el-col :span="6">
                <el-select @change="onTopicChange" size="small" style="width: 100%; margin-top: 0;"
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
            <el-col :span="7">
                <el-row style="width: 350px;" :gutter="10">

                    <div class="separated straight-secondary"></div>
                    <el-col :span="2">
                        <el-switch style="margin-top: 6px;" @change="setOffsetActive" :value="offsetActive"
                                   :disabled="this.$store.state.messages[this.store].refreshing"
                        />
                    </el-col>
                    <el-col style="margin-right: -10px; margin-left: 25px; margin-top: -14px;" :span="11">
                        <el-row>
                            <span>Min:</span>
                        </el-row>
                        <el-input-number
                                @change="onMinOffsetChange" :disabled="!offsetActive" size="small"
                                :value="minOffsetVal"
                                :min="0"
                                controls-position="right"/>
                    </el-col>
                    <el-col style="margin-right: -10px; margin-left: -5px; margin-top: -14px;" :span="11">
                        <el-row>
                            <span>Max:</span>
                        </el-row>
                        <el-input-number @change="onMaxOffsetChange" :disabled="!offsetActive" size="small"
                                         :min="minOffsetVal"
                                         :value="maxOffsetVal"
                                         controls-position="right"/>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="11">
<!--                <el-row>-->
<!--                    <div class="separated straight-secondary"></div>-->
<!--                    <el-input-->
<!--                            @change="onSearchChange"-->
<!--                            size="small"-->
<!--                            placeholder="Search"-->
<!--                            v-model="search"-->
<!--                            clearable>-->
<!--                    </el-input>-->
<!--                </el-row>-->

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
        computed: {
            offsetActive: function () {
                return this.$store.state.messages[this.store].offsetActive;
            },
            maxOffsetVal: function () {
                return this.$store.state.messages[this.store].maxOffset;
            },
            minOffsetVal: function () {
                return this.$store.state.messages[this.store].minOffset;
            }
        },
        props: {
            store: String,
        },
        methods: {
            onTopicChange: function (val) {
                this.$store.commit(`messages/setTopic`, {store: this.store, topic: val});
            },
            onSearchChange: function (val) {
                this.$store.commit(`messages/setSearch`, {store: this.store, search: val});
            },
            onMinOffsetChange: function (val) {
                this.$store.commit(`messages/setMinOffset`, {
                    store: this.store,
                    minOffset: val
                });
            },
            onMaxOffsetChange: function (val) {
                this.$store.commit(`messages/setMaxOffset`, {
                    store: this.store,
                    maxOffset: val
                })
            },
            setOffsetActive: function (val) {
                this.$store.commit(`messages/setOffsetActive`, {
                    store: this.store,
                    active: val
                });
            },
        },
        components: {
            MessagesList,
        },
        data() {
            return {
                search: "",
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