import React from 'react';
// components
import Loader from './Loader';
// css


class AddFile extends React.Component {

    constructor() {
        super();
        this.uploadDocument = this.uploadDocument.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
    }

    state = {
        loading: false,
        success: false,
        error: false,
    }

    onChange({target}) {
        this.input = target;
        this.setState({ file: target.files[0] });
    }

    uploadDocument() {
        const { ipfs, account, project } = this.props;
        let fileReader = new FileReader();
        fileReader.onload = async () => {
            ipfs.add(Buffer.from(fileReader.result)).then(async (result) => {
                try {
                    await project.methods.addFile(result[0].path).send({
                        from: account,
                    })
                    this.setState({
                        file: "",
                        success: true,
                        loading: false
                    });
                } catch(err) {
                    console.log(err);
                    let errorType = /User denied transaction signature/i.test(err.message) ? "signature" : "txerror";
                    this.setState({
                        file: "",
                        success: false,
                        error: errorType,
                        loading: false
                    });
                }
                this.input.value = '';
            });
        };

        fileReader.readAsArrayBuffer(this.state.file);
    }

    deleteFile() {
        const { account, project } = this.props;
        this.setState({
            loading: true, success: null, error: null
        });
        project.methods.addFile("").send({
            from: account,
        })
        .then(() => this.setState({
            success: 'delete',
            loading: false
        }))
        .catch((err) => {
            console.log(err);
            let errorType = /User denied transaction signature/i.test(err.message) ? "signature" : "delete";
            this.setState({
                success: false,
                error: errorType,
                loading: false
            });
        })
    }

    onSubmit(e) {
        e.preventDefault();
        if(this.props.loading || !this.state.file) return;
        this.setState({ loading: true, success: null, error: null });
        this.uploadDocument();
    }

    renderMessange() {
        const { success, error } = this.state;
        if(success) {
            return (
                <div className="success-message flex-c-h-center">
                    <p className="message-title">File {success !== 'delete' ? 'added' : 'deleted'} successfully.</p>
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
                            <p className="message-title">Failed to {error !== 'delete' ? 'add' : 'delete'} file.</p>
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
        const { success, error, loading, file } = this.state;
        const { fileHash } = this.props;
        return (
            <div className="project-element">
                <h3>{fileHash === "" ? 'Add' : 'Replace'} File</h3>
                <form
                    onSubmit={this.onSubmit}
                    className="add-project-form"
                >
                    <fieldset>
                        <label className="ipfs-label" htmlFor="ipfs-file">{file ? 'File selected' : 'Select File'}</label>
                        <input name="file" type="file" id="ipfs-file" hidden required onChange={this.onChange}/> 
                    </fieldset>
                    
                    <div className="add-project-submit-wrapper flex-r-h-center">
                        {loading ? (
                            <Loader 
                                size="small"
                            />
                        ) : (
                            fileHash === "" ? (
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Add
                                </button>
                            ) : (
                                <React.Fragment>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={this.deleteFile}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Replace
                                    </button>
                                </React.Fragment>
                            )
                        )}
                    </div>
                </form>

                {(error || success) && (
                    <div className="flex-r-h-center">
                        {this.renderMessange()}
                    </div>
                )}
            </div>
        )
    }
}

export default AddFile;