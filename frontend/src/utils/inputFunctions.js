import React from 'react';

export default {
    hasError,
    getInputError,
    getInputValue,
};


/**
 * Check if inputErrors have a key with the value in true, so this method return true and do a focus on invalid input
 *
 * @param {object} inputsErrors where each key must be the id of input with the value in true or false example:
 * {email: false, name: true, lastname: false}
 * @return {boolean} true in case of error, false if not have errors
 */
export function hasError() {
    const keyWithErrors = Object.keys(this.inputErrors).find(
        value => this.inputErrors[value] === true
    );
    if (keyWithErrors && keyWithErrors !== null) {
        const element = document.getElementById(keyWithErrors);
        if (element) {
            element.focus();
        }
        return true;
    }
    return false;
}

/**
 *
 * @param {*} target
 * @param {*} hasError
 */
export function getInputError({ id }, hasError) {
    this.inputErrors[id] = hasError;
}

export function getInputValue({ id, value, defaultValue }) {
    if (this.getOnlyModifiedInputs) {
        if (defaultValue !== value) {
            this.inputsValues[id] = value.length > 0 ? value : null;
        } else {
            delete this.inputsValues[id];
        }
    } else {
        this.inputsValues[id] = value.length > 0 ? value : null;
    }
}

export function initializeInputValues() {
    this.inputsValues = {};
    this.inputErrors = {};
    this.getInputError = getInputError.bind(this);
    this.getInputValue = getInputValue.bind(this);
    this.hasError = hasError.bind(this);
}

export function renderError(error, id = 1) {
    if(Array.isArray(error)) {
        return error.map((errorMessage, index) => this.renderError(errorMessage, `${id}-${index}`));
    }
    let splitedErrors = error.split('\n');
    if(splitedErrors.length > 1) {
        return splitedErrors.map((splitedError, index) => <p key={`${id}-${index}-splited-tooltip-message`} className="text-error"> {splitedError} </p>)
    }
    return <p key={`${id}-tooltip-message`} className="text-error"> {error} </p>
}
