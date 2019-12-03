import React from 'react';
import Input from './Input';
import Web3 from 'web3';
import { projectManagerAbi, contractAddress, projectAbi } from '../utils/contracts';
// components
import Loader from './Loader';
// css
import './css/AddProjectView.css'


class AddProjectView extends React.Component {

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.web3 = new Web3(window.web3.currentProvider);
        this.ProjectManager = new this.web3.eth.Contract(projectManagerAbi, contractAddress);
        this.Project = new this.web3.eth.Contract(projectAbi);
    }

    componentDidMount() {
        this.tx = "0xe8739c14ada03476c242b317e9851b5d9df11d7c8cfc4f91055447d810c0d461";
        // window.web3.eth.getTransaction(this.tx)
        //     .then(console.log)
        //     .catch(console.log);
    }

    state = {
        loading: false,
        success: false,
        error: false,
    }

    onChange({value}) {
        this.name = value;
    }

    formatName(target) {
        target.value = target.value.replace(/^\s+$/, '');
    }

    onSubmit(e) {
        e.preventDefault();
        if(this.props.loading) return;
        this.setState({ loading: true, success: null, error: null });
        this.ProjectManager.methods.addProject(this.name.trim()).send({
            from: this.props.account
        })
        .then(tx => {
            console.log(tx);
            this.setState({ loading: false, success: true });
        })
        .catch(err => {
            let errorType = /User denied transaction signature/i.test(err.message) ? "signature" : "txerror";
            this.setState({ loading: false, error: errorType });
        });
    }

    renderMessange() {
        const { success, error } = this.state;
        if(success) {
            return (
                <div className="success-message flex-c-h-center">
                    <p className="message-title">Project added successfully.</p>
                    <p className="message-tx">You can see the details in Metamask.</p>
                </div>
            )
        }
        if(error) {
            let ErrorComponent;
            switch(error) {
                case 'signature': 
                    ErrorComponent = <p>Trasaction canceled</p>
                    break;
                default:
                    ErrorComponent = (
                        <React.Fragment>
                            <p className="message-title">Failed to add project.</p>
                            <p className="message-tx">You can see the reason in Metamask.</p>
                        </React.Fragment>
                    )
                    break;
            }
            return (
                <div className="error-message flex-c-h-center">
                    {ErrorComponent}
                </div>
            )
        }
    }

    render() {
        const { success, error, loading } = this.state;
        return (
            <main className="add-project-main flex-1 flex-c-v-center">
                <div className="add-project-content">
                    <h2>Add Project</h2>
                    <form
                        onSubmit={this.onSubmit}
                        className="add-project-form"
                    >
                        <Input 
                            label="Project Name"
                            htmlFor="name-input"
                            inputProps={{
                                required: true,
                                id: 'name-input',
                                name: "name",
                                maxLength: 128,
                                disabled: loading
                            }}
                            format={this.formatName}
                            onChange={this.onChange}
                        />
                        
                        <div className="add-project-submit-wrapper flex-r-h-center">
                            {loading ? (
                                <Loader 
                                    size="small"
                                />
                            ) : (
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Add
                                </button>
                            )}
                        </div>
                    </form>

                    {(error || success) && (
                        <div className="flex-r-h-center">
                            {this.renderMessange()}
                        </div>
                    )}
                </div>
            </main>
        )
    }
}

export default AddProjectView;