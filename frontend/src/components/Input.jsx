import React from 'react';
// css
import './css/Input.css'

class Input extends React.Component {

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    onChange({ target }) {
        if(typeof this.props.format === 'function') {
            this.props.format(target);
        }
        if(typeof this.props.inputProps.maxLength === 'number' && target.value) {
            target.value = target.value.substr(0, this.props.inputProps.maxLength)
        }
        this.props.onChange(target);
    }

    render() {
        const { label, inputProps, selectElements } = this.props;
        return (
            <fieldset className="project-fieldset">
                <label className="project-label" htmlFor={inputProps.id}>{label}</label>
                {inputProps.type !== 'select' ? (
                    <input
                        {...inputProps}
                        onChange={this.onChange}
                        className="project-input"
                    />
                ) : (
                    <select
                        {...inputProps}
                        className="project-input"
                        onChange={this.onChange}
                    >
                        {selectElements.map(element => (
                            <option
                                key={`option-${element}`}
                                value={element}
                            >
                                {element}
                            </option>
                        ))}
                    </select>
                )}
            </fieldset>
        )
    }
}

export default Input;