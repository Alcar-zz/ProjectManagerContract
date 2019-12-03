import React from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import { projectManagerAbi, projectAbi, contractAddress } from '../utils/contracts';
// components
import MainLoader from './MainLoader';
// assets
import {ReactComponent as Plus} from '../assets/images/plus.svg'
// css
import './css/HomeView.css'
import ProjectElementContainer from '../containers/ProjectElementContainer';


class HomeView extends React.Component {

    constructor() {
        super();
        this.web3 = new Web3(window.web3.currentProvider);
        this.ProjectManager = new this.web3.eth.Contract(projectManagerAbi, contractAddress);
        this.Project = new this.web3.eth.Contract(projectAbi);
    }

    componentDidMount() {
        if(!this.projectsAddresses || (this.projectsAddresses && this.projectsAddresses.length === 0)) {
            this.props.loadProject(this.ProjectManager, this.Project, this.props.account);
        }
    }

    shouldComponentUpdate(nextProps) {
        if(this.props.account !== nextProps.account) {
            this.props.loadProject(this.ProjectManager, this.Project, nextProps.account);
            return false;
        }
        if(nextProps.loading !== this.props.loading) {
            return true;
        }
        if(this.props.projectsAddresses !== nextProps.projectsAddresses) {
            return true;
        }
        return true;
    }

    renderAddButton(className='') {
        return (
            <Link to="/project/add" className={`add-project-plus-link${className}`}>
                <Plus className="add-project-plus"/>
            </Link>
        )
    }

    renderContent() {
        const { projectsAddresses, isOwner } = this.props;
        if(projectsAddresses && projectsAddresses.length > 0) {
            return (
                <React.Fragment>
                    <h2>Projects</h2>
                    {isOwner && this.renderAddButton(' logged-add')}
                    <div className="flex-container flex-wrap projects-list">
                        {projectsAddresses.map(address => (
                            <ProjectElementContainer
                                key={`project-${address}`}
                                address={address}
                            />
                        ))}
                    </div>
                </React.Fragment>
            )
        }
        return  (
            <div className="main-loader-wrapper flex-c-h-center">
                <p className="empty-manager-message">{isOwner ? "You haven't added any project yet." : "You aren't participanting in any project."}</p>
                {isOwner && this.renderAddButton()}
            </div>
        )
    }

    render() {
        const { loading } = this.props;
        return (
            <main className={`home-main${loading ? ' flex-c-h-center' : ''}`}>
                {loading ? (
                    <MainLoader 
                        text="loaging projects..."
                    />
                ) : (
                    this.renderContent()
                )}
            </main>
        )
    }
}

export default HomeView;
