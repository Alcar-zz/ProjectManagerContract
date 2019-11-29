const ProjectManager = artifacts.require("ProjectManager");
const Project = artifacts.require("Project");

contract("ProjectManager Contract", async accounts => {
    let firstAcc = accounts[0];
    let secondAcc = accounts[1];
    let thirdAcc = accounts[2];
    let managerContract;

    before(async () => {
        managerContract = await ProjectManager.deployed();
    })

    it("allows project's creation by the owner.", async () => {
        let projectAddress = await managerContract.addProject();
        assert(projectAddress, 'project created');
    });

    it("does not allow project's creation by other user.", async () => {
        try {
            projectAddress = await managerContract.addProject({from: secondAcc});
            assert.fail();
        }catch (e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
    });

    it("allows to check if this is a valid ProjectManagerContract.", async () => {
        let isValidPMContract = await managerContract.isPMContract();
        assert.equal(isValidPMContract, true);
        let projectsAddresses = await managerContract.getProjects.call();
        let notAValidManagerContract = await ProjectManager.at(projectsAddresses.split(',')[0]);
        try {
            isValidPMContract = await notAValidManagerContract.isPMContract();
            assert.fail()
        } catch(e) {
            assert.ok(/revert/.test(e.message));
        }
    });

    it("does not allow to delete or finalize a project that doesn't exist.", async () => {
        try {
            await managerContract.deleteProject('0x4dE7F4fE6ec8622C21ADBF19accbB172dbbA29e5');
            assert.fail();
        } catch (e) {
            assert.ok(/Project doesn't exist/.test(e.message));
        }
        try {
            await managerContract.finalizeProject('0x4dE7F4fE6ec8622C21ADBF19accbB172dbbA29e5');
            assert.fail();
        } catch (e) {
            assert.ok(/Project doesn't exist/.test(e.message));
        }
    });

    it("allows to get all project related to this contract.", async () => {
        // owner
        await managerContract.getProjects.call();
        // participants
        await managerContract.getProjects.call({from: secondAcc});
        // not related user
        await managerContract.getProjects.call({from: thirdAcc});
    });

    it("does not allow to delete or finalize a project without doing it through the project manager contract", async () => {
        let projectsAddresses = await managerContract.getProjects.call();
        let projectAddress = projectsAddresses.split(',')[0];
        let projectContract = await Project.at(projectAddress);
        try {
            await projectContract.finalize();
            assert.fail();
        } catch (e) {
            assert.ok(/parent contract/.test(e.message));
        }
        try {
            await projectContract.cancel();
            assert.fail();
        } catch (e) {
            assert.ok(/parent contract/.test(e.message));
        }
    });

    it("does not allow to finalize a project that has no participants.", async () => {
        let projectsAddresses = await managerContract.getProjects.call();
        let projectAddress = projectsAddresses.split(',')[0];
        try {
            await managerContract.finalizeProject(projectAddress);
            assert.fail();
        } catch (e) {
            assert.ok(/You can't finalize a project without adding any participant/.test(e.message));
        }
    });

    it("allow to finalize a project that has participants.", async () => {
        let projectsAddresses = await managerContract.getProjects.call();
        let projectAddress = projectsAddresses.split(',')[0];
        let projectContract = await Project.at(projectAddress);
        try {
            await projectContract.addParticipant(secondAcc, {value: 1});
            await managerContract.finalizeProject(projectAddress);
            assert.ok(true);
        } catch (e) {
            assert.fail();
        }
    });

    it("does not allow to finalize or delete a project that is already finalized.", async () => {
        let projectsAddresses = await managerContract.getProjects.call();
        let projectAddress = projectsAddresses.split(',')[0];
        try {
            await managerContract.deleteProject(projectAddress);
            assert.fail();
        } catch (e) {
            assert.ok(/The contract is already closed/.test(e.message));
        }
        try {
            await managerContract.finalizeProject(projectAddress);
            assert.fail();
        } catch (e) {
            assert.ok(/The contract is already closed/.test(e.message));
        }
    });

    it("allows to delete a project that has no participants.", async () => {
        await managerContract.addProject();
        let projectsAddresses = await managerContract.getProjects.call();
        let projectAddress = projectsAddresses.split(',')[0];
        await managerContract.deleteProject(projectAddress);
    });
});