import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import withLabelErrorsAndHelp from './withLabelErrorsAndHelp';

export const Input = styled.input`
  display: block;
  border-radius: 0.25rem;
  padding: 0.25rem;
  min-width: 15rem;
  border: 1px solid;

  &[data-has-errors="true"] {
    border-color: ${props => props.theme.errorColor};
  }
`;

const FormiflyField = (props) => {
    const {
        name,
        value,
        onChange,
        onFocus,
        onBlur,
        type,
        errors,
        id,
        inputClassName,
        required,
        min,
        max,
    } = props;

    const InputComponent = props.inputComponent ?? Input;

    return <InputComponent type={type}
                           value={value}
                           id={id}
                           name={name}
                           onChange={onChange}
                           onBlur={onBlur}
                           onFocus={onFocus}
                           data-has-errors={!!errors}
                           required={required}
                           min={min}
                           max={max}
                           className={'formifly-field-input formifly-' + type + '-field-input ' + (inputClassName ?? '')}
                           aria-describedby={props['aria-describedby']}
                           aria-required={props['aria-required']}
                           aria-invalid={props['aria-invalid']}/>;
};

export const fieldPropTypes = {
    'name': PropTypes.string.isRequired,
    'value': PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.array, PropTypes.bool]).isRequired,
    'onChange': PropTypes.func.isRequired,
    'onFocus': PropTypes.func.isRequired,
    'label': PropTypes.string.isRequired,
    'id': PropTypes.string.isRequired,
    'type': PropTypes.string.isRequired,
    'errors': PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    'help': PropTypes.string,
    'onBlur': PropTypes.func,
    'aria-invalid': PropTypes.bool,
    'aria-describedby': PropTypes.string,
    'className': PropTypes.string,
    'inputClassName': PropTypes.string,
    'labelClassName': PropTypes.string,
    'helpClassName': PropTypes.string,
    'errorClassName': PropTypes.string,
    'containerComponent': PropTypes.func,
    'inputComponent': PropTypes.func,
    'labelComponent': PropTypes.func,
    'errorComponent': PropTypes.func,
    'helpComponent': PropTypes.func,
    'labelNoMove': PropTypes.bool,
    'required': PropTypes.bool,
    'min': PropTypes.number,
    'max': PropTypes.number,
};

FormiflyField.propTypes = fieldPropTypes;

export default React.memo(withLabelErrorsAndHelp(FormiflyField));
