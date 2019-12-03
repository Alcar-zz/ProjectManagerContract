// dependecies
import moment from 'moment';
// importing global root css
import BigNumber from 'bignumber.js';
// global
import { root } from '../configs/global';
import { timezone } from '../configs/global';


const usdNumberFormat = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3
}



export function isValidAddress(address) {
    const unprefixedAddress = address.replace(/^0x/, '');
    if (/^([A-Fa-f0-9]{40})$/.test(unprefixedAddress))
        return unprefixedAddress;
    else
        return false;
}

export const isMac = navigator.userAgent.indexOf("Mac") !== -1;


export function formatNotificationNumbers(count) {
    return count > 99 ? '+99' : count;
}

export function formatDate(date, tz) {
    if(!date || Number.isNaN(Date.parse(date))) {
        return null;
    }
    return new moment(date + (tz || timezone)).format('DD/MM/YYYY HH:mm')
}

export function formatNodeJSDate(date) {
    if(!date || Number.isNaN(Date.parse(date))) {
        return null;
    }
    if(/[TZ]/g.test(date)) {
        return date.replace('T', ' ').replace(/(\.\d*)?Z/, '+0200')
    }
    return date + timezone;
}

export function compareStatus(status, value, operator) {

    switch(operator) {
        case '>':
            return status > value
        case '<':
            return status < value
        default:
            return status === value;
    }
}

export function toFormat(value, length = 2) {
    if(!value) {
        return new BigNumber(0).toFormat(length);
    }
    if(value.toFormat) {
        return value.toFormat(length);
    }
    return new BigNumber(value).toFormat(length);
}

export function toCustomFormat(value, length = 2, format = usdNumberFormat) {
    if(!value) {
        return new BigNumber(0).toFormat(length, format);
    }
    if(value.toFormat) {
        return value.toFormat(length, format);
    }
    return new BigNumber(value).toFormat(length, format);
}
export function saveSetState(state, callback) {
    if (this.active) {
        this.setState(state, callback);
    }
}
export function isTouch() {
    return 'ontouchstart' in window || 'ontouchstart' in document.documentElement;
}
export function generateKey(keyword = 'key', id = null) {
    const keyUniqueNumber = id || parseInt(Math.random() * Math.pow(10, 6) + Date.now());
    return keyword === false ? keyUniqueNumber : `${keyword}-${keyUniqueNumber}`;
}
export const validateInputWithRules = function(value, rules) {
    let newValue = value;
    let error = false;
    let errorMessages = [];
    const { replace, check } = rules;
    if (replace) {
        replace.map(replaceRule => {
            newValue = newValue.replace(replaceRule.rule, replaceRule.replaceString)
            return newValue;
        })
    }
    if (check) {
        check.map(({ type, rule, errorIfPositive = false, errorMessage}) => {
            let test = null;
            if  (type === 'test' || type === 'match') {
                test = type === 'test' ? rule.test(newValue) : !!newValue.match(rule);
                
            }
            if  (type === 'function' && typeof rule === 'function') {
                test = rule(newValue);
            }
            if ((test === false && !errorIfPositive) || (test === true && errorIfPositive)) {
                error = true;
                errorMessages.push(errorMessage);
            }
            return null;
        });
    }
    return {
        newValue,
        error,
        errorMessages
    };
}

export function phoneFormatter({value}) {
    let newValue = value.replace(/-/g, '');
    let number = `${newValue.substring( newValue.length - 7, newValue.length - 4)}-${newValue.substring( newValue.length - 4, newValue.length + 1)}`;
    let areaCode = newValue.substring(newValue.length - 10, newValue.length - 7);
    let countryCode = newValue.substring(0, newValue.length - 10) ;
    // return `${countryCode !== '' && countryCode !== '0' ? `${countryCode}-`: countryCode}${areaCode}-${number}`;
    return `${countryCode && countryCode !== '' ? countryCode : ''}${areaCode}-${number}`;
}

export function phoneInputFormatter(value, max = 10) {
    let newValue = value.replace(/-/g, '');
    const actualLength = newValue.length;
    if ((actualLength > 3 && actualLength < 7)) {
        newValue = `${newValue.substring(0, 3)}-${newValue.substring(3, actualLength + 1)}`;
    } else if (actualLength > 6) {
        newValue = `${newValue.substring(0, 3)}-${newValue.substring(3, 6)}-${newValue.substring(6, (actualLength + 1) < max ? actualLength + 1 : max )}`;
    }
    return newValue;
}

export function getStyleValue(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

export function getGalleryCardWidth(cardWidth) {
    return Math.floor((this.getGalleryWrapperWidth() * cardWidth) / 100);
}

export const rand = function(min, max, withDecimal = false) {
	if (withDecimal) {
		return (Math.random() * (max - min)) + min;
	} else {
		return Math.floor((Math.random() * (max - min)) + min);
	}
}

export function getValidatorErrorsInString(error, key = null) {
    if (!error) 
        return null;
    if (!error.validation_errors) {
        if (error.message) 
            return error.message;
        return null;
    };
    let message = '';
    const data = key ? error.validation_errors[key] : Object.keys(error.validation_errors);
    if (!data)
        return null;
    data.forEach(errorKey => message += `${error.validation_errors[errorKey]} \n`);
    return message;
}

export function getMainScrollElement() {
    const isIos = /iP(hone|od|ad)/i.test(window.navigator.platform);
    const nav = window.navigator.userAgent.toLowerCase().includes('safari');
    const navVersion = window.navigator.userAgent.match(/(Version|version\/).*\s/) && window.navigator.userAgent.match(/(Version|version\/).*\s/)[0];
    
    if (nav && navVersion) {
        if (isIos || parseInt(navVersion.match(/[^Version|version/]\d*/)[0]) < 13) {
            return document.body;
        }
    }
    return document.documentElement;
}

export function infiniteScroll(element, offset = 100, contentHeightTosubstrac = 0) {
    if (element.tagName === 'BODY' || element.tagName === 'HTML') {
        return ((element.offsetHeight - contentHeightTosubstrac) - element.scrollTop) - offset <= window.innerHeight;
    }
    // return (element.offsetHeight - element.scrollTop) - offset <= element.firstElementChild.offsetHeight;
    return(Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight - offset /* offset */);
}

export function elementOffset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

export function storeIndexInKeys(arrayData, keyName = 'id') {
    const objecData = {};
    arrayData.forEach((value, key) => {
        objecData[ value[keyName].toString() ] = key;
    });
    return objecData;
}

function getDecimals(decimalsString, maxDecimals = 1, defaultValue = null, defaultSeparetor = ',') {
    if(decimalsString) {
        return `${defaultSeparetor + decimalsString.substr(0, maxDecimals)}`;
    }
    return defaultValue ? defaultSeparetor + defaultValue : '';
}

export function shortFormatNumber(number, hideDecimals = true) {
    const newNumber = new BigNumber(number);
    if (number >= 100000 && number < 1000000) {
        number = newNumber.dividedBy(1000).toString().split('.');
        return `${number[0]}${getDecimals(number[1])} Mil`;
    }
    if (number < 1000000000 && number >= 1000000) {
        number = newNumber.dividedBy(1000000).toString().split('.');
        return `${toFormat(number[0] + getDecimals(number[1], 2, '00', '.'))} M`;
    }
    if (number < 1000000000000 && number >= 1000000000) {
        number = newNumber.dividedBy(1000000000).toString().split('.');
        return `${toFormat(number[0] + getDecimals(number[1], 2, '00', '.'))} Mil M`;
    }
    if (number >= 1000000000000) {
        number = newNumber.dividedBy(1000000000000).toString().split('.');
        return `${toFormat(number[0] + getDecimals(number[1], 2, '00', '.'))} B`;
    }
    return toFormat(number, hideDecimals ? 0 : 2);
}
export function pluckObjectArray(arrObj, key) {
    if (!arrObj || arrObj.length <= 0) {
        return [];
    }
    return arrObj.map(obj => obj[key]);
}
export function areArraysEqual(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length !== arr2.length)
        return false;
    return (!arr1.length && !arr2.length) || (arr1.length === arr1.filter(value => arr2.indexOf(value) !== -1).length);
}

export function mergeArrayObjects(arrObj1, arrObj2, key = 'id') {
    const newArray = [...arrObj1];
    arrObj2.forEach((data) => {
        if (newArray.findIndex(obj => obj[key] === data[key]) === -1) {
            newArray.push(data);
        }
    });
    return newArray;
}

/**
 * This method compare two array objects for the provided key to find the differences
 * @param {*} arrObj1
 * @param {*} arrObj2 
 * @param {*} key 
 * @return Array of Object with the diferents values between the two array 
 */
export function arrayObjectDiff(arrObj1, arrObj2, key) {
    const newArray = [];
    arrObj1.forEach((data) => {
        if (arrObj2.findIndex(obj => obj[key] === data[key]) === -1) {
            newArray.push(data);
        }
    });
    arrObj2.forEach((data) => {
        if (arrObj1.findIndex(obj => obj[key] === data[key]) === -1) {
            newArray.push(data);
        }
    });
    return newArray;
}

export function getFile(file) {
    let { type, name } = file;
    if(type) {
        if(this.validImageTypes[type]) {
            file.url = URL.createObjectURL(file);
            return file;
        }
        return 'invalidImage';
    }
    if(name) {
        if(this.validImageTypes[name.replace(/^.*\.([^.]+)$/, '$1')]) {
            file.url = URL.createObjectURL(file);
            return file;
        }
        return 'invalidImage';  
    }
    return 'invalidImage';  
}

export function formatToNumber(number) {
    if (!number) return 0;
    return number.replace(/\./g, '').replace(',', '.');
}

export function withDecimalToNumber(value) {
    if (!value) return 0;
    return value.replace(/\./g, '').replace(',', '');
}

export function addValueOnAllObjects(arrObj, object) {
    return arrObj.map((obj) => ({...obj, ...object}))
}

export function arrayObjectToKeyData(arrObj, dataKey = 'id', arrayKeyName = 'ids') {
    const object = {};
    const ids = [];
    arrObj.forEach(obj => {
        object[ obj[dataKey] ] = obj
        ids.push(obj[dataKey]);
    })
    object[arrayKeyName] = ids;
    return object;
}

export function getCartItemIds(cartItemIds, newCartItemId) {
    if (cartItemIds.includes(newCartItemId))
        return cartItemIds;
    return [...cartItemIds, newCartItemId];
}
export function getCustomizationsTotal(customizationsObject, optionIds = null) {
    if (customizationsObject === null || customizationsObject === undefined) {
        return 0;
    }
    const customizationsTotal = [].concat(...Object.keys(customizationsObject)
    .map(customization => customizationsObject[customization]
    .map(option => {
        if (optionIds)
            optionIds.push(option.id);
        return option.price;
    })));
    return customizationsTotal.length > 0 ? customizationsTotal.reduce((accumulator, currentValue) => (new BigNumber(accumulator)).plus(currentValue)) : 0
}
export function didLocalStorageUpdate(addToCartItems, selectedData) {
    let updated = false;
    for (const item of addToCartItems) {
        let isEqual = true;
        for (const key of Object.keys(item)) {
            if (key !== 'observations' && key !== 'quantity') {
                if (Array.isArray(item[key])) {
                    if (!areArraysEqual(item[key], selectedData[key])) {
                        isEqual = false;
                        break;
                    }
                } else if (selectedData[key] !== item[key]) {
                    isEqual = false;
                    break;
                }
            }
        }
        if (isEqual) {
            updated = true;
            item.observations = selectedData.observations && item.observations.trim() !== selectedData.observations.trim() ? item.observations + ', ' + selectedData.observations : item.observations;
            item.quantity = item.quantity + selectedData.quantity;
            break;
        }
    }
    return updated;
}
export function getItemQuantity() {
    return this.itemQuantity;
}
export function setItemQuantity(operation) {
    if (operation === 'add')
        return this.itemQuantity += 1;
    if (operation === 'remove')
        return this.itemQuantity -= 1;
}
export function setTotalItemPrice() {
    const getItemPrice = () => {
        if (this.props.hasCustomizations) {
            return toFormat((new BigNumber(getCustomizationsTotal(this.getSelectedCustomizationsWithOptions())))
            .plus(this.props.item.price)
            .multipliedBy(this.getSelectedData().quantity));
        } else {
            return toFormat(new BigNumber(this.props.item.price)
            .multipliedBy(this.getItemQuantity()))
        }
    };
    this.setState({totalItemPrice: getItemPrice()});
}
export function setTotalItemPriceFromSideCart(customizations, itemPrice) {
    if (customizations) {
        return toFormat((new BigNumber(getCustomizationsTotal(customizations)))
        .plus(itemPrice));
    } else {
        return toFormat(new BigNumber(itemPrice))
    }
}
export function getObservations() {
    return this.observations;
}
export function getObservationsValue({value}) {
    return this.observations = value;
}
function plusOrSubtract(operation, value) {
    if (operation === 'plus') 
        return value += 1;
    if (operation === 'minus') 
        return value -= 1;
}
export function changeOfflineItemQuantity(setOfflineItemQuantity, newCartItemQuantity, operation = 'plus', itemAmount = null) {
    const { cartItemId, orderId, cart } = this.props;
    const itemTotalAmount = itemAmount || this.getAndSetPrices(cartItemId, newCartItemQuantity);
    const { customizations, ...cartItemData } = cart[cartItemId];
    const addToCartItems = window.localStorage.getItem('addToCartItems') && JSON.parse(window.localStorage.getItem('addToCartItems'));
    if (cart[cartItemId]) {
        addToCartItems.forEach(cartItem => {
            if (cartItem.item_id === cartItemData.item_id && areArraysEqual(cartItemData.selected_customization_options, cartItem.selected_customization_options)) {
                cartItem.quantity = plusOrSubtract(operation, cartItem.quantity);
            }
        });
    } 
    window.localStorage.setItem('addToCartItems', JSON.stringify(addToCartItems));

    setOfflineItemQuantity({
        [orderId]: {
            ...cart[orderId],
            total_price: new BigNumber(cart[orderId].total_price) [operation] (new BigNumber(itemTotalAmount)).toString()
        },
        [cartItemId]: {
            ...cart[cartItemId],
            quantity: newCartItemQuantity
        },
        price: new BigNumber(cart.price) [operation] (new BigNumber(itemTotalAmount)).toString()
    });
}

export function mergeUniquePaginationArrayValues(existingElements = [], newElements = []) {
    if(!existingElements || (existingElements && existingElements.length === 0)) {
        return newElements || [];
    }
    let newArray = [...existingElements];
    newElements.map(id => {
        if(!existingElements.includes(id)) {
            newArray.push(id);
        }
    })
    return newArray;
}

export function mergeUniqueArrayValues(arr1, arr2) {
    let arr = [];
    let arrayShort = [];
    if (arr1.length > arr2.length) {
        arr = [...arr1];
        arrayShort = [...arr2];
    } else {
        arr = [...arr2];
        arrayShort = [...arr1];
    }
    arrayShort.forEach(value => {
        if (arr.indexOf( value ) === -1) {
            arr.push(value);
        }
    });
    return arr;
}

export function objectsDiff(obj1, obj2) {
    const object = {};
    Object.keys(obj2).forEach((key) => {
        if (!obj2.hasOwnProperty(key)) {
            return;
        }
        if (obj1[key] !== obj2[key]) {
            object[key] = obj2[key];
        }
    });
    return object;
}

export function getValueOrDefault(object, key, defaultObject = null) {
    if (object && object[key]) {
        return object[key]
    }
    return defaultObject;
}

export function arrayObjectToObject(arr, key = 'id') {
    const object = {};
    arr.forEach(obj => {
        object[obj[key]] = obj;
    });
    return object;
}

export function objIsNotEmpty(obj) {
    try {
        return Object.keys(obj).length > 0;
    } catch (e) {
        return false;
    }
}

export function setRef(variableName, callback, DOMElement) {
    if (DOMElement) {
        this[variableName] = DOMElement;
        if (typeof callback === 'function') {
            callback();
        }
    }
}

export function arrayUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

export function formatRif(input) {
    if(input.value && input.value !== '') {
        input.value = input.value.replace(/([jgv])(\d{8})(\d)/i, '$1-$2-$3');
    }
    return input.value;
}

export function setCssVariable(varName, value) {
    root.style.setProperty(varName, value);
}

export function restaurantCode(inputRef) {
    if(inputRef && inputRef.value) {
        inputRef.value = inputRef.value.toUpperCase();
    }
}

export function validateRif(inputRef, ) {
    if(inputRef.value) {
        let newValue = inputRef.value;
        if(newValue && newValue !== '') {
            let letter = /^[jvg]/i.test(newValue) ? `${newValue[0].toUpperCase()}`  : null;
            newValue = newValue.replace(/[^\d]/g, '');
            if(!newValue.length && letter) {
                newValue = letter;
            }
            else if(newValue.length && !letter) {
                newValue = newValue.substr(0, 8) + (newValue[8] ? `-${newValue[8]}` : '');
            }
            else if(newValue.length && letter) {
                newValue = letter + '-' + newValue.substr(0, 8) + (newValue[8] ? `-${newValue[8]}` : '');
            }
        }
        let posCorrention = 0;
        if(/^-/i.test(inputRef.value) || /^([jvg]-)?\d{7}-\d+$/i.test(inputRef.value)) {
            posCorrention = 1;
        }
        if(/^([jvg]-)?\d{9}$/i.test(inputRef.value) && inputRef.selectionEnd !== inputRef.value.length) {
            posCorrention = -1;
        }
    
        let pos = inputRef.selectionEnd - (inputRef.value.length - newValue.length) + posCorrention;
        inputRef.value =  newValue;
        inputRef.setSelectionRange(pos, pos);
    }
}

export function ErrorView(data, context) {
    this.name = 'ErrorView';
    this.message = 'Error al cargar la vista.';
    this.data = {
        errorTitle: 'El contenido que estas buscando no existe o fue movido.',
        errorButtonText: 'Ir al dashboard',
        onErrorButtonClick: null,
        ...data,
    };
    this.stack = (new Error()).stack;
}