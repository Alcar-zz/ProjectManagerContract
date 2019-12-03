
import React from 'react';
import { Redirect } from 'react-router-dom';
import IPFS from 'ipfs';
import moment from 'moment';
// assets
import {ReactComponent as File} from '../assets/images/file.svg'
import {ReactComponent as Trash} from '../assets/images/trash.svg'
import {ReactComponent as Check} from '../assets/images/check-circle.svg'
import {ReactComponent as Leave} from '../assets/images/logout.svg'
// css
import './css/ProjectView.css';
import { projectManagerAbi, contractAddress, projectAbi } from '../utils/contracts';
import Loader from './Loader';
import { isValidAddress } from '../utils/functions';
import AddParticipantForm from './AddParticipantForm';
import ParticipantsList from './ParticipantsList';
import MyPaymentContainer from '../containers/MyPaymentContainer';
import AddFile from './AddFile';

class ProjectView extends React.Component {

    constructor(props) {
        super();
        this.cancelProject = this.cancelProject.bind(this);
        this.leaveProject = this.leaveProject.bind(this);
        this.finalizeProject = this.finalizeProject.bind(this);
        this.loadProjectDetails = this.loadProjectDetails.bind(this);
        this.handleEvents = this.handleEvents.bind(this);
        this.isValid = isValidAddress(props.address);
        this.project = new window.web3.eth.Contract(projectAbi, props.address);
        if(this.isValid) {
            this.projectEventsHandler = this.project.events.allEvents()
                .on('data', this.handleEvents)
                .on('changed', console.log)
                .on('error', console.log);
        }
    }

    state = {
        loadingOption: false,
        loading: false,
    }

    componentDidMount() {
        this.props.addParticipants(this.loadProjectDetails(this.props), this.props.address);
    }

    componentWillUnmount() {
        if(this.projectEventsHandler) {
            this.projectEventsHandler.unsubscribe();
        }
        if(this.ipfs) {
            this.ipfs.stop();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.account !== nextProps.account) {
            this.props.addParticipants(this.loadProjectDetails(nextProps, true), nextProps.address);
            return true;
        }
        if(this.props.project && !nextProps.project) {
            this.props.history.replace("/");
            return false;
        }
        if(nextState.loading !== this.state.loading) {
            return true;
        }
        if(nextState.loadingOption !== this.state.loadingOption) {
            return true;
        }
        if(this.props.projectsAddresses !== nextProps.projectsAddresses) {
            return true;
        }
        return true;
    }

    async loadProjectDetails(props, force) {
        this.setState({loading: true});
        let project = props.project;
        if(!project || force) {
            const ProjectManager = new window.web3.eth.Contract(projectManagerAbi, contractAddress);
            let result = await props.addProject(
                ProjectManager.methods.getProject(props.address)
                    .call({from: props.account}), 
                props.address
            );
            if(!result.value) {
                props.history.replace("/");
            }
            project = result.value;
        }
        if(project && !project.isProjectClosed && !this.ipfs) {
            this.ipfs = await IPFS.create();
        }
        let participantsAddresses = await this.project.methods.getAllParticipants().call({from: props.account});
        if(participantsAddresses.length === 0) {
            this.setState({loading: false});
            return {
                participantsAddresses
            }
        }
        participantsAddresses = participantsAddresses.split(',');
        let participantsData = {};
        for(let i = 0; i < participantsAddresses.length; i++) {
            participantsData[participantsAddresses[i]] = await this.loadParticipantData(this.project, participantsAddresses[i], props.account)
        }
        this.setState({loading: false});
        return {
            ...participantsData,
            participantsAddresses
        }
    }

    async loadParticipantData(project, address, account) {
        const participantData = await project.methods.getParticipant(address).call({from: account});
        return {
            payment: participantData.participantPayment,
            address: address,
            didClaim: participantData.paymentClaimed,
        }
    }

    handleEvents(data) {
        let fileHash = "";
        let mod = -1;
        switch(data.event) {
            case 'participantAdded':
                mod = 1;
            case 'participantRemoved':
                this.props.handleParticipantsEvents(
                    data.address.toLowerCase(),
                    data.returnValues.participant.toLowerCase(),
                    mod,
                    data.event === "participantAdded" ? 
                        this.loadParticipantData(
                            this.project,
                            data.returnValues.participant.toLowerCase(),
                            this.props.account
                        ) : null,
                )
                break;
            case 'fileAdded':
                fileHash = data.returnValues.fileHash;
            case 'fileDeleted':
                this.props.handleFileEvents(
                    data.address.toLowerCase(),
                    fileHash
                );
                break;
            case 'paymentClaimed':
                this.props.handlePaymentClaimedEvents(
                    data.address.toLowerCase(),
                    data.returnValues.participant.toLowerCase(),
                )
                break;
            default:
                break; 
        }
    }

    leaveProject() {
        const { address, account } = this.props;
        const { loadingOption } = this.state;
        if(loadingOption) return;
        this.setState({ loadingOption: true });
        this.props.handleParticipantsEvents(
            address,
            account,
            -1,
            this.project.methods.leaveContract().send({from: account})
        )
        .catch(() => {
            this.setState({ loadingOption: false });
        });
    }

    cancelProject() {
        const { loadingOption } = this.state;
        if(loadingOption) return;
        this.setState({ loadingOption: true });
        const ProjectManager = new window.web3.eth.Contract(projectManagerAbi, contractAddress);
        this.props.cancelProject(
            ProjectManager.methods.deleteProject(this.props.address).send({from: this.props.account}),
            this.props.project.address,    
        )
        .catch(() => {
            this.setState({ loadingOption: false });
        });
    }

    finalizeProject() {
        const { loadingOption } = this.state;
        if(loadingOption) return;
        this.setState({ loadingOption: true });
        const ProjectManager = new window.web3.eth.Contract(projectManagerAbi, contractAddress);
        this.props.finalizeProject(
            ProjectManager.methods.finalizeProject(this.props.address).send({from: this.props.account}),
            this.props.project.address,    
        )
        .catch(() => {
            this.setState({ loadingOption: false });
        });
    }

    renderFileOption(fileHash) {
        return typeof fileHash === 'string' && fileHash.trim() !== '' && (
            <a
                href={`https://gateway.ipfs.io/ipfs/${fileHash}`}
                className="project-view-button"
                target="_blank"
                rel="noreferrer noopener"
            >
                <div className="project-view-button-icon delete-button">
                    <File />
                </div>
                See File
            </a>
        )
    }

    renderOptions() {
        const { project, isOwner } = this.props;
        const { loadingOption } = this.state;
        if(!isOwner || project.isProjectClosed) {
            return (
                <div className="project-view-buttons flex-r-h-center flex-wrap">
                    {this.renderFileOption(project.fileHash)}
                    {!isOwner && !project.isProjectClosed && (
                        <button
                            className="project-view-button"
                            onClick={this.leaveProject}
                        >
                            <div className="project-view-button-icon">
                                {loadingOption ? <Loader size="extra-small" /> : <Leave />}
                            </div>
                            Leave
                        </button>
                    )}
                </div>
            )
        }
        
        return (
            <div className="project-view-buttons flex-r-h-center flex-wrap">
                {project.participants > 0 ? (
                    <button
                        className="project-view-button"
                        onClick={this.finalizeProject}
                    >
                        <div className="project-view-button-icon">
                            {loadingOption ? <Loader size="extra-small" /> : <Check />}
                        </div>
                        Finalize
                    </button>
                ) : (
                    <button
                        className="project-view-button"
                        onClick={this.cancelProject}
                    >
                        <div className="project-view-button-icon delete-button">
                            {loadingOption ? <Loader size="extra-small" /> : <Trash />}
                        </div>
                        Delete
                    </button>
                )}
                {this.renderFileOption(project.fileHash)}
            </div>
        )
    }

    renderParticipantsList(participantsAddresses) {
        const { isOwner, account, address } = this.props;
        if(isOwner || participantsAddresses.length > 1) {
            return (
                <ParticipantsList
                    isOwner={isOwner}
                    account={account}
                    address={address}
                    participantsAddresses={participantsAddresses}
                />
            )   
        }
    }

    render() {
        const { project, isOwner, address, account } = this.props;
        const { loading } = this.state;
        if(!this.isValid) return <Redirect to="/" />
        if(loading) return (
            <main className="flex-c-h-center">
                <Loader />
            </main>
        )
        if(!project) return null;
        return (
            <main className="project-main">
                <h2>
                    {project.name}
                </h2>
                {this.renderOptions()}
                <div className="project-element">
                    <h3>Details</h3>
                    <p className="project-element-info">
                        <span>Address: </span>
                        <a
                            className="project-element-address"
                            href={`https://ropsten.etherscan.io/address/${project.address}`}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {project.address}
                        </a>
                    </p>
                    <p className="project-element-info">
                        <span>Added: </span>
                        <span className="project-element-date">{(moment.unix(project.createdAt)).format('M/D/YYYY h:mm a')}</span>
                    </p>
                    <p className="project-element-info">
                        <span>Participants: </span> {project.participants}
                    </p>
                    <p className="project-element-info">
                        <span>Voting in Process: </span>
                        <span className={`${project.votingInProcess ? "project-info-yes" : "project-info-no"}`}>
                            {project.votingInProcess ? "Yes" : "No"}
                        </span>
                    </p>
                    <p className="project-element-info">
                        <span>Closed: </span>
                        <span className={`${project.isProjectClosed ? "project-info-yes" : "project-info-no"}`}>
                            {project.isProjectClosed ? "Yes" : "No"}
                        </span>
                    </p>
                </div>
                {isOwner && !project.isProjectClosed && (
                    <AddFile
                        fileHash={project.fileHash}
                        account={account}
                        address={address}
                        ipfs={this.ipfs}
                        project={this.project}
                    />
                )}
                {!isOwner && project.participantsAddresses && (
                    <MyPaymentContainer
                        address={address}
                        account={account}
                        isClosed={project.isProjectClosed}
                        project={this.project}
                    />
                )}
                {isOwner && !project.isProjectClosed && (
                    <AddParticipantForm
                        address={address}
                        account={account}
                    />
                )}
                {project.participantsAddresses && this.renderParticipantsList(project.participantsAddresses)}
            </main>
        )
    }
}

export default ProjectView;