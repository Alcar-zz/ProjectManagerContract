import React from 'react';
import { Link } from 'react-router-dom';
// css
import './css/HeaderTitle.css'

const HeaderTitle = (props) => {
    return (
        <Link
            to="/"
        >
            <h1>
                <span className="title-oxoft">
                    Oxoft
                </span>
                <span className="title-manager">
                    Manager
                </span>
            </h1>
        </Link>
    );
}

export default HeaderTitle;