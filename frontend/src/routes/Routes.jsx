import React, { Component } from "react";
import { Switch, Redirect, Route } from "react-router";
import Web3 from 'web3';
// components
import Root from "../components/Root";
// import LoadingScreen from "../components/LoadingScreen";
// import ErrorView from '../components/ErrorView';
// routes props
import allRoutes, { addRoute } from "./routesPropsByUser";
import MetamaskNotFoundView from "../components/MetamaskNotFoundView";
import MainLoader from "../components/MainLoader";
import { projectManagerAbi, contractAddress } from "../utils/contracts";


class Routes extends Component {
    constructor(props) {
        super(props);
        this.setAccount = this.setAccount.bind(this);
        this.addProject = this.addProject.bind(this);
        this.initializeMetamask = this.initializeMetamask.bind(this);
    }

    componentDidMount() {
        this.initializeMetamask();
    }

    shouldComponentUpdate(nextProps) {
        const { metamaskExist: nextMetamaskExist, isOwner: nextIsOwner } = nextProps;
        const { metamaskExist, isOwner } = this.props;
        if (metamaskExist !== nextMetamaskExist) {
            if(metamaskExist !== 'enable' && nextMetamaskExist === 'enabled') {
                const ProjectManager = new window.web3.eth.Contract(projectManagerAbi, contractAddress);
                this.projectAddedListener = ProjectManager.events.allEvents()
                    .on('data', this.addProject)
                    .on('changed', console.log)
                    .on('error', console.log)
            }
            if(metamaskExist === 'enable' && nextMetamaskExist !== 'enabled') {
                this.projectAddedListener.unsubscribe();
            }
            return true;
        }
        if (nextIsOwner !== isOwner) {
            return true;
        }
        return false;
    }

    addProject(data) {
        console.log(data);
        switch(data.event) {
            case 'projectAdded':
                const ProjectManager = new window.web3.eth.Contract(projectManagerAbi, contractAddress);
                this.props.addProject(ProjectManager.methods.getProject(data.returnValues.project)
                    .call({from: this.props.account}), data.returnValues.project)
                    .catch(console.log);
                break;
            case 'projectFinalized':
            case 'projectCancelled':
                this.props[`${data.event === 'projectFinalized' ? 'finalize' : 'cancel'}ProjectEvent`](data.returnValues.project.toLowerCase());
                break;
            default:
                break; 
        }
    }

    setAccount(accounts) {
        this.props.changeAccount(accounts[0], 'enabled');
    }

    async initializeMetamask() {
        if(typeof window.ethereum === 'undefined' && typeof window.web3 === 'undefined') {
            return this.props.setMetamask(false);
        }
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.enable();
                window.ethereum.on('accountsChanged', this.setAccount);
                this.props.changeAccount(accounts[0], 'enabled');
            } catch (error) {
                this.props.setMetamask('denied');
            }
        }
        else {
            window.web3 = new Web3(window.web3.currentProvider);
            this.props.changeAccount(window.web3.eth.accounts[0], 'enabled');
        }
    }

    render404() {
        return (
            '404'
            // <ErrorView
            //     errorTitle="El contenido que estas buscando no existe"
            //     errorButtonText={errorButtonText}
            //     redirect={redirectUrl}
            // />
        )
    }

    renderContent(metamaskExist, isOwner) {
        switch(metamaskExist) {
            case 'loading': 
                return  (
                    <main className="flex-container flex-1">
                        <MainLoader 
                            text="Loading account from metamask..."
                            className="metamask-loading"
                        />
                    </main>
                )
            case 'enabled':
                return (
                    <Switch>
                        {allRoutes.map(routeProps => (
                            <Route {...routeProps} />
                        ))}
                        {isOwner && <Route {...addRoute} />}
                        <Route render={() => <Redirect to="/"/> }/>
                    </Switch>
                );
            default: 
                return <MetamaskNotFoundView metamaskExist={metamaskExist} />
        }
    }

    render() {
        const { metamaskExist, isOwner } = this.props;
        return (
            <Root wallet={this.props.wallet}>
                {this.renderContent(metamaskExist, isOwner)}
            </Root>
        );
    }
}

export default Routes;
