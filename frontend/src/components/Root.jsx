import React from 'react';
import HeaderContainer from '../containers/HeaderContainer';
// css
import './css/Root.css'

class Root extends React.Component {

    renderUnloggedRoute(route) {
        return (
            <div className="unlogged-route-wrapper">
                {route}
            </div>
        )
    }

    render() {
        const { children, wallet } = this.props;
        return (
            <React.Fragment>
                <HeaderContainer logged={wallet}/>
                {
                //     wallet ? children : (
                //     this.renderUnloggedRoute(children)
                // )
                }
                {children}
            </React.Fragment>
        )
    }
}

export default Root;