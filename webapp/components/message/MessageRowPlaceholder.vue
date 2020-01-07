<template>
    <div class="card secondary-background" ref="message-row"
         style="margin-top: 15px; margin-bottom: 5px;">
        <div style="min-height: 80px">
            <template>
                <content-loader
                        :height="20"
                        :speed="2"
                        primaryColor="#10586C"
                        secondaryColor="#0099FA"
                >
                    <rect x="5" y="5" rx="1" ry="1" width="50" height="4"/>
                    <rect x="5" y="12" rx="1" ry="1" width="50" height="4"/>

                    <rect x="60" y="5" rx="1" ry="1" width="50" height="4"/>
                    <rect x="60" y="12" rx="1" ry="1" width="50" height="4"/>

                    <rect x="115" y="5" rx="1" ry="1" width="50" height="4"/>
                    <rect x="115" y="12" rx="1" ry="1" width="50" height="4"/>
                </content-loader>
            </template>
        </div>
        <el-divider class="straight-secondary divider"/>
        <content-loader
                :height="20"
                :width="600"
                :speed="2"
                primaryColor="#10586C"
                secondaryColor="#0099FA">
            <rect x="5" y="5" rx="2" ry="2" width="98%" height="10px"/>
        </content-loader>
    </div>
</template>

<script>
    import '~/assets/buttonSlide.css'
    import Collapse from "./Collapse";
    import {ContentLoader} from "vue-content-loader"

    export default {
        components: {
            Collapse,
            ContentLoader
        }
    }

</script>

<style scoped>
    .card {
        margin: 0 10px 0 10px;
        box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.5);
        border-radius: 10px; /* 5px rounded corners */
    }

    .divider {
        margin-top: 5px;
        margin-bottom: 0;
    }
</style>