import { connect } from 'react-redux';
import HomeView from '../components/HomeView';

export default connect(
    state => ({
        metamaskExist: state.metamaskReducer.metamaskExist,
    })
)(HomeView)
