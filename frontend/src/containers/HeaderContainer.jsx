import { connect } from 'react-redux';
import Header from '../components/Header';

export default connect(
    state => ({
        metamaskExist: state.metamaskReducer.metamaskExist,
        account: state.metamaskReducer.account,
    })
)(Header)
