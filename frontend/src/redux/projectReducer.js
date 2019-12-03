import { actions } from './projectActions';
import { actions as metamaskActions } from './metamaskActions';
import { promiseSuffixes } from './store';
import { mergeUniquePaginationArrayValues } from '../utils/functions';
const initialState = {};


export default function projectReducer(state = initialState, action) {
    let addressToMod = action.type.includes(promiseSuffixes.success) && action.meta ? action.meta.address : action.address;
    let participant = action.type.includes(promiseSuffixes.success) && action.meta ? action.meta.participant : action.participant;
    switch(action.type) {
        case actions.LOAD_PROJECTS + promiseSuffixes.error:
        case actions.LOAD_PROJECTS + promiseSuffixes.start:
            return {
                ...state,
                loading: action.type.includes(promiseSuffixes.start),
            }
        case actions.LOAD_PROJECTS + promiseSuffixes.success:
            return {
                ...state,
                ...action.payload,
                loading: false
            }
        case actions.ADD_PROJECT + promiseSuffixes.success:
            if(!state[action.meta.address] && action.payload) {
                return {
                    [action.meta.address]: {
                        name: action.payload.project.name,
                        address: action.meta.address,
                        createdAt: action.payload.project.createdAt,
                        participants: action.payload.project.participants,
                        isProjectClosed: action.payload.project.isProjectClosed,
                        vontingInProcess: action.payload.project.vontingInProcess,
                        fileHash: action.payload.project.fileHash,
                    },
                    isOwner: action.payload.isOwner,
                    projectsAddresses: mergeUniquePaginationArrayValues(state.projectsAddresses, [action.meta.address])
                }
            }
            return state;
        case actions.DELETE_PROJECT + promiseSuffixes.success:
        case actions.DELETE_PROJECT:
            if(state[addressToMod]) {
                let { [addressToMod]: removed, ...rest } = state;
                rest.projectsAddresses = state.projectsAddresses.filter(address => address !== addressToMod);
                return rest;
            }
            return state;
        case actions.FINALIZE_PROJECT + promiseSuffixes.success:
        case actions.FINALIZE_PROJECT:
            if(state[addressToMod] && !state[addressToMod].isProjectClosed) {
                return {
                    ...state,
                    [addressToMod]: {
                        ...state[addressToMod],
                        isProjectClosed: true,
                    },
                };
            }
            return state;
        case actions.MOD_PARTICIPANTS_NUMBER + promiseSuffixes.success:
        case actions.MOD_PARTICIPANTS_NUMBER:
            let mod = action.type.includes(promiseSuffixes.success) && action.meta ? action.meta.mod : action.mod;
            let isCurrentAccount = action.type.includes(promiseSuffixes.success) ? action.payload.isCurrentAccount : action.isCurrentAccount;
            if(state[addressToMod]) {
                if(mod < 0) {
                    if(isCurrentAccount) {
                        let { [addressToMod]: removed, ...rest } = state;
                        rest.projectsAddresses = state.projectsAddresses.filter(address => address !== addressToMod);
                        return rest;
                    }
                    if(
                        state[addressToMod].participantsAddresses&&
                        state[addressToMod].participantsAddresses.includes(participant)
                    ) {
                        return {
                            ...state,
                            [addressToMod]: {
                                ...state[addressToMod],
                                participantsAddresses: state[addressToMod].participantsAddresses.filter(address => address !== participant),
                                participants: state[addressToMod].participants - 1,
                            },
                        }
                    }
                }
                if(
                    mod > 0&&
                    (
                        !state[addressToMod].participantsAddresses||
                        (state[addressToMod].participantsAddresses && !state[addressToMod].participantsAddresses.includes(participant))
                    )
                ) {
                    return {
                        ...state,
                        [addressToMod]: {
                            ...state[addressToMod],
                            [participant]: action.payload,
                            participantsAddresses: mergeUniquePaginationArrayValues(state[addressToMod].participantsAddresses, [participant]),
                            participants: state[addressToMod].participants + 1,
                        },
                    }
                }
                return state;
            }
            return state;
        case actions.MOD_FILE_HASH + promiseSuffixes.success:
        case actions.MOD_FILE_HASH:
            if(state[addressToMod]) {
                const fileHash = action.type.includes(promiseSuffixes.success) ? action.meta.fileHash : action.fileHash;
                return {
                    ...state,
                    [addressToMod]: {
                        ...state[addressToMod],
                        fileHash,
                    },
                };
            }
            return state;
        case actions.ADD_PARTICIPANTS + promiseSuffixes.success:
            if(state[addressToMod]) {
                return {
                    ...state,
                    [addressToMod]: {
                        ...state[addressToMod],
                        ...action.payload,
                    },
                };
            }
            return state;
        case actions.CLAIM_PAYMENT + promiseSuffixes.success:
        case actions.CLAIM_PAYMENT:
            if(state[addressToMod] && state[addressToMod][participant] && !state[addressToMod][participant].didClaim) {
                return {
                    ...state,
                    [addressToMod]: {
                        ...state[addressToMod],
                        [participant]: {
                            ...state[addressToMod][participant],
                            didClaim: true,
                        },
                    },
                };
            }
            return state;
        case metamaskActions.CHANGE_ACCOUNT:
            return initialState;
        case actions.ADD_PROJECT + promiseSuffixes.error:
        default:
            return state;
    }
}
