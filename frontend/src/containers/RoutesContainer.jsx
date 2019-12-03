import { connect } from 'react-redux';
import Routes from '../routes/Routes';
import { changeAccount, setMetamask } from '../redux/metamaskActions';
import { addProject, finalizeProjectEvent, cancelProjectEvent } from '../redux/projectActions';


export default connect(
    state => ({
        metamaskExist: state.metamaskReducer.metamaskExist,
        account: state.metamaskReducer.account,
        isOwner: state.projectReducer.isOwner,
    }), 
    {
        changeAccount,
        setMetamask,
        addProject,
        finalizeProjectEvent,
        cancelProjectEvent,
    }
)(Routes)
