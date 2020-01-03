<template>
    <el-card class="vld-parent background straight-secondary-border">
        <loading
                loader="bars"
                :active.sync="messagesLoading"
                :is-full-page="false"
                size="25px"
                color="#10586C"
                style="z-index: 1010"
        />
        <el-row :gutter="20">
            <el-col :span="6">
                <el-select @change="refresh" size="small" style="width: 100%; margin-top: 5px;" v-model="selectedTopic"
                           filterable
                           placeholder="Select a topic">
                    <el-option v-for="item in topics"
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
                        <el-switch @change="refresh" style="left: 5px; margin-top: 8px;" v-model="offsetEnabled"/>
                    </el-col>
                    <el-col :span="20">
                        <el-slider :disabled="!offsetEnabled" @change="refresh" :min="minOffsetVal" :max="maxOffsetVal"
                                   v-model="messageOffsets" range>
                        </el-slider>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="9">
                <el-row>
                    <div class="separated straight-secondary"></div>
                    <el-input
                            @change="refresh"
                            size="small"
                            placeholder="Search"
                            v-model="search"
                            clearable>
                    </el-input>
                </el-row>

            </el-col>
<!--            <el-col :span="2">-->
            <!--                <el-row>-->
            <!--                    <div class="separated straight-secondary"></div>-->
            <!--                    <div style="margin-top: -15px; height :35px;  background: orangered">-->
            <!--                        <el-button style="margin-left: auto; margin-right: auto;" class="primary-button" size="mini" icon="el-icon-s-promotion">Publish</el-button>-->
            <!--                    </div>-->
            <!--                    <div style="margin-bottom: -15px;  height :35px; background: green">-->
            <!--                        <el-button class="secondary-button" size="mini" icon="el-icon-s-promotion">Settings</el-button>-->
            <!--                    </div>-->
            <!--                </el-row>-->
            <!--            </el-col>-->
        </el-row>
        <el-divider class="straight-secondary"></el-divider>
        <el-row>
            <!--            <el-button size="small" circle style="right: 15px; top:-10px; z-index: 10; position: absolute;"-->
            <!--                       @click="showSendDialog = true"-->
            <!--                       icon="el-icon-setting"/>-->
            <Messages @search-change="refresh"></Messages>
        </el-row>
    </el-card>
</template>

<script>
    import Messages from '@/components/Messages.vue';

    export default {
        computed: {},
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
                self.messagesLoading = true;
                setTimeout(() => {
                    self.messagesLoading = false;
                    if (!!cb) {
                        cb()
                    }
                }, 3000)
            },
        },
        mounted: function () {
            this.load()
        },
        components: {
            Messages,
        },
        data() {
            return {
                topics: ["a1", "a2"],
                selectedTopic: "",
                search: "",
                refreshing: false,
                minOffsetVal: 0,
                maxOffsetVal: 200,
                offsetEnabled: false,
                messageOffsets: [50, 150],
                messagesLoading: false,
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