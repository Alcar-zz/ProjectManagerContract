import React from 'react';
import Input from './Input';
import { projectAbi } from '../utils/contracts';
// components
import Loader from './Loader';
// css
import './css/AddParticipantForm.css'
import BigNumber from 'bignumber.js';
import { isValidAddress } from '../utils/functions';


class AddParticipantForm extends React.Component {

    constructor(props) {
        super();
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.Project = new window.web3.eth.Contract(projectAbi,props.address);
    }

    state = {
        loading: false,
        success: false,
        error: false,
    }

    onChange({name, value}) {
        this[name] = value;
    }

    formatAddress(target) {
        target.value = '0x' + target.value.replace(/0x|[^0-9a-f]/gi, '');
    }

    formatPayment(target) {
        target.value = target.value.replace(/[^\d]|^0(?=[1-9])/g, '').replace(/^0+$/,'0');
    }

    getMultiplier(multiplier) {
        switch(multiplier) {
            case 'ether':
                return 1000000000000000000;
            case 'finney':
                return 1000000000000000;
            case 'gwei':
                return 1000000000;
            default:
                return 1;
        }
    }

    onSubmit(e) {
        e.preventDefault();
        if(this.props.loading) return;
        if(!isValidAddress(this.participant)) {
            this.setState({ error: "address" });
            return;
        }
        const payment = new BigNumber(this.payment);
        if(payment.isZero()) {
            this.setState({ error: "value" });
            return;
        }
        this.setState({ loading: true, success: null, error: null });
        this.Project.methods.addParticipant(this.participant).send({
            from: this.props.account,
            value: new BigNumber(this.payment).multipliedBy(this.getMultiplier(this['payment-unit'])).toString()
        })
        .then(tx => {
            this.setState({ loading: false, success: true }, () => {
                const form = document.getElementById('add-project-form');
                if(form) {
                    form.reset();
                }
                delete this.payment;
                delete this.participant;
                delete this['payment-unit'];
            });
        })
        .catch(err => {
            let errorType = /User denied transaction signature/i.test(err.message) ? "signature" : "txerror";
            this.setState({ loading: false, error: errorType });
        });
    }

    renderMessange() {
        const { success, error } = this.state;
        if(success) {
            return (
                <div className="success-message flex-c-h-center">
                    <p className="message-title">Participant added successfully.</p>
                    <p className="message-tx">You can see the details in Metamask.</p>
                </div>
            )
        }
        if(error) {
            let ErrorComponent;
            switch(error) {
                case 'signature': 
                    ErrorComponent = <p>Trasaction canceled</p>
                    break;
                case 'address': 
                    ErrorComponent = <p>Invalid participant's address</p>
                    break;
                case 'value': 
                    ErrorComponent = <p>Invalid participant's payment value</p>
                    break;
                default:
                    ErrorComponent = (
                        <React.Fragment>
                            <p className="message-title">Failed to add Participant.</p>
                            <p className="message-tx">You can see the reason in Metamask.</p>
                        </React.Fragment>
                    )
                    break;
            }
            return (
                <div className="error-message flex-c-h-center">
                    {ErrorComponent}
                </div>
            )
        }
    }

    render() {
        const { success, error, loading } = this.state;
        return (
            <div className="project-element">
                <h3>Add Participant</h3>
                <form
                    onSubmit={this.onSubmit}
                    id="add-project-form"
                    className="add-project-form"
                >
                    <Input 
                        label="Participant Address"
                        htmlFor="participant-input"
                        inputProps={{
                            required: true,
                            id: 'participant-input',
                            name: "participant",
                            maxLength: 42,
                            disabled: loading,
                            placeholder: '0x0000000000000000000000000000000000000000'
                        }}
                        format={this.formatAddress}
                        onChange={this.onChange}
                    />
                    <div className="flex-container flex-wrap payment-inputs">
                        <Input 
                            label="Payment Unit"
                            htmlFor="payment-unit-input"
                            inputProps={{
                                required: true,
                                id: 'payment-unit-input',
                                name: "payment-unit",
                                disabled: loading,
                                type: 'select',
                                defaultValue: 'wei'
                            }}
                            selectElements={[
                                'ether',
                                'finney',
                                'gwei',
                                'wei'
                            ]}
                            onChange={this.onChange}
                        />
                        <Input 
                            label="Payment"
                            htmlFor="payment-input"
                            inputProps={{
                                required: true,
                                id: 'payment-input',
                                name: "payment",
                                maxLength: 128,
                                disabled: loading
                            }}
                            format={this.formatPayment}
                            onChange={this.onChange}
                        />
                    </div>
                    <div className="add-project-submit-wrapper flex-r-h-center">
                        {loading ? (
                            <Loader 
                                size="small"
                            />
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Add
                            </button>
                        )}
                    </div>
                </form>

                {(error || success) && (
                    <div className="flex-r-h-center">
                        {this.renderMessange()}
                    </div>
                )}
            </div>
        )
    }
}

export default AddParticipantForm;