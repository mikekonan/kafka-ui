<template>
    <el-card style="margin: 5px; width: 100%;">
        <div slot="header">
            <span>Topics:</span>
        </div>
        <el-input
                style="width: 100%;"
                placeholder="Topic name"
                v-model="topicSearchInput"
                clearable
                size="mini"
        >
        </el-input>
        <loading :active.sync="topicsLoading" :is-full-page="false" size="25px"></loading>
        <el-divider></el-divider>
    </el-card>
</template>