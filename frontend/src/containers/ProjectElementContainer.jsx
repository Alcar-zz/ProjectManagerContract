import { connect } from 'react-redux';
import ProjectElement from '../components/ProjectElement';
import { cancelProject, finalizeProject, handleParticipantsEvents, handleFileEvents, handlePaymentClaimedEvents } from '../redux/projectActions';

export default connect(
    (state, ownProps) => ({
        account: state.metamaskReducer.account,
        project: state.projectReducer[ownProps.address],
        isOwner: state.projectReducer.isOwner,
    }),
    {
        cancelProject,
        finalizeProject,
        handleParticipantsEvents,
        handleFileEvents,
        handlePaymentClaimedEvents,
    }
)(ProjectElement)
