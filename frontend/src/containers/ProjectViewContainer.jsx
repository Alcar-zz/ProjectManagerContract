import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ProjectView from '../components/ProjectView';
import {
    cancelProject, finalizeProject, handleParticipantsEvents,
    handleFileEvents, addProject, addParticipants, handlePaymentClaimedEvents
} from '../redux/projectActions';


export default withRouter(connect(
    (state, ownProps) => ({
        account: state.metamaskReducer.account,
        project: state.projectReducer[ownProps.match.params.address],
        address: ownProps.match.params.address,
        isOwner: state.projectReducer.isOwner,
    }),
    {
        cancelProject,
        finalizeProject,
        handleParticipantsEvents,
        handleFileEvents,
        addProject,
        addParticipants,
        handlePaymentClaimedEvents,
    }
)(ProjectView))
