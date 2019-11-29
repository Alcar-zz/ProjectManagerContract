pragma solidity ^0.5.8;
import './Project.sol';

contract ProjectManager is CommonUtilities {
    Addresses projects;
    address payable owner;

    event projectAdded(address project);

    constructor() CommonUtilities(msg.sender) public  {}

    function addProject() public
    returns (address addressContract) {
        isOwner();
        Project p = new Project();
        addElement(projects, address(p));
        emit projectAdded(address(p));
        return address(p);
    }

    function getProjects() public view
    returns (string memory projectAddresses) {
        isOwner();
        return  getAddressesString(projects);
    }

    function finalizeProject(address _addr) public {
        isOwner();
        require(
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[address(0x0)][NEXT] == _addr,
            'Project doesn\'t exist.'
        );
        // Stitch the neighbours together
        Project p = Project(_addr);
        p.finalize();
    }

    function deleteProject(address _addr) public {
        isOwner();
        require(
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[address(0x0)][NEXT] == _addr,
            'Project doesn\'t exist.'
        );
        // Stitch the neighbours together
        Project p = Project(_addr);
        p.cancel();
        removeElement(projects, address(p));
    }
}