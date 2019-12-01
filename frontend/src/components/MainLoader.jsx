import React from 'react';
import Loader from './Loader';

const MainLoader = (props) => {
    const { className, text } = props;
    return (
        <div className={`main-loader-wrapper flex-c-h-center${typeof className === 'string' ?  ` ${className}` : '' }`}>
            {typeof text === 'string' && text.trim() !== '' && (
                <p className="main-loading-text">{text}</p>
            )}
            <Loader wrapperClassName="main-loader"/>
        </div>
    )
}

export default MainLoader;