// dependencies
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createPromise } from 'redux-promise-middleware';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';

// reducers
import metamaskReducer from './metamaskReducer';
import projectReducer from './projectReducer';

export const promiseSuffixes = {
	success: '_SUCCESS',
	start: '_START',
	error: '_ERROR',
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ;

export function configureStore() {
	const middlewares = [
		thunk,
		reduxImmutableStateInvariant(),
		createPromise({
			promiseTypeSuffixes: ['START', 'SUCCESS', 'ERROR'],
		}),
	];
	return createStore(
		rootReducer(), 
		{},
		(composeEnhancers && composeEnhancers(applyMiddleware(...middlewares)) )|| applyMiddleware(...middlewares)
	);
};

// reducers
function rootReducer() {
	return combineReducers({
		metamaskReducer,
		projectReducer,
	});
}

