pragma solidity ^0.5.8;
import './CommonUtilities.sol';

contract Project is CommonUtilities {
    address parentContract;
    Addresses participants;
    mapping(address => uint) payments;
    mapping(address => bool) claimed;
    string file;
    bool closed;
    uint participantsNum;
    address participantToRemove;
    mapping(address => bool) participantsVote;
    uint votesRequired;
    uint votes;
    string projectName;

    event participantAdded(address participant);
    event participantRemoved(address participant);
    event fileAdded(string fileHash);
    event fileDeleted();
    event contractFinalized();
    event contractCancelled();

    constructor(address payable _owner, string memory _name) CommonUtilities(_owner)
    public {
        parentContract = msg.sender;
        projectName = _name;
    }

    function isNotClosed() internal view  {
        require(false == closed, 'The contract is already closed.');
    }

    function isOwnerOrParticipant() internal view {
        require(
            msg.sender == owner||
            msg.sender == parentContract||
            payments[msg.sender] > 0,
            'You aren\'t the owner or a participant of this contract'
        );
    }

    function isParticipant(address _addr) internal view {
        require(payments[_addr] > 0, 'This participant doesn\'t exist.');
    }

    function isVotinginProcess() internal view {
        require(participantToRemove != address(0x0), "There isn't a voting in process.");
    }

    function isParentContract() internal view {
        require(msg.sender == parentContract, 'Must be called by the parent contract of this contract');
    }

    function getProjectData() public view
    returns (string memory name,bool isProjectClosed, address vontingInProcess, string memory fileHash) {
        isOwnerOrParticipant();
        return (projectName, closed, participantToRemove, file);
    }

    function rename(string memory newName) public  {
        isOwner();
        isNotClosed();
        require(keccak256(abi.encodePacked(projectName)) != keccak256(abi.encodePacked(newName)), "New name must be different.");
        projectName = newName;
    }

    function addParticipant(address _addr) public payable {
        isOwner();
        require(owner != _addr, "The owner can't be a participant.");
        isNotClosed();
        require(payments[_addr] == 0, "This participant already exists.");
        require(msg.value > 0, "The participant's payment must be greater than 0.");
        addElement(participants, _addr);
        payments[_addr] = msg.value;
        participantsNum++;
        emit participantAdded(_addr);
    }

    function removeParticipant(address _addr) internal {
        uint amount = payments[_addr];
        removeElement(participants, _addr);
        delete payments[_addr];
        delete participantsVote[_addr];
        participantsNum--;
        owner.transfer(amount);
        emit participantRemoved(_addr);
    }

    function votingSuccess() internal {
        removeParticipant(participantToRemove);
        participantToRemove = address(0x0);
        address current = participants.addressIndexes[address(0x0)][NEXT];
        while (current != address(0x0)) {
            participantsVote[current] = false;
            current = participants.addressIndexes[current][NEXT];
        }
    }

    function currentVoting() public view
    returns(address participant, uint currentNumber, uint NumberRequired) {
        isOwnerOrParticipant();
        return (participantToRemove, votes, votesRequired);
    }

    function votingToRemoveParticipant(address _addr) public {
        isOwner();
        isNotClosed();
        isParticipant(_addr);
        require(participantToRemove == address(0x0), "There is a voting already in process.");
        require(participantsNum > 1, "You can't start a voting with just one participant.");
        participantToRemove = _addr;
        votes = 0;
        if(participantsNum <= 2) {
            votesRequired = 1;
        }
        else {
            votesRequired = participantsNum / 2 + 1;
        }
    }

    function cancelParticipantVoting() public {
        isOwner();
        isNotClosed();
        isVotinginProcess();
        participantToRemove = address(0x0);
    }
    function voteForRemoval() public {
        isParticipant(msg.sender);
        isNotClosed();
        isVotinginProcess();
        require(participantToRemove != msg.sender, "You can't vote in your own removal.");
        require(participantsVote[msg.sender] == false, "You already voted.");
        participantsVote[msg.sender] = true;
        if(votes + 1 == votesRequired) {
            votingSuccess();
        } else {
            votes++;
        }
    }

    function leaveContract() public payable {
        isParticipant(msg.sender);
        isNotClosed();
        require(participantToRemove == msg.sender || participantToRemove == address(0x0), 'There is a removal voting in process.');
        removeParticipant(msg.sender);
        if(participantToRemove == msg.sender) {
            participantToRemove = address(0x0);
        }
    }

    function getParticipant(address _addr) public view
    returns (address paticipantAddress, uint participantPayment, bool paymentClaimed) {
        isOwnerOrParticipant();
        isParticipant(_addr);
        return (_addr, payments[_addr], claimed[_addr]);
    }

    function getAllParticipants() public view
    returns (string memory participantsAddresses) {
        isOwnerOrParticipant();
        if(participantsNum > 0) {
            return getAddressesString(participants);
        }
        return "";
    }

    function addFile(string memory _fileHash) public {
        isOwner();
        isNotClosed();
        require(keccak256(abi.encodePacked(_fileHash)) != keccak256(abi.encodePacked(file)), "File hash must be different.");
        file = _fileHash;
        if(bytes(_fileHash).length == 0) {
            emit fileDeleted();
        } else {
            emit fileAdded(_fileHash);
        }
    }

    function getFile() public view
    returns (string memory filesHashes) {
        isOwnerOrParticipant();
        return file;
    }

    function claimPayment() public payable {
        isParticipant(msg.sender);
        require(true == closed, 'The contract is not closed yet.');
        require(claimed[msg.sender] == false, 'You already claimed your payment.');
        claimed[msg.sender] = true;
        msg.sender.transfer(payments[msg.sender]);
    }

    function finalize() public {
        isParentContract();
        isNotClosed();
        require(participantsNum > 0, 'You can\'t finalize a project without adding any participant.');
        closed = true;
        emit contractFinalized();
    }

    function cancel() public payable {
        isParentContract();
        isNotClosed();
        require(participantsNum == 0, 'All participants must leave before cancelling the contract.');
        emit contractCancelled();
        selfdestruct(owner);
    }
}