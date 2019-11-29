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

    before(async () => {
        managerContract = await ProjectManager.deployed();
        managerContract.addProject();
        let projectsAddresses = await managerContract.getProjects.call();
        projectContract = await Project.at(projectsAddresses.split(',')[0]);
    })

    it("allows participants's addition by the owner.", async () => {
        await projectContract.addParticipant(secondAcc, {value: 1});
        await projectContract.addParticipant(thirdAcc, {value: 1});
        await projectContract.addParticipant(fourthAcc, {value: 1});
        await projectContract.addParticipant(fifthAcc, {value: 1});
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

    it("allow participants, owner and parent contract to get project data.", async () => {
        // owner
        await projectContract.getProjectData.call();
        // participant
        await projectContract.getProjectData.call({from: secondAcc});
        // parent contract
        await projectContract.getProjectData.call({from: managerContract.address});
    })

    it("does not allow any user besides participants, owner and parent contract to get project data.", async () => {
        try {
            await projectContract.getProjectData.call({from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner or a participant of this contract/.test(e.message));
        }
    })

    it("allow participants, owner and parent contract to get all participant's address.", async () => {
        // owner
        await projectContract.getAllParticipants.call();
        // participant
        await projectContract.getAllParticipants.call({from: secondAcc});
        // parent contract
        await projectContract.getAllParticipants.call({from: managerContract.address});
    })

    it("does not allow any user besides participants, owner and parent contract to get all participant's address.", async () => {
        try {
            await projectContract.getAllParticipants.call({from: sixthAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/You aren't the owner or a participant of this contract/.test(e.message));
        }
    })

    it("allow participants, owner and parent contract to get a participant's data, including his own.", async () => {
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
        await projectContract.addParticipant(fifthAcc, {value: 1});
    })

    it("does not allow a participant to leave while a voting is in process and he/she isn't the target of the voting.", async () =>{
        await projectContract.votingToRemoveParticipant(fifthAcc);
        try {
            await projectContract.leaveContract({from: secondAcc});
            assert.fail();
        } catch(e) {
            assert.ok(/There is a removal voting in process/.test(e.message));
        }
    })

    it("allows the participant who is the target of the voting to leave on his/her own and ends the voting process.", async () =>{
        let votingStatus = await projectContract.currentVoting.call();
        assert.equal(votingStatus.participant, fifthAcc);
        await projectContract.leaveContract({from: fifthAcc});
        votingStatus = await projectContract.currentVoting.call();
        assert.notEqual(votingStatus.participant, fifthAcc);
    })

    // it("does not allows the participant who is the target of the voting to leave on his/her own and ends the voting process.", async () =>{
    //     let votingStatus = await projectContract.currentVoting.call();
    //     assert.equal(votingStatus.participant, fifthAcc);
    //     await projectContract.leaveContract({from: fifthAcc});
    //     votingStatus = await projectContract.currentVoting.call();
    //     assert.notEqual(votingStatus.participant, fifthAcc);
    // })
});
