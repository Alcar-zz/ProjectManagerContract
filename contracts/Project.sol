pragma solidity ^0.5.8;

contract CommonUtilities {
    address payable owner;
    bool constant PREV = false;
    bool constant NEXT = true;

    constructor(address payable _addr) public {
        owner = _addr;
    }

    struct Addresses {
        mapping(address =>  mapping(bool => address)) addressIndexes;
    }

    modifier isOwner() {
        require(msg.sender == owner, 'You aren\'t the owner of this contract');
        _;
    }

    function getAddressesString(Addresses storage addresses) internal view
    returns ( string memory projectAddresses) {
        address current = addresses.addressIndexes[address(0x0)][NEXT];
        string memory _addresses = _addressToString(current);
        current = addresses.addressIndexes[current][NEXT];
        while (current != address(0x0)) {
            _addresses = string(abi.encodePacked(_addresses, ',', _addressToString(current)));
            current = addresses.addressIndexes[current][NEXT];
        }
        return _addresses;
    }

    function _addressToString(address _addr) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function removeElement(Addresses storage addresses, address _addr) internal  {
        // Stitch the neighbours together
        addresses.addressIndexes[addresses.addressIndexes[_addr][PREV]][NEXT] = addresses.addressIndexes[_addr][NEXT];
        addresses.addressIndexes[addresses.addressIndexes[_addr][NEXT]][PREV] = addresses.addressIndexes[_addr][PREV];
        // Delete state storage
        delete addresses.addressIndexes[_addr][PREV];
        delete addresses.addressIndexes[_addr][NEXT];
    }

    function addElement(Addresses storage addresses, address _addr) internal  {
        // Link the new node
        addresses.addressIndexes[_addr][PREV] = address(0x0);
        addresses.addressIndexes[_addr][NEXT] = addresses.addressIndexes[address(0x0)][NEXT];
        // Insert the new node
        addresses.addressIndexes[addresses.addressIndexes[address(0x0)][NEXT]][PREV] = _addr;
        addresses.addressIndexes[address(0x0)][NEXT] = _addr;
    }
}

contract Project is CommonUtilities {
    address payable parentContract;
    Addresses participants;
    mapping(address => uint) payments;
    mapping(address => bool) claimed;
    string file;
    bool closed = false;
    uint participantsNum = 0;
    string name;
    address participantToRemove;
    mapping(address => bool) participantsVote;
    uint votesRequired;
    uint votes;

    event participantAdded(address participant);
    event participantRemoved(address participant);
    event fileReplaced(string fileHash);
    event fileDeleted();
    event contractFinalized();
    event contractCancelled();

    constructor(string memory _name) CommonUtilities(tx.origin)
    public {
        parentContract = msg.sender;
        name = _name;
    }

    modifier isParentContract() {
        require(msg.sender == parentContract, 'This must be called by the parent contract of this contract');
        _;
    }

    modifier isNotClosed() {
        require(false == closed, 'The contract is already closed.');
        _;
    }

    modifier isClosed() {
        require(true == closed, 'The contract is not closed yet.');
        _;
    }

    modifier isOwnerOrParticipant() {
        require(
            msg.sender == owner||
            msg.sender == parentContract||
            payments[msg.sender] > 0||
            claimed[msg.sender] == true,
            'You aren\'t the owner or a participant of this contract'
        );
        _;
    }

    modifier isParticipant(address _addr){
        require(payments[_addr] > 0 || claimed[_addr] == true, 'This participant doesn\'t exist.');
        _;
    }

    modifier isVotinginProcess(){
        require(participantToRemove != address(0x0), "There isn't a voting in process.");
        _;
    }

    modifier hasParticipants(){
        require(participants.addressIndexes[address(0x0)][NEXT] != address(0x0), 'There aren\'t any participants yet.');
        _;
    }

    function getProjectData() public view
    isOwnerOrParticipant
    returns (string memory projectName, bool isProjectClosed, address vontingInProcess, string memory fileHash) {
        return (name, closed, participantToRemove, file);
    }

    function addParticipant(address _addr) public payable
    isOwner isNotClosed {
        require(payments[msg.sender] == 0, "This participant already exists.");
        require(msg.value > 0, "Participant's payment must be greater than 0.");
        addElement(participants, _addr);
        payments[_addr] = msg.value;
        participantsNum++;
        emit participantAdded(_addr);
    }

    function removeParticipant(address _addr) internal {
        uint amount = payments[_addr];
        removeElement(participants, _addr);
        delete payments[_addr];
        participantsNum--;
        owner.transfer(amount);
        emit participantRemoved(_addr);
    }

    function calculateVotesRequired() internal {
        if(participantsNum == 1 || participantsNum == 2) {
            votesRequired = 1;
        }
        else {
            votesRequired = participantsNum / 2 + 1;
            if(votesRequired >= participantsNum) {
                votesRequired = participantsNum - 1;
            }
        }
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

    function votingToRemoveParticipant(address _addr) public
    isOwner isNotClosed isParticipant(_addr) {
        require(participantToRemove == address(0x0), "There is a voting already in process.");
        require(participantsNum > 1, "You can't start a voting with just one participant.");
        participantToRemove = _addr;
        votes = 0;
        calculateVotesRequired();
    }

    function cancelParticipantVoting() public isOwner isNotClosed isVotinginProcess {
        participantToRemove = address(0x0);
    }
    function voteForRemoval() public isNotClosed isParticipant(msg.sender) isVotinginProcess {
        require(participantToRemove != msg.sender, "You can't vote in your own removal.");
        require(participantsVote[msg.sender] == true, "You already voted.");
        participantsVote[msg.sender] = true;
        if(votes + 1 == votesRequired) {
            votingSuccess();
        } else {
            votes++;
        }
    }

    function leaveContract() public payable
    isNotClosed isParticipant(msg.sender) {
        require(participantToRemove == msg.sender || participantToRemove == address(0x0), 'There is a removal voting in process.');
        removeParticipant(msg.sender);
        if(participantToRemove == msg.sender) {
            participantToRemove = address(0x0);
        } else {
            if(participantToRemove != address(0x0)) {
                calculateVotesRequired();
            }
        }
    }

    function getParticipant(address _addr) public view
    isParticipant(_addr)
    returns (address paticipantAddress, uint participantPayment, bool paymentClaimed) {
        return (_addr, payments[_addr], claimed[_addr]);
    }

    function getAllParticipants() public view
    isOwnerOrParticipant hasParticipants
    returns (string memory participantsAddresses) {
        return getAddressesString(participants);
    }

    function replaceFile(string memory _fileHash) public isOwner isNotClosed {
        file = _fileHash;
        if(bytes(_fileHash).length == 0) {
            emit fileDeleted();
        } else {
            emit fileReplaced(_fileHash);
        }
    }

    function getFile() public view
    isOwnerOrParticipant
    returns (string memory filesHashes) {
        return file;
    }

    function claimPayment() public payable
    isClosed isParticipant(msg.sender) {
        require(claimed[msg.sender] == false, 'You already claimed your payment.');
        claimed[msg.sender] = true;
        msg.sender.transfer(payments[msg.sender]);
    }

    function finalize() public isParentContract isNotClosed hasParticipants {
        closed = true;
        emit contractFinalized();
    }

    function cancel() public payable
    isParentContract isNotClosed {
        require(participants.addressIndexes[address(0x0)][NEXT] == address(0x0), 'All participants must leave before cancelling the contract.');
        selfdestruct(owner);
        emit contractCancelled();
    }
}