// global
import { root } from '../configs/global';
// utils
import { getStyleValue } from '../utils/functions';


let scrollPosition;
let prevContentOverflow;

export const isIos = /iP(hone|od|ad)/i.test(window.navigator.platform);
export const isSafari = /safari/i.test(window.navigator.userAgent);


export const onModalConstruct = () => {
    // prevContentOverflow = getStyleValue('--content-overflow');
    // scrollPosition = window.scrollY;
    // if(isIos || isSafari) {
    //     window.scrollTo(0, 0);        
    // }
}

export const onModalShow = (modalId) => {
    if (isIos || isSafari) {
        // if(modalId && typeof modalId === 'string')
        //     document.getElementById(modalId).classList.add('ios-modal-scroll');
        // document.getElementById('modal-close-button').classList.add('ios-modal');
        // document.getElementById('root').classList.add('ios-modal-open');
        // document.getElementsByTagName('html')[0].classList.add('ios-modal-open');
    } else {
        // root.style.setProperty('--content-overflow','hidden');
    }
}

export const onModalHide = () => {
    if (isIos || isSafari) {
        // document.getElementById('root').classList.remove('ios-modal-open');
        // document.getElementsByTagName('html')[0].classList.remove('ios-modal-open');
    } else {
        // root.style.setProperty('--content-overflow',prevContentOverflow);
    }
    // window.scrollTo(0, scrollPosition);
} 