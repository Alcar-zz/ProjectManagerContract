import React, { Component } from "react";
import { Switch, Redirect, Route } from "react-router";
import Web3 from 'web3';
// components
import Root from "../components/Root";
// import LoadingScreen from "../components/LoadingScreen";
// import ErrorView from '../components/ErrorView';
// routes props
import allRoutes from "./routesPropsByUser";
import MetamaskNotFoundView from "../components/MetamaskNotFoundView";
import MainLoader from "../components/MainLoader";

class Routes extends Component {
    constructor(props) {
        super(props);
        this.setAccount = this.setAccount.bind(this);
        this.initializeMetamask = this.initializeMetamask.bind(this);
    }

    componentDidMount() {
        this.initializeMetamask();
    }

    shouldComponentUpdate(nextProps) {
        const { metamaskExist: nextMetamaskExist } = nextProps;
        const { metamaskExist } = this.props;
        if (metamaskExist !== nextMetamaskExist) {
            return true;
        }
        return false;
    }

    setAccount(accounts) {
        this.props.changeAccount(accounts[0], 'enabled');
    }

    async initializeMetamask() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.enable();
                window.ethereum.on('accountsChanged', this.setAccount)
                this.props.changeAccount(accounts[0], 'enabled');
            } catch (error) {
                this.props.setMetamask('denied')
            }
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            this.props.changeAccount(window.web3.eth.accounts[0], 'enabled');
        }
        else {
            this.props.setMetamask(false)
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

    renderContent(metamaskExist) {
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
                        <Route render={() => <Redirect to="/"/> }/>
                    </Switch>
                );
            default: 
                return <MetamaskNotFoundView metamaskExist={metamaskExist} />
        }
    }

    render() {
        const { metamaskExist } = this.props;
        return (
            <Root wallet={this.props.wallet}>
                {this.renderContent(metamaskExist)}
            </Root>
        );
    }
}

export default Routes;
