import { connect } from 'react-redux';
import Routes from '../routes/Routes';
import { changeAccount, setMetamask } from '../redux/metamaskActions';



export default connect(
    state => ({
        metamaskExist: state.metamaskReducer.metamaskExist
    }), 
    {
        changeAccount,
        setMetamask,
    }
)(Routes)
