import { arrayObjectToKeyData } from "../utils/functions";

export const actions = {
    LOAD_PROJECTS: 'LOAD_PROJECTS',
    ADD_PROJECT: 'ADD_PROJECT',
    DELETE_PROJECT: 'DELETE_PROJECT',
    FINALIZE_PROJECT: 'FINALIZE_PROJECT',
    MOD_PARTICIPANTS_NUMBER: 'MOD_PARTICIPANTS_NUMBER',
    MOD_FILE_HASH: 'MOD_FILE_HASH',
    ADD_PARTICIPANTS: 'ADD_PARTICIPANTS',
    CLAIM_PAYMENT: 'CLAIM_PAYMENT',
};


function getProjects(Project, account) {
    return async function(result) {
        if(result.projectsData === '[]') {
            return {
                isOwner: result.isUserOwner,
                projectsAddresses: []
            }
        }
        result.projectsData = result.projectsData.replace(/\[,+/, '[');
        let projects = JSON.parse(result.projectsData);
        projects = arrayObjectToKeyData(projects, 'address', 'projectsAddresses');
        return {
            ...projects,
            isOwner: result.isUserOwner,
        }
    }
}

export function loadProject(ProjectManager, Project, account) {
    return {
        type: actions.LOAD_PROJECTS,
        payload: ProjectManager.methods.getProjects().call({from: account})
            .then(getProjects(Project,account)),
    }
}

export function addProject(payload, address) {
    return {
        type: actions.ADD_PROJECT,
        payload: payload.then(response => {
            if(response.projectsData.trim() === '') {
                return null;
            }
            return {
                isOwner: response.isUserOwner,
                project: JSON.parse(response.projectsData)
            }
        }),
        meta: {
            address
        }
    }
}

export function claimPayment(payload, address, participant) {
    return {
        type: actions.CLAIM_PAYMENT,
        payload: payload,
        meta: {
            address,
            participant
        }
    }
}

export function addParticipants(payload,address) {
    return {
        type: actions.ADD_PARTICIPANTS,
        payload,
        meta: {
            address
        }
    }
}

export function cancelProject(payload, address) {
    return {
        type: actions.DELETE_PROJECT,
        payload,
        meta: {
            address
        }
    }
}

export function finalizeProject(payload, address) {
    return {
        type: actions.FINALIZE_PROJECT,
        payload,
        meta: {
            address
        }
    }
}

export function cancelProjectEvent( address) {
    return {
        type: actions.DELETE_PROJECT,
        address
    }
}

export function finalizeProjectEvent( address) {
    return {
        type: actions.FINALIZE_PROJECT,
        address
    }
}

export function handleParticipantsEvents(address, participant, mod, payload) {
    return function(dispatch, getState) {
        if(payload) {
            return dispatch({
                type: actions.MOD_PARTICIPANTS_NUMBER,
                payload: payload.then(res => {
                    return {
                        ...res,
                        isCurrentAccount: getState().metamaskReducer.account === participant
                    }

                }),
                meta: {
                    address,
                    mod,
                    participant,
                }
            })
        }
        return dispatch({
            type: actions.MOD_PARTICIPANTS_NUMBER,
            address,
            mod,
            participant,
            isCurrentAccount: getState().metamaskReducer.account === participant
        });
    }
}

export function handleFileEvents(address, fileHash) {
    return {
        type: actions.MOD_FILE_HASH,
        address,
        fileHash
    }
}

export function handlePaymentClaimedEvents(address, participant) {
    return {
        type: actions.CLAIM_PAYMENT,
        address,
        participant
    }
}