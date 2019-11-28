pragma solidity ^0.5.8;
import './Project.sol';

contract ProjectManager is CommonUtilities {
    Addresses projects;
    mapping(string => bool) projectsNames;
    address payable owner;

    event projectAdded(address project, string name);

    constructor() CommonUtilities(msg.sender) public  {}

    function addProject(string memory _name) public
    isOwner
    returns (address addressContract) {
        require(bytes(_name).length > 0, 'Project name required.');
        require(projectsNames[_name] == false, 'Name already in use.');
        Project p = new Project(_name);
        addElement(projects, address(p));
        projectsNames[_name] = true;
        emit projectAdded(address(p), _name);
        return address(p);
    }

    function getProjects() public view
    isOwner
    returns (string memory projectAddresses) {
        return  getAddressesString(projects);
    }

    function finalizeProject(address _addr) public
    isOwner
    {
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

    function deleteProject(address _addr) public isOwner {
        require(
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[_addr][NEXT] != address(0x0)||
            projects.addressIndexes[address(0x0)][NEXT] == _addr,
            'Project doesn\'t exist.'
        );
        // Stitch the neighbours together
        Project p = Project(_addr);
        (string memory _name,,,) = p.getProjectData();
        p.cancel();
        removeElement(projects, address(p));
        delete projectsNames[_name];
    }
}