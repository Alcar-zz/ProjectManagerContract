import React from 'react';
// css
// import './css/MyPayment.css';
import BigNumber from 'bignumber.js';
import Loader from './Loader';


class MyPayment extends React.Component {

    constructor() {
        super();
        this.claimPayment = this.claimPayment.bind(this);
    }

    state = {
        loading: false
    }

    claimPayment() {
        const { loading } = this.state;
        const { account, address } = this.props;
        if(loading) return;
        this.setState({ loading: true });
        this.props.claimPayment(
            this.props.project.methods.claimPayment().send({
                from: account,  
            }),
            address,
            account
        )
        .catch(console.log)
        .finally(() => {
            this.setState({ loading: false });
        })
    }

    formatPayment(payment) {
        const bn = new BigNumber(payment);
        if(bn.isEqualTo(1000000000000000000)) {
            return "1 ether";
        }
        return `${new BigNumber(payment).dividedBy(1000000000000000000)} ethers`
    }

    render() {
        const { participant, isClosed } = this.props;
        const { loading } = this.state;
        return (
            <div className="project-element">
                <h3>My Payment</h3>
                <div className="flex-c-h-center">
                    <p className="my-payment-amount">{this.formatPayment(participant.payment)}</p>
                    {participant.didClaim ? (
                        <p className="my-payment-claimed">Claimed</p>
                    ) : (
                        loading ?  (
                            <Loader 
                                size="small"
                            />
                        ) : (
                            isClosed ? (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={this.claimPayment}
                                >
                                    Claim
                                </button>
                            ) : (
                                <p className="my-payment-not-closed-message">You have to have to wait for the project to finalize to claim your payment.</p>
                            )
                        )
                    )}
                </div>
            </div>
        )
    }
}

export default MyPayment;