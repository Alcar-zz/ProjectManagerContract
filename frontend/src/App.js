import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { configureStore } from "./redux/store";
import RoutesContainer from "./containers/RoutesContainer";
import BigNumber from "bignumber.js";


// store
const store = configureStore();
export const dispatch = store.dispatch;
export const getState = store.getState;

const App = () => {
    BigNumber.set({
        EXPONENTIAL_AT:[-20,20],
        FORMAT: {
            ...BigNumber.FORMAT,
            decimalSeparator: ".",
            groupSeparator: "",
        }
    });

    return (
        <Provider store={store}>
            <Router>
                <RoutesContainer dispatch={dispatch} />
            </Router>
        </Provider>
    );
};

export default App;
