import React from 'react';
// css
import './css/HeaderTitle.css'

const HeaderTitle = (props) => {
    return (
        <h1>
            <span className="title-oxoft">
                Oxoft
            </span>
            <span className="title-manager">
                Manager
            </span>
        </h1>
    );
}

export default HeaderTitle;