import { connect } from 'react-redux';
import HomeView from '../components/HomeView';
import { loadProject } from '../redux/projectActions';



export default connect(
    state => ({
        metamaskExist: state.metamaskReducer.metamaskExist,
        account: state.metamaskReducer.account,
        loading: state.projectReducer.loading,
        isOwner: state.projectReducer.isOwner,
        projectsAddresses: state.projectReducer.projectsAddresses,
    }),
    {
        loadProject
    }
)(HomeView)
