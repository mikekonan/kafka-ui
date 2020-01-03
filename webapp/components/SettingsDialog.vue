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

            <template style="margin: 5px;" v-for="name in $store.state['message-prop']['ignoredProps']">
                <Chip color="blue" :name="name"/>
            </template>
        </el-card>
    </el-dialog>
</template>

<script>
    import Chip from "./Chip";

    export default {
        watch: {
            mode: function (newVal) {
                if (newVal === "One tab") {
                    this.$store.commit('split-view/setSplitMode', false);

                    return
                }

                this.$store.commit('split-view/setSplitMode', true);
            }
        },
        components: {Chip},
        props: {
            show: Boolean,
            closedFunc: Function
        },
        mounted() {
            if (!!this.$store.state['split-view']['splitMode']) {
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