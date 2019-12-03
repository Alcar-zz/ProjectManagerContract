import React from 'react';
import { withRouter } from 'react-router';
import HeaderTitle from './HeaderTitle';
// css
import './css/Header.css'

class Header extends React.Component {

    render() {
        const { account } = this.props;
        return (
            <header className="header-container flex-space-between">
                <HeaderTitle />
                {account && (
                    <div className="header-account-container flex-c-h-center">
                        <p>Current Account</p>
                        <a
                            href={`https://ropsten.etherscan.io/address/${account}`}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {account}
                        </a>
                    </div>
                )}
            </header>
        )
    }
}

export default withRouter(Header);
