export const actions = {
    CHANGE_ACCOUNT: 'CHANGE_ACCOUNT',
    SET_METAMASK: 'SET_METAMASK',
};

export function changeAccount(account, metamask) {
    return {
        type: actions.CHANGE_ACCOUNT,
        account,
        metamask
    }
}

export function setMetamask(metamask) {
    return {
        type: actions.SET_METAMASK,
        metamask,
    }
}