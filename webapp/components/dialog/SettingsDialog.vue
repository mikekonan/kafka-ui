<template>
    <el-dialog style="border-radius: 10px;" width="700px" @closed="closedFunc" :visible.sync="show">
        View mode:
        <el-radio-group size="mini" v-model="mode">
            <el-radio-button label="One tab"/>
            <el-radio-button label="Two tabs"/>
        </el-radio-group>

        <el-card style="margin-top: 15px; color: #D8F3FF;" class="secondary-background straight-secondary-border">
            <div>
                <span>Ignored message headers</span>
            </div>

            <el-divider class="straight-secondary"/>

            <template style="margin: 5px;" v-for="name in $store.state['message-prop']['ignoredMetadataProps']">
                <Chip color="blue"
                      :name="name"
                      :onTrash="()=> $store.commit('message-prop/rmIgnoreMetadataProp', name)"/>
            </template>

            <template style="margin: 5px;" v-for="name in $store.state['message-prop']['ignoredMessageHeaderProps']">
                <Chip color="green"
                      :name="name"
                      :onTrash="()=> $store.commit('message-prop/rmIgnoreMessageHeaderProp', name)"/>
            </template>
        </el-card>
    </el-dialog>
</template>

<script>
    import Chip from "../message/Chip";

    export default {
        watch: {
            mode: function (newVal) {
                if (!!!newVal) return;

                if (newVal === "One tab") {
                    this.$store.commit('messages/setIsActive', {store: "store2", isActive: false});
                    return
                }

                this.$store.commit('messages/setIsActive', {store: "store2", isActive: true});
            }
        },
        components: {Chip},
        props: {
            show: Boolean,
            closedFunc: Function
        },
        mounted() {
            if (!!!this.$store.state['split-view']['splitMode']) {
                this.mode = "One tab";
                return;
            }

            this.mode = "Two tabs"
        },
        data() {
            return {
                mode: ""
            }
        }
    };
</script>

<style>
</style>