export const state = () => ({
    store1: {
        messages: [],
        refreshing: true,
        topic: null,
        isActive: true,
        notificationPosition: "top-left",
        subConn: null,
        search: null,
    },
    store2: {
        messages: [],
        refreshing: true,
        topic: null,
        isActive: false,
        notificationPosition: "top-right",
        subConn: null,
        search: null,
    }
});

export const mutations = {
    addMsg(state, val) {
        state[val.store].messages.unshift(val.msg);
    },
    popMsg(state, val) {
        state[val.store].messages.pop();
    },
    truncateMsgs(state, val) {
        state[val.store].messages = []
    },
    setTopic(state, val) {
        state[val.store].topic = val.topic
    },
    setRefreshing(state, val) {
        state[val.store].refreshing = val.refreshing
    },
    setIsActive(state, val) {
        state[val.store].isActive = val.isActive
    },
    setSearch(state, val) {
        state[val.store].search = val.search
    }
};