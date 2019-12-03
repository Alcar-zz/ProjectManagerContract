import React from 'react';

const Loader =  (props) => {
    const { className = "lds-spinner", wrapperProps = {}, wrapperClassName, size } = props;
    return (
        <div 
            className={`lds-spinner-wrapper ${wrapperClassName}`}
            {...((size && {'spinner-size': size}) || {})}
            {...wrapperProps}
        >
            <div className={className}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}
Loader.defaultProps = {
    wrapperClassName: ''
}

export default Loader;