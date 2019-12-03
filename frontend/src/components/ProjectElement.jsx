import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
// assets
import {ReactComponent as Info} from '../assets/images/info.svg'
import {ReactComponent as Trash} from '../assets/images/trash.svg'
import {ReactComponent as Check} from '../assets/images/check-circle.svg'
import {ReactComponent as File} from '../assets/images/file.svg'
// css
import './css/ProjectElement.css';
import { projectManagerAbi, contractAddress, projectAbi } from '../utils/contracts';
import Loader from './Loader';

class ProjectElement extends React.Component {

    constructor(props) {
        super();
        this.cancelProject = this.cancelProject.bind(this);
        this.finalizeProject = this.finalizeProject.bind(this);
        this.handleEvents = this.handleEvents.bind(this);
        this.projectEventsHandler = new window.web3.eth.Contract(projectAbi,props.address).events.allEvents()
            .on('data', this.handleEvents)
            .on('changed', console.log)
            .on('error', console.log);
    }

    state = {
        deleting: false,
    }

    componentWillUnmount() {
        if(this.projectEventsHandler) {
            this.projectEventsHandler.unsubscribe();
        }
    }

    handleEvents(data) {
        console.log('element', data);
        let fileHash = "";
        let mod = -1;
        switch(data.event) {
            case 'participantAdded':
                mod = 1;
            case 'participantRemoved':
                this.props.handleParticipantsEvents(
                    data.address.toLowerCase(),
                    data.returnValues.participant.toLowerCase(),
                    mod
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

    finalizeProject() {
        const { deleting } = this.state;
        if(deleting) return;
        this.setState({ deleting: true });
        const ProjectManager = new window.web3.eth.Contract(projectManagerAbi, contractAddress);
        this.props.finalizeProject(
            ProjectManager.methods.finalizeProject(this.props.address).send({from: this.props.account}),
            this.props.project.address,    
        )
        .catch(() => {
            this.setState({ deleting: false });
        });
    }

    cancelProject() {
        const { deleting } = this.state;
        if(deleting) return;
        this.setState({ deleting: true });
        const ProjectManager = new window.web3.eth.Contract(projectManagerAbi, contractAddress);
        this.props.cancelProject(
            ProjectManager.methods.deleteProject(this.props.address).send({from: this.props.account}),
            this.props.project.address,    
        )
        .catch(() => {
            this.setState({ deleting: false });
        });
    }

    renderFileOption(fileHash) {
        return typeof fileHash === 'string' && fileHash.trim() !== '' && (
            <a
                href={`https://gateway.ipfs.io/ipfs/${fileHash}`}
                className="project-element-info-button delete-button"
                target="_blank"
                rel="noreferrer noopener"
            >
                <File />
            </a>
        )
    }

    renderOptions() {
        const { project, isOwner } = this.props;
        const { deleting } = this.state;
        if(!isOwner || project.isProjectClosed) {
            return (
                <div className="project-element-info-buttons flex-container">
                    {this.renderFileOption(project.fileHash)}
                    <Link
                        className="project-element-info-button"
                        to={`/project/address/${project.address}`}
                    >
                        <Info />
                    </Link>
                </div>
            )
        }
        return (
            <div className="project-element-info-buttons flex-container">
                {project.participants > 0 ? (
                    <button
                        className="project-element-info-button delete-button"
                        onClick={this.finalizeProject}
                    >
                        {deleting ? <Loader size="extra-small" /> : <Check />}
                    </button>
                ) : (
                    <button
                        className="project-element-info-button delete-button"
                        onClick={this.cancelProject}
                    >
                        {deleting ? <Loader size="extra-small" /> : <Trash />}
                    </button>
                )}
                {this.renderFileOption(project.fileHash)}
                <Link
                    className="project-element-info-button"
                    to={`/project/address/${project.address}`}
                >
                    <Info />
                </Link>
            </div>
        )
    }

    render() {
        const { project } = this.props;
        if(!project) return null;
        return (
            <div className="project-element-wrapper">
                <div className="project-element">
                    <p className="project-element-info project-element-name">
                        <span>Project: </span>{project.name}
                    </p>
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
                    {this.renderOptions()}
                </div>
            </div>
        )
    }
}

export default ProjectElement;