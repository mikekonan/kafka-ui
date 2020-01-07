export const state = () => ({
    topics: []
});

export const mutations = {
    add(state, msg) {
        state.topics.push(msg.topic);
    },
    truncate(state) {
        state.topics = []
    },
};