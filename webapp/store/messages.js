export const state = () => ({
    store1: {
        messages: [],
        refreshing: false,
        topic: null,
        isActive: true,
        notificationPosition: "top-left",
        subConn: null,
        search: null,
        minOffset: 0,
        maxOffset: 0,
        offsetActive: false,
    },
    store2: {
        messages: [],
        refreshing: false,
        topic: null,
        isActive: false,
        notificationPosition: "top-right",
        subConn: null,
        search: null,
        minOffset: 0,
        maxOffset: 0,
        offsetActive: false,
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
    },
    setMinOffset(state, val) {
        state[val.store].minOffset = val.minOffset;

        if (state[val.store].minOffset > state[val.store].maxOffset) {
            state[val.store].maxOffset = val.minOffset
        }
    },
    setMaxOffset(state, val) {
        state[val.store].maxOffset = val.maxOffset
    },
    setOffsetActive(state, val) {
        state[val.store].offsetActive = val.active
    },
};