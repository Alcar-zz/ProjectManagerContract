import { actions } from './metamaskActions';

const initialState = {
    metamaskExist: 'loading'
};


export default function metamaskReducer(state = initialState, action) {
    switch(action.type) {
        case actions.CHANGE_ACCOUNT:
            return {
                account: action.account,
                metamaskExist: action.metamask || 'enabled',
            }
        case actions.SET_METAMASK:
            return {
                ...state,
                metamaskExist: action.metamask
            }
        default:
            return state;
    }
}
