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
    returns (string memory projectAddresses) {
        return  getAddressesString(projects);
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