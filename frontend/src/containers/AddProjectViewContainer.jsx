import { connect } from 'react-redux';
import AddProjectView from '../components/AddProjectView';

export default connect(
    state => ({
        account: state.metamaskReducer.account,
    })
)(AddProjectView)
