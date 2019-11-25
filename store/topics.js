import Vue from "vue";

export const state = () => ({
    topicsState: {},
    search: "",
});

export const mutations = {
    setTopics(state, topics) {
        Vue.set(state.topicsState, 'topics', topics);
    },
    setSearch(state, val) {
        Vue.set(state, 'search', val);
    }
};