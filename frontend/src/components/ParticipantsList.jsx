import React from 'react';
import ParticipantDetailContainer from '../containers/ParticipantDetailContainer';


class ParticipantsList extends React.Component {

    constructor() {
        super();
        this.renderParticipantContent = this.renderParticipantContent.bind(this);
        this.renderOwnerContent = this.renderOwnerContent.bind(this);
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

    renderOwnerContent(participantAddress) {
        const { address } = this.props;
        return (
            <ParticipantDetailContainer 
                key={`participant-${participantAddress}`}
                participantAddress={participantAddress}
                address={address}
            />
        )
    }

    renderParticipantContent(participantAddress) {
        const { account } = this.props;
        if(account !== participantAddress) {
            return (
                <a
                    className="participant-wrapper"
                    key={`participant-${participantAddress}`}
                    href={`https://ropsten.etherscan.io/address/${participantAddress}`}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    {participantAddress}
                </a>
            )
        }
    }

    render() {
        const { participantsAddresses, isOwner } = this.props;
        return (
            <div className="project-element">
                <h3>Participants</h3>
                {participantsAddresses.map(isOwner ? (
                    this.renderOwnerContent
                ) : (
                    this.renderParticipantContent
                ))}
            </div>
        )
    }
}

export default ParticipantsList;