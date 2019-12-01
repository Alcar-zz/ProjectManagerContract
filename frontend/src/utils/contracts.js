import Web3 from 'web3';

export const projectManagerAbi = [
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "name": "project",
            "type": "address"
        }
        ],
        "name": "projectAdded",
        "type": "event"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "isPMContract",
        "outputs": [
        {
            "name": "isValidPMContract",
            "type": "bool"
        }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "name",
            "type": "string"
        }
        ],
        "name": "addProject",
        "outputs": [
        {
            "name": "addressContract",
            "type": "address"
        }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getProjects",
        "outputs": [
        {
            "name": "projectAddresses",
            "type": "string"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "_addr",
            "type": "address"
        }
        ],
        "name": "finalizeProject",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "_addr",
            "type": "address"
        }
        ],
        "name": "deleteProject",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const projectAbi = [
    {
        "inputs": [
        {
            "name": "_owner",
            "type": "address"
        },
        {
            "name": "_name",
            "type": "string"
        }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "name": "participant",
            "type": "address"
        }
        ],
        "name": "participantAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "name": "participant",
            "type": "address"
        }
        ],
        "name": "participantRemoved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "name": "fileHash",
            "type": "string"
        }
        ],
        "name": "fileAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "fileDeleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "contractFinalized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "contractCancelled",
        "type": "event"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getProjectData",
        "outputs": [
        {
            "name": "name",
            "type": "string"
        },
        {
            "name": "isProjectClosed",
            "type": "bool"
        },
        {
            "name": "vontingInProcess",
            "type": "address"
        },
        {
            "name": "fileHash",
            "type": "string"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "newName",
            "type": "string"
        }
        ],
        "name": "rename",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "_addr",
            "type": "address"
        }
        ],
        "name": "addParticipant",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "currentVoting",
        "outputs": [
        {
            "name": "participant",
            "type": "address"
        },
        {
            "name": "currentNumber",
            "type": "uint256"
        },
        {
            "name": "NumberRequired",
            "type": "uint256"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "_addr",
            "type": "address"
        }
        ],
        "name": "votingToRemoveParticipant",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "cancelParticipantVoting",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "voteForRemoval",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "leaveContract",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
        {
            "name": "_addr",
            "type": "address"
        }
        ],
        "name": "getParticipant",
        "outputs": [
        {
            "name": "paticipantAddress",
            "type": "address"
        },
        {
            "name": "participantPayment",
            "type": "uint256"
        },
        {
            "name": "paymentClaimed",
            "type": "bool"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getAllParticipants",
        "outputs": [
        {
            "name": "participantsAddresses",
            "type": "string"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "_fileHash",
            "type": "string"
        }
        ],
        "name": "addFile",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getFile",
        "outputs": [
        {
            "name": "filesHashes",
            "type": "string"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "claimPayment",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "finalize",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "cancel",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    }
];

export const contractAddress = "0xEab5885c7fC49CCAe1e550DD9569eE9aD9ed7750";

