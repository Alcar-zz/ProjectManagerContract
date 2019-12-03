import { connect } from 'react-redux';
import MyPayment from '../components/MyPayment';
import { claimPayment } from '../redux/projectActions';

export default connect(
    (state, ownProps) => {
        return {
            participant: state.projectReducer[ownProps.address] && state.projectReducer[ownProps.address][ownProps.account],
        }
    },
    {
        claimPayment
    }
)(MyPayment)