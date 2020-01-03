export const state = () => ({
    splitMode: false,
});

export const mutations = {
    setSplitMode(state, prop) {
        state.splitMode = prop;
    }
};