import React from 'react';
// assets
import metamask from '../assets/images/metamask.png';
// css
import './css/MetamaskNotFoundView.css';

class MetamaskNotFoundView extends React.Component {

    renderContent(metamaskExist) {
        if(metamaskExist) {
            return (
                <React.Fragment>
                    <h2>Metamask access denied</h2>
                    <p>Please reload the page and grant access to your account to continue.</p>
                </React.Fragment>
            )
        }
        return (
            <React.Fragment>
                <a 
                    className="metamask-link"
                    href="https://metamask.io/"
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    <div className="metamask-icon-wrapper">
                        <img
                            alt="metamask-icon"
                            src={metamask}
                            className="metamask-icon"
                        />
                    </div>
                    Metamask.io
                </a>
            </React.Fragment>
        )
    }

    render() {
        const { metamaskExist } = this.props;
        return (
            <main className="mm-not-found-main">
                <div className="mm-not-found-content">
                    {this.renderContent(metamaskExist)}
                </div>
            </main>
        )
    }
}

export default MetamaskNotFoundView;