import React from 'react';
// css
import './css/ParticipantDetails.css';
import BigNumber from 'bignumber.js';


class ParticipantDetails extends React.Component {

    formatPayment(payment) {
        const bn = new BigNumber(payment);
        if(bn.isEqualTo(1000000000000000000)) {
            return "1 ether";
        }
        return `${new BigNumber(payment).dividedBy(1000000000000000000)} ethers`
    }

    render() {
        const { participant } = this.props;
        return (
            <div className="participant-wrapper">
                <a
                    className="participant-wrapper"
                    key={`participant-${participant.address}`}
                    href={`https://ropsten.etherscan.io/address/${participant.address}`}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    {participant.address}
                </a>
                <p><span>Payment:</span>{this.formatPayment(participant.payment)}</p>
                <p className={participant.didClaim ? "claimed" : "not-claimed"}>{participant.didClaim ? "Claimed" : "Not Claimed"}</p>
            </div>
        )
    }
}

export default ParticipantDetails;