let baseUrl = '';
// let baseUrl = 'undefined';
let token = '';
// request error timeout
let timeout = (1000 * 60);
// global headers
let globalHeaders = {}; // 'Accept': 'application/json',


class Ajax {
    // base url
    static get baseUrl() {
        return baseUrl;
    }
    static set baseUrl(url) {
        if ( typeof url === 'string' ) {
            baseUrl = url;
        } else {
            throw new Error('Ajax Nightmare: "baseUrl" must be a string');
        }
    }
    // bearer token
    static get token() {
        return token;
    }
    static set token(bearer) {
        if ( typeof bearer === 'string' ) {
            token = bearer;
        } else {
            throw new Error('Ajax Nightmare: "token" must be a string');
        }
    }
    // error timeout
    static get timeout() {
        return timeout;
    }
    static set timeout(milliseconds) {
        timeout = milliseconds;
    }
    // global headers
    static set globalHeaders(headers) {
        if ( typeof headers === 'object' ) {
            globalHeaders = headers;
        } else {
            throw new Error('Ajax Nightmare: "globalHeaders" must be a object');
        }
    }
    static get globalHeaders() {
        return globalHeaders;
    }

    static make(endpoint = '', options = {}) {
        return new Ajax(endpoint, options);
    }

    // native XMLHttpRequest properties
    get status() {
        return this.xhr.status;
    }
    get statusText() {
        return this.xhr.statusText;
    }
    get responseText() {
        return this.xhr.responseText;
    }
    get readyState() {
        return this.xhr.readyState;
    }

    constructor(endpoint = '', options = {}) {
        this.xhr = new XMLHttpRequest();
        this.success = false;
        this.error = false;
        this.options = Ajax.__setRequestOptions(options, endpoint);
        if(this.options.credentials === false || this.options.credentials === true )
            this.xhr.withCredentials = this.options.credentials;
        this.url = (this.options.useBaseUrl) ? `${baseUrl}${endpoint}` : endpoint;
        this.__progressListeners();
        this.__resultListeners();
        this.__setTimeout(options);
        if (this.options.autoSend) {
            this.send();
        }
        this.abort = this.abort.bind(this);
        this.send = this.send.bind(this);
        this.autoShowErrors = options.autoShowErrors ? options.autoShowErrors : false;
        this.defaultAutoErrorMessage = options.defaultErrorMessage;
    }
    initAjax(endpoint = '', options = {}){
        this.xhr = new XMLHttpRequest();
        this.success = false;
        this.error = false;
        this.hashHeaders = false;
        this.options = Ajax.__setRequestOptions(options, endpoint);
        if(this.options.credentials === false || this.options.credentials === true )
            this.xhr.withCredentials = this.options.credentials;
        this.url = (this.options.useBaseUrl) ? `${baseUrl}${endpoint}` : endpoint;
        this.__progressListeners();
        this.__resultListeners();
        this.__setTimeout(options);
        if (this.options.autoSend) {
            this.send();
        }
        this.autoShowErrors = options.autoShowErrors ? options.autoShowErrors : false;
        this.defaultAutoErrorMessage = options.defaultErrorMessage;
        return this;
    }

    static __setBody(body, method, headers = {}) {
        if (method.toUpperCase() === 'PUT' || headers.hasOwnProperty('Content-Type') || headers.hasOwnProperty('content-type')) {
            return JSON.stringify(body);
        } else {
            const formData = new FormData();
            Object.keys(body).forEach((key) => {
                Ajax.__formatToFormData(formData, key, body[key]);
            });
            return formData;
        }
    }

    static __formatToFormData(formData, key, data) {
        if (data instanceof Array) {
            for (let i = 0; i < data.length; i += 1) {
                if (data instanceof Array || data instanceof Object) {
                    Ajax.__formatToFormData(formData, `${key}[${i}]`, data[i]);
                }
            }
        } else if (data instanceof Object && !(data instanceof File) && !(data instanceof Image) && !(data instanceof Blob)) {
            for (const prop in data) {
                if (data instanceof Array || data instanceof Object) {
                    Ajax.__formatToFormData(formData, `${key}[${prop}]`, data[prop]);
                }
            }
        } else {
            formData.append(key, data);
        }
    }

    send() {
        this.xhr.open(this.options.method, this.url, true);
        this.xhr.responseType = this.options.responseType;
        this.__setHeaders();
        if (this.options.body) {
            this.xhr.send(this.options.body);
        } else {
            this.xhr.send();
        }
        return this;
    }

    __setHeaders() {
        for(let key of Object.keys(this.options.headers)) {
            if (this.options.method.toUpperCase() !== 'PUT') {
                if (key !== 'Content-Type' || key !== 'content-type') {
                    this.xhr.setRequestHeader(key, this.options.headers[key]);
                }
            } else {
                this.xhr.setRequestHeader(key, this.options.headers[key]);
            }
        }
        if(this.options.credentials || token.length > 0) {
            this.xhr.setRequestHeader('Authorization', token);
        }
    }

    abort() {
        if (this.xhr.readyState < 4 && this.xhr.readyState > 0) {
            this.xhr.abort();
        }
    }

    __progressListeners() {
        this.xhr.addEventListener('progress', (e) => {
            this.downloadProgress = (e.loaded / e.total) * 100;
            this.options.onDownloadProgress(e, this.downloadProgress)
        });
        this.xhr.upload.addEventListener('progress', (e) => {
            this.uploadProgress = (e.loaded / e.total) * 100;
            this.options.onUploadProgress(e, this.uploadProgress)
        });
        this.xhr.onreadystatechange = this.options.onReadyStateChange;
    }

    __getResponse() {
        try {
            return JSON.parse(this.xhr.response);
        } catch (error) {
            return this.xhr.response;
        }
    }

    __resultListeners() {
        this.result = () => new Promise( (resolve, reject) => {
            this.xhr.onload = () => {
                this.error = false;
                this.success = this.__getResponse();
                if(this.status >= 200 && this.status < 300) {
                    resolve(
                        this.options.responseType === 'text' ? {
                            ...this.success, status: this.status
                        } : {
                            [this.options.responseType]: this.success, status: this.status
                        }
                    );
                } else {
                    return reject({ ...this.success, status: this.status });
                }
            };
            if(typeof this.options.onAbort === 'function') {
                this.xhr.onabort = (error) => this.options.onAbort(error, reject);
            }
            this.xhr.ontimeout = () => {
                this.success = false;
                this.error = {
                    fail: true,
                    type: 'timeout',
                    status: this.status,
                    message: 'Timeout Error',
                    response: this.__getResponse(),
                };
                reject({
                    ...this.error
                });
            };
            this.xhr.onerror = () => {
                this.success = false;
                this.error = {
                    fail: true,
                    type: 'error',
                    status: this.status,
                    message: 'Network Connection Error',
                    response: this.__getResponse(),
                };
                reject({
                    ...this.error
                });
            };
        });
    }

    static __setRequestOptions(options, endpoint){
        const {
            method = 'GET',
            headers = {},
            body = false,
            credentials = false,
            onUploadProgress = () => null,
            onDownloadProgress = () => null,
            onReadyStateChange = () => null,
            useBaseUrl = true,
            autoSend = endpoint !== '' ? true : false,
            responseType = 'text',
            onAbort,
        } = options;
        const newOptions = {
            method,
            headers: Object.assign({}, globalHeaders, headers),
            body: (body) ? Ajax.__setBody(body, method, headers) : false,
            credentials,
            onUploadProgress,
            onDownloadProgress,
            useBaseUrl,
            onReadyStateChange,
            autoSend,
            responseType,
            onAbort: typeof onAbort === 'function' && onAbort,
        };
        return newOptions;
    }

    __setTimeout(options) {
        if(options.onUploadProgress) {
            this.xhr.timeout = 0;
            return;
        }
        this.xhr.timeout = options.timeout || timeout;
    }
};


let xhr = new XMLHttpRequest();

const getResponse = function(response) {
    try {
        return JSON.parse(response);
    } catch (error) {
        return response;
    }
}

const _uploadFile = (endpoint, options) => {
    const {
        body = {}, credential=token, onProgress, method = 'get'
    } = options;
    xhr = new XMLHttpRequest();
    return new Promise((response, reject)=>{
        let formData = new FormData();
        xhr.open(method, !endpoint.includes(baseUrl) ? baseUrl + endpoint : endpoint, true);
        xhr.onload = e => {
            const xhrResponse = {
                ...getResponse(xhr.response),
                status: xhr.status,
            };
            if(xhr.status >= 200 && xhr.status < 300) {
                response(xhrResponse);
            }
            reject(xhrResponse);
        };
        for(let key of Object.keys(body)) {
            formData.append(key, body[key]);
        }
            
        xhr.onerror = e => {
            reject({
                error: {
                    fail: true,
                    type: 'error',
                    status: xhr.status,
                    message: 'Network Connection Error',
                    response: getResponse(xhr.response),
                }
            });
        };
        xhr.onabort = e => {
            reject({
                error: {
                    fail: true,
                    type: 'abort',
                    status: xhr.status,
                    message: 'Aborted Request',
                    response: getResponse(xhr.response),
                }
            });
        };
        if(xhr.upload && onProgress)
            xhr.upload.onprogress = onProgress;
        xhr.setRequestHeader('Accept','application/json');
        if(credential){
            xhr.withCredentials = true;
            xhr.setRequestHeader('Authorization',credential)
        }
        else
            xhr.withCredentials = false;        
        xhr.send(formData);
    });
}

const _abort = () => {
    if (xhr instanceof XMLHttpRequest) {
        xhr.abort();
    }
    xhr = new XMLHttpRequest();
}

Ajax.uploadFile = _uploadFile;
Ajax.abort = _abort;
export default Ajax;