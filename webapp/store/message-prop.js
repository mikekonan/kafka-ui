export const state = () => ({
    ignoredProps: [],
});

export const mutations = {
    ignoreProp(state, prop) {
        state.ignoredProps.push(prop);
    }
};