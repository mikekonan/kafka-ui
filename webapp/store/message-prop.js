export const state = () => ({
    ignoredProps: [],
});

export const mutations = {
    addIgnoreProp(state, prop) {
        state.ignoredProps.push(prop);
    },
    rmIgnoreProp(state, prop) {
        const index = state.ignoredProps.indexOf(prop);
        if (index > -1) {
            state.ignoredProps.splice(index, 1);
        }
    }
};