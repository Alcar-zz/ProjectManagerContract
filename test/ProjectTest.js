const ProjectManager = artifacts.require("ProjectManager");
const Project = artifacts.require("Project");

contract("Project Contract", async accounts => {
    let firstAcc = accounts[0];
    let secondAcc = accounts[1];
    let thirdAcc = accounts[2];
    let fourthAcc = accounts[3];
    let fifthAcc = accounts[4];
    let sixthAcc = accounts[5];
    let managerContract;
    let projectContract;
    let otherProjectContract;
    let yetAnotherProjectContract;

    before(async () => {
        managerContract = await ProjectManager.deployed();
        await managerContract.addProject('test1');
        await managerContract.addProject('test2');
        await managerContract.addProject('test3');
        let res = await managerContract.getProjects()
        res = JSON.parse(res.projectsData);
        projectContract = await Project.at(res[0].address);
        otherProjectContract = await Project.at(res[1].address);
        yetAnotherProjectContract = await Project.at(res[2].address);
    })

    it("allows participants's addition by the owner.", async () => {
        await projectContract.addParticipant(secondAcc, {value: 1});
        await projectContract.addParticipant(thirdAcc, {value: 1});
        await projectContract.addParticipant(fourthAcc, {value: 1});
        await projectContract.addParticipant(fifthAcc, {value: 1});
    })

    it("does not allow the owner to be a participant.", async () => {
        try {
            await projectContract.addParticipant(firstAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/The owner can't be a participant./.test(e.message))
        }
    })

    it("does not allow repeated participants", async () => {
        try {
            await projectContract.addParticipant(secondAcc, {value: 1});
            assert.fail();
        } catch(e) {
            assert.ok(/This participant already exists/.test(e.message))
        }
    })

    it("does not allow to add participants without payment.", async () => {
        try {
            await projectContract.addParticipant(sixthAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/participant's payment must be greater than 0/.test(e.message))
        }
    })

    it("does not allow to add participants by other users or the parent contract.", async () => {
        try {
            await projectContract.addParticipant(sixthAcc, {from: secondAcc, value: 1});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
        try {
            await projectContract.addParticipant(sixthAcc, {from: managerContract.address, value: 1});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
    })

    it("allows the parent contract to get project data.", async () => {
        // parent contract
        await projectContract.getProjectData.call(firstAcc, {from: managerContract.address});
    })

    it("does not allow any user besides the parent contract to get project data.", async () => {
        try {
            await projectContract.getProjectData.call(firstAcc, {from: firstAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/parent contract/.test(e.message));
        }
    })

    it("allow participants, owner and parent contract to get all participants's address.", async () => {
        // owner
        await projectContract.getAllParticipants.call();
        // participant
        await projectContract.getAllParticipants.call({from: secondAcc});
        // parent contract
        await projectContract.getAllParticipants.call({from: managerContract.address});
    })

    it("if there are not any participants where trying to get all participants's address, you get an empty string.", async () => {
        let result = await otherProjectContract.getAllParticipants.call();
        assert.equal(result, "");
    })

    it("does not allow any user besides participants, owner and parent contract to get all participant's address.", async () => {
        try {
            await projectContract.getAllParticipants.call({from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner or a participant of this contract/.test(e.message));
        }
    })

    it("allow participants, owner and parent contract to get a participant's data, including his/her own.", async () => {
        // owner
        await projectContract.getParticipant.call(secondAcc);
        // participant
        await projectContract.getParticipant.call(secondAcc, {from: secondAcc});
        // parent contract
        await projectContract.getParticipant.call(secondAcc, {from: managerContract.address});
    })

    it("does not allow any user besides participants, owner and parent contract to get a participant's data.", async () => {
        try {
            await projectContract.getParticipant.call(secondAcc, {from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner or a participant of this contract/.test(e.message));
        }
    })

    it("does not allow to get a participant's data of a participant that doesn't exist.", async () => {
        try {
            await projectContract.getParticipant.call(sixthAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/This participant doesn't exist/.test(e.message));
        }
    })

    it("allows the onwer to start a voting to remove a participant.", async () => {
        await projectContract.votingToRemoveParticipant(fifthAcc);
    })

    it("does not allow to start a new voting while there is one already in process", async () => {
        try {
            await projectContract.votingToRemoveParticipant(fifthAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/There is a voting already in process/.test(e.message));
        }
    })

    it("does not allow to start a voting while there is only one participant.", async () => {
        await otherProjectContract.addParticipant(secondAcc, {value: 1});
        try {
            await otherProjectContract.votingToRemoveParticipant(secondAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/You can't start a voting with just one participant/.test(e.message));
        }
    })

    it("allow to start a voting where there are at least two participants.", async () => {
        await otherProjectContract.addParticipant(thirdAcc, {value: 1});
        await otherProjectContract.votingToRemoveParticipant(thirdAcc);
        await otherProjectContract.cancelParticipantVoting();
    })

    it("does not allow any other user to start a voting to remove a participant.", async () => {
        try {
            // participant
            await projectContract.votingToRemoveParticipant(fifthAcc, {from: thirdAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
        try {
            // parent contract
            await projectContract.votingToRemoveParticipant(fifthAcc, {from: managerContract.address});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
        try {
            // not related user
            await projectContract.votingToRemoveParticipant(fifthAcc, {from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
    })

    it("allows the owner, parent contract and participants to get the status of the current voting.", async () => {
        // owner
        await projectContract.currentVoting.call();
        // parent contract
        await projectContract.currentVoting.call({from: managerContract.address});
        // participant
        await projectContract.currentVoting.call({from: thirdAcc});
    })

    it("does not allow any user besides the owner, parent contract and participants to get the status of the current voting.", async () => {
        try {
            await projectContract.currentVoting.call({from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner or a participant of this contract/.test(e.message));
        }
    })

    it("allows the participants to vote in the voting process.", async () => {
        await projectContract.voteForRemoval({from: thirdAcc});
    })

    it("does not allow a participant to repeat its vote in the same voting.", async () => {
        try {
            await projectContract.voteForRemoval({from: thirdAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You already voted/.test(e.message));
        }
    })

    it("does not allow the owner and participant who is the target of the voting process to vote.", async () => {
        try {
            await projectContract.voteForRemoval({from: fifthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You can't vote in your own removal/.test(e.message));
        }
        try {
            await projectContract.voteForRemoval();
            assert.fail();
        } catch(e) {
            assert.ok(/This participant doesn't exist/.test(e.message));
        }
    })

    it("the participant is removed automatically when the votes required are met.", async () => {
        await projectContract.getParticipant.call(fifthAcc);
        await projectContract.voteForRemoval({from: secondAcc});
        await projectContract.voteForRemoval({from: fourthAcc, gas: 300000 });
        try {
            await projectContract.getParticipant.call(fifthAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/This participant doesn't exist./.test(e.message));
        }
    })

    it("allow participants to leave when the contract is not finalized and there is no voting in process.", async () => {
        await projectContract.addParticipant(sixthAcc, {value: 1});
        await projectContract.leaveContract({from: sixthAcc});
        try {
            await projectContract.getParticipant.call(sixthAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/This participant doesn't exist./.test(e.message));
        }
    })

    it("does not allow a participant to leave while a voting is in process and he/she isn't the target of the voting.", async () =>{
        await projectContract.addParticipant(fifthAcc, {value: 1});
        await projectContract.votingToRemoveParticipant(fifthAcc);
        try {
            await projectContract.leaveContract({from: secondAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/There is a removal voting in process/.test(e.message));
        }
    })

    it("does not allow any other users besides participants to call the leave function.", async () =>{
        try {
            await projectContract.leaveContract({from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/This participant doesn't exist./.test(e.message));
        }
    })

    it("allows the participant who is the target of the voting to leave on his/her own and ends the voting process.", async () =>{
        let votingStatus = await projectContract.currentVoting.call();
        assert.equal(votingStatus.participant, fifthAcc);
        await projectContract.leaveContract({from: fifthAcc});
        votingStatus = await projectContract.currentVoting.call();
        assert.notEqual(votingStatus.participant, fifthAcc);
    })

    it("allows the owner to cancel a voting.", async () => {
        await projectContract.votingToRemoveParticipant(secondAcc);
        await projectContract.cancelParticipantVoting();
    })

    it("does not allow to cancel a voting where isn't a voting in process.", async () => {
        try {
            await projectContract.cancelParticipantVoting();
        } catch(e) {
            assert.ok(/There isn't a voting in process/.test(e.message));
        }
    })

    it("allows the owner to add or replace the file of the contract.", async () => {
        let res = await projectContract.addFile("test");
        assert.equal(res.logs[0].event, 'fileAdded');
    })

    it("does not allow to add the same file.", async () => {
        try {
            await projectContract.addFile("test");
        } catch(e) {
            assert.ok(/File hash must be different./.test(e.message))
        }
    })

    it("allows the owner to delete the file by setting it as empty string.", async () => {
        let res = await projectContract.addFile("");
        assert.equal(res.logs[0].event, 'fileDeleted');
    })

    it("allows the owner, parent contract and participants to get the file.", async () => {
        // owner
        await projectContract.getFile.call();
        // parent contract
        await projectContract.getFile.call({from: managerContract.address});
        // participant
        await projectContract.getFile.call({from: thirdAcc});
    })

    it("doest not allow any other user besides the owner, parent contract and participants to get the file.", async () => {
        try {
            await projectContract.getFile.call({from: sixthAcc});
            assert.fail()
        } catch(e) {
            assert.ok(/You aren't the owner or a participant of this contract/.test(e.message));
        }
    })

    it("does not allow participants to claim their payments if the contract is not finalized.", async () => {
        try {
            await projectContract.claimPayment({from: thirdAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is not closed yet./.test(e.message));
        }
    })

    it("allows participants to claim their payments after the contract is finalized.", async () => {
        await managerContract.finalizeProject(projectContract.address);
        await projectContract.claimPayment({from: thirdAcc});
    })

    it("does not allow participants to claim their payments twice.", async () => {
        try {
            await projectContract.claimPayment({from: thirdAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You already claimed your payment./.test(e.message));
        }
    })

    it("does not allow any other user besides participants to claim payments.", async () => {
        try {
            await projectContract.claimPayment({from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/This participant doesn't exist./.test(e.message));
        }
    })

    it("does not allow to add participants the contract after it was finalized", async () => {
        try {
            await projectContract.addParticipant(sixthAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is already closed./.test(e.message));
        }
    })

    it("does not allow to start or cancel a voting in the contract after it was finalized", async () => {
        try {
            await projectContract.cancelParticipantVoting();
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is already closed./.test(e.message));
        }
        try {
            await projectContract.votingToRemoveParticipant(thirdAcc);
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is already closed./.test(e.message));
        }
    })

    it("does not allow the participants to vote after the contract was finalized", async () => {
        try {
            await projectContract.voteForRemoval({from: thirdAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is already closed./.test(e.message));
        }
    })

    it("does not allow the participants to leave after the contract was finalized", async () => {
        try {
            await projectContract.leaveContract({from: thirdAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is already closed./.test(e.message));
        }
    })

    it("does not allow to add or replace the file of the contract after it was finalized", async () => {
        try {
            await projectContract.addFile("test2");
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is already closed./.test(e.message));
        }
    })

    it("does not allow to delete a project with participants.", async () => {
        await yetAnotherProjectContract.addParticipant(secondAcc, {value: 1});
        try {
            await managerContract.deleteProject(yetAnotherProjectContract.address);
            assert.fail();
        } catch (e) {
            assert.ok(/All participants must leave before cancelling the contract/.test(e.message));
        }
    });

    it("allows the owner to rename a project", async () => {
        let result = await managerContract.getProject(otherProjectContract.address);
        result = JSON.parse(result.projectsData);
        assert.notEqual(result.name, 'test4');
        await otherProjectContract.rename('test4');
        result = await managerContract.getProject(otherProjectContract.address);
        result = JSON.parse(result.projectsData);
        assert.equal(result.name, 'test4');
    })

    it("does not allow to use the same name when renaming a project.", async () => {
        try {
            await otherProjectContract.rename('test4');
            assert.fail();
        } catch(e) {
            assert.ok(/New name must be different/.test(e.message));
        }
    })

    it("does not allow any other user besides the owner to rename a project", async () => {
        try {
            await otherProjectContract.rename('test4', {from: secondAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner of this contract/.test(e.message));
        }
    })

    it("does not allow to rename a project after it was finalized", async () => {
        try {
            await projectContract.rename('test4');
            assert.fail();
        } catch(e) {
            assert.ok(/The contract is already closed./.test(e.message));
        }
    })
});
