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


class HomeView extends React.Component {

    constructor() {
        super();
        this.web3 = new Web3(window.web3.currentProvider);
        this.ProjectManager = new this.web3.eth.Contract(projectManagerAbi, contractAddress);
        this.Project = new this.web3.eth.Contract(projectAbi);
    }

    state = {
        loading: false,
    };

    componentDidMount() {
        // this.ProjectManager.methods.getProjects().call()
        //     .then(response => {
        //         this.setState({
        //             loading: false,
        //             projectsAddresses: response !== "0x0000000000000000000000000000000000000000" ? response.split(',') : []
        //         })
        //     })
        //     .catch(console.log)
    }

    renderContent() {
        const { projectsAddresses } = this.state;
        if(projectsAddresses && projectsAddresses.length > 0) {
            return (
                <div>
                    {projectsAddresses.map(projectAddress => (
                        projectAddress
                    ))}
                </div>
            )
        }
        return  (
            <div className="main-loader-wrapper flex-c-h-center">
                <p className="empty-manager-message">You haven't added any project yet.</p>
                <Link to="/project/add" className="add-project-plus-link">
                    <Plus className="add-project-plus"/>
                </Link>
            </div>
        )
    }

    render() {
        const { loading } = this.state;
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
