import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

if(!Promise.prototype.finally) {
    Promise.prototype.finally = function(cb) {
        if(cb) {
            const res = () => this
            const fin = () => Promise.resolve(cb()).then(res)
            return this.then(fin, fin);
        }
        return this; 
    };
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
