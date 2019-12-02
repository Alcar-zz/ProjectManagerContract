pragma solidity ^0.5.8;
import './Project.sol';
import './CommonUtilities.sol';

contract ProjectManager is CommonUtilities {
    Addresses projects;

    event projectAdded(address project);

    constructor() CommonUtilities(msg.sender) public  {}

    function projectExist(address _addr) internal view {
        require(
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[_addr][PREV] != address(0x0)||
            projects.addressIndexes[address(0x0)][NEXT] == _addr,
            'Project doesn\'t exist.'
        );
    }

    function formatProjectInfo(
        address _address,
        string memory _name,
        string memory _createdAt,
        string memory _isProjectClosed,
        string memory _vontingInProcess,
        string memory _fileHash
    ) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "{",
                '"address": "', _addressToString(_address),
                '","name" : "', _name,
                '","createdAt" : ', _createdAt,
                ',"isProjectClosed" : ', _isProjectClosed,
                ',"vontingInProcess" : "', _vontingInProcess,
                '","fileHash" : "', _fileHash,
                '"}'
            )
        );
    }

    function isPMContract() public pure
    returns (bool isValidPMContract){
        return true;
    }

    function addProject(string memory name) public
    returns (address addressContract) {
        isOwner();
        Project p = new Project(owner, name);
        addElement(projects, address(p));
        emit projectAdded(address(p));
        return address(p);
    }

    function getProjects() public view
    returns (string memory projectsData, bool isUserOwner) {
        if(projects.addressIndexes[address(0x0)][NEXT] == address(0x0)) {
            return ("[]", msg.sender == owner);
        }
        address current = projects.addressIndexes[address(0x0)][NEXT];
        Project aux = Project(current);
        (string memory name,string memory createdAt,string memory isProjectClosed,
        string memory vontingInProcess,string memory fileHash) = aux.getProjectData();
        string memory _addresses = string(
            abi.encodePacked(
                "[",
                formatProjectInfo(current,name,createdAt,isProjectClosed,vontingInProcess,fileHash)
            )
        );
        current = projects.addressIndexes[current][NEXT];
        while (current != address(0x0)) {
            aux = Project(current);
            (name,createdAt,isProjectClosed,vontingInProcess,fileHash) = aux.getProjectData();
            _addresses = string(
                abi.encodePacked(_addresses,",",formatProjectInfo(current,name,createdAt,isProjectClosed,vontingInProcess,fileHash))
            );
            current = projects.addressIndexes[current][NEXT];
        }
        _addresses = string(abi.encodePacked(_addresses,"]"));
        return (_addresses, msg.sender == owner);
    }

    function finalizeProject(address _addr) public {
        isOwner();
        projectExist(_addr);
        Project p = Project(_addr);
        p.finalize();
    }

    function deleteProject(address _addr) public {
        isOwner();
        projectExist(_addr);
        Project p = Project(_addr);
        p.cancel();
        removeElement(projects, address(p));
    }
}