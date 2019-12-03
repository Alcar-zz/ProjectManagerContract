pragma solidity ^0.5.8;
import './Project.sol';
import './CommonUtilities.sol';

contract ProjectManager is CommonUtilities {
    Addresses projects;

    event projectAdded(address project);
    event projectFinalized(address project);
    event projectCancelled(address project);

    constructor() CommonUtilities(msg.sender) public  {}

    function projectExist(address _addr) internal view {
        require(
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[_addr][PREV] != address(0x0)||
            projects.addressIndexes[address(0x0)][NEXT] == _addr,
            'Project doesn\'t exist.'
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
        string memory data = aux.getProjectData(msg.sender);
        string memory _addresses = string(
            abi.encodePacked(
                "[",
                data
            )
        );
        current = projects.addressIndexes[current][NEXT];
        while (current != address(0x0)) {
            aux = Project(current);
            data = aux.getProjectData(msg.sender);
            if(bytes(data).length != 0) {
                _addresses = string(
                    abi.encodePacked(_addresses,",",data)
                );
            }
            current = projects.addressIndexes[current][NEXT];
        }
        _addresses = string(abi.encodePacked(_addresses,"]"));
        return (_addresses, msg.sender == owner);
    }

    function getProject(address _project) public view
    returns (string memory projectsData, bool isUserOwner) {
        projectExist(_project);
        Project aux = Project(_project);
        return (aux.getProjectData(msg.sender), msg.sender == owner);
    }

    function finalizeProject(address _addr) public {
        isOwner();
        projectExist(_addr);
        Project p = Project(_addr);
        p.finalize();
        emit projectFinalized(_addr);
    }

    function deleteProject(address _addr) public {
        isOwner();
        projectExist(_addr);
        Project p = Project(_addr);
        p.cancel();
        removeElement(projects, address(p));
        emit projectCancelled(_addr);
    }
}