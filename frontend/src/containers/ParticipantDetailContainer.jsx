import { connect } from 'react-redux';
import ParticipantDetails from '../components/ParticipantDetails';

export default connect(
    (state, ownProps) => {
        return {
            participant: state.projectReducer[ownProps.address] && state.projectReducer[ownProps.address][ownProps.participantAddress],
        }
    }
)(ParticipantDetails)
