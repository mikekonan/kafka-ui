export const state = () => ({
    ignoredMetadataProps: [],
    ignoredMessageHeaderProps: [],
});

export const mutations = {
    addIgnoreMetadataProp(state, prop) {
        state.ignoredMetadataProps.push(prop);
    },
    rmIgnoreMetadataProp(state, prop) {
        const index = state.ignoredMetadataProps.indexOf(prop);
        if (index > -1) {
            state.ignoredMetadataProps.splice(index, 1);
        }
    },
    addIgnoreMessageHeaderProp(state, prop) {
        state.ignoredMessageHeaderProps.push(prop);
    },
    rmIgnoreMessageHeaderProp(state, prop) {
        const index = state.ignoredMessageHeaderProps.indexOf(prop);
        if (index > -1) {
            state.ignoredMessageHeaderProps.splice(index, 1);
        }
    }
};