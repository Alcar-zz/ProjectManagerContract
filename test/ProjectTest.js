const ProjectManager = artifacts.require("ProjectManager");
const Project = artifacts.require("Project");

contract("ProjectManager Contract", async accounts => {
    let firstAcc = accounts[0];
    let secondAcc = accounts[1];
    let thirdAcc = accounts[2];
    let managerContract;
    let projectContract;

    before(async () => {
        managerContract = await ProjectManager.deployed();
        managerContract.addProject('test');
        let projectsAddresses = await managerContract.getProjects.call();
        projectContract = await Project.at(projectsAddresses.split(',')[0]);
    })

    it("allows participants's addition by the owner.", async () => {
        await projectContract.addParticipant(secondAcc, {value: 1});
    })

    it("does not allow participants's addition by other users or the parent contract.", async () => {
        try {
            await projectContract.addParticipant(thirdAcc, {from: secondAcc, value: 1});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
        try {
            await projectContract.addParticipant(thirdAcc, {from: projectContract.address, value: 1});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
    })
});